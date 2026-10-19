
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
import { errorHandle } from '../utils/error.js'

export const signup = async (req, res, next) => {
  const { username, password, email } = req.body

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required.",
    })
  }

  const hashedPassword = bcryptjs.hashSync(password, 10)
  const newUser = new User({ username, password: hashedPassword, email })

  try {
    await newUser.save()

    res.status(201).json({
      success: true,
      message: "User saved successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(errorHandle(400, "Email and password are required"))
  }
  if (!process.env.JWT_SECRET) {
    return next(errorHandle(500, "JWT_SECRET is not configured"))
  }

  try {
    const validUser = await User.findOne({ email })
    if (!validUser) {
      return next(errorHandle(404, "User not found"))
    }

    const isMatch = bcryptjs.compareSync(password, validUser.password)
    if (!isMatch) {
      return next(errorHandle(401, "Invalid credentials"))
    }

    const token = jwt.sign(
      { id: validUser._id.toString(), username: validUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    )

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Signed in successfully",
        data: {
          id: validUser._id,
          username: validUser.username,
          email: validUser.email,
          avatar: validUser.avatar,
        },
      })
  } catch (error) {
    return next(error)
  }
}
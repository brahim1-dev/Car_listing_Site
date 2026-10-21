
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js'
import { errorHandle } from '../utils/error.js'

const sendAuthenticatedUser = (res, user, message) => {
  const token = jwt.sign(
    { id: user._id.toString(), username: user.username },
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
      message,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    })
}

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
    if (!validUser.password) {
      return next(errorHandle(401, "Invalid credentials"))
    }

    const isMatch = bcryptjs.compareSync(password, validUser.password)
    if (!isMatch) {
      return next(errorHandle(401, "Invalid credentials"))
    }

    return sendAuthenticatedUser(res, validUser, "Signed in successfully")
  } catch (error) {
    return next(error)
  }
}

export const google = async (req, res, next) => {
  const { credential } = req.body
  const googleClientId = process.env.GOOGLE_CLIENT_ID

  if (!credential) {
    return next(errorHandle(400, "Google credential is required"))
  }
  if (!googleClientId) {
    return next(errorHandle(500, "GOOGLE_CLIENT_ID is not configured"))
  }
  if (!process.env.JWT_SECRET) {
    return next(errorHandle(500, "JWT_SECRET is not configured"))
  }

  let googleUser
  try {
    const client = new OAuth2Client(googleClientId)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    })
    googleUser = ticket.getPayload()
  } catch {
    return next(errorHandle(401, "Invalid Google credential"))
  }

  if (!googleUser?.email || googleUser.email_verified !== true) {
    return next(errorHandle(401, "Google account email is not verified"))
  }

  try {
    let user = await User.findOne({ email: googleUser.email })

    if (!user) {
      const usernameBase = (googleUser.name || googleUser.email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "") || "user"
      let username = usernameBase
      let suffix = 1

      while (await User.exists({ username })) {
        username = `${usernameBase}${suffix}`
        suffix += 1
      }

      user = await User.create({
        username,
        email: googleUser.email,
        avatar: googleUser.picture,
      })
    }

    return sendAuthenticatedUser(res, user, "Signed in with Google successfully")
  } catch (error) {
    return next(error)
  }
}

export const signout = (req, res) => {
  return res
    .clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    .status(200)
    .json({ success: true, message: "Signed out successfully" })
}
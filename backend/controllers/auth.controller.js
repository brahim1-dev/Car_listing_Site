
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'

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
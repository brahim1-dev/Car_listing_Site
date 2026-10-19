
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'

export const signup = async (req, res) =>{
  // console.log(req.body)
  const {username, password, email} = req.body
// let's hash the password
  const hashedPassword = bcryptjs.hashSync(password, 10)
  //Save user data into object
  const newUser = new User({ username, password: hashedPassword, email})

  // save the user to mongodb
  try {
    await newUser.save()

    res.status(201).json({
      success: true,
      message:"User saved successfully",
      data: newUser,
    })
  } catch (error) {
    // res.status(400).json({ error: error.message})
    next(error);
  }
}
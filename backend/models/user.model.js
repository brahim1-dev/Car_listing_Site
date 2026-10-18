import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar:{
    type: String,
    default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQH4FKwd_Dpyu0Roq5bNRhlUQXpdgRGKqn_bDl4zN95A&s=10",
  },

},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User;



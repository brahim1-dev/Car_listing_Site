import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/user.router.js'
import authRouter from './routes/auth.router.js';

dotenv.config();

const app = express();
app.use(express.json())


app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)

const port = process.env.PORT || 4000;

app.use((error, req, res, next )=>{
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json({success: false, statusCode, message})
})

const startServer = async () => {
  try {
    await connectDB()
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error("Application startup failed:", error.message)
    process.exitCode = 1
  }
}

startServer()

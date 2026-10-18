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

const startServer = async () => {
  try {
    await connectDB();
    await new Promise((resolve, reject) => {
      const server = app.listen(port, resolve);
      server.once("error", reject);
    });
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();

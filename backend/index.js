import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/user.router.js'
dotenv.config();

const app = express();


app.use("/api/user", userRouter)

const port = process.env.PORT || 4000;

app.listen(port, ()=> {
  connectDB();
  console.log(`Server is running on port ${port}`)
})

// const startServer = async () => {
//   await connectDB();
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// };

// startServer().catch((error) => {
//   console.error("Application startup failed:", error.message);
//   process.exitCode = 1;
// });

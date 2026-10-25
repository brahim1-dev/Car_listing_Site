import dns from "node:dns";
import mongoose from "mongoose";

const isSrvResolverRefusal = (error) =>
  error?.syscall === "querySrv" && error?.code === "ECONNREFUSED";

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_listing_site";

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    if (isSrvResolverRefusal(error)) {
      console.warn("System DNS refused the MongoDB Atlas SRV lookup; retrying with public DNS.");
      dns.setServers(["8.8.8.8", "1.1.1.1"]);

      try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully using public DNS.");
        return;
      } catch (retryError) {
        throw new Error(`MongoDB connection failed after the Atlas DNS retry: ${retryError.message}`, {
          cause: retryError,
        });
      }
    }

    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
};

export default connectDB;

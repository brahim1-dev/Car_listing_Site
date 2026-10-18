import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_listing_site";

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
};

export default connectDB;

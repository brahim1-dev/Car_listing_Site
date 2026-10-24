import mongoose from "mongoose";

const carListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
    default: "",
  },
  year: {
    type: Number,
    required: true,
    min: 1886,
    max: new Date().getFullYear() + 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  offer: {
    type: Boolean,
    default: false,
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 99,
    default: 0,
  },
  mileage: {
    type: Number,
    required: true,
    min: 0,
  },
  fuelType: {
    type: String,
    required: true,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
  },
  transmission: {
    type: String,
    required: true,
    enum: ["Automatic", "Manual", "CVT"],
  },
  condition: {
    type: String,
    required: true,
    enum: ["New", "Used", "Damaged"],
  },
  imageURLs: {
    type: [{ type: String, trim: true }],
    required: true,
    validate: {
      validator: (images) => images.length > 0,
      message: "At least one car image is required.",
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Sale", "Rent"],
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sellerName: {
    type: String,
    trim: true,
    default: "",
  },
  sellerEmail: {
    type: String,
    trim: true,
    select: false,
  },
}, {
  timestamps: true,
});

const CarListing = mongoose.model("CarListing", carListingSchema);
export default CarListing;
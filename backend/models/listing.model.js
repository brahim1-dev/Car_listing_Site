import mongoose  from "mongoose";

const carListingSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true //
  },
  description:{
    type:String,
    required:true // Toyota, Nissan
  },
  make:{
    type:String,
    required:true // Camry, RAV
  },
  year:{
    type:Number,
    required:true //
  },
  price:{
    type:Number,
    required:true //
  },
  offer:{
    type:Boolean
  },
  mileage:{
    type:Number,
    required:true//150000
  },
  fuelType:{
    type:String,
    required:true,
    enum:["Petrol", "Diesel", "Electric", "Hyprid"]
  },
  transmission:{
    type:String,
    required:true,
    enum:["Automatic", "Manual", "CVT"]
  },
  condition:{
    type:String,
    required:true,
    enum:["New", "Used", "Damaged"]
  },
  imageURLs:{
    type:Array,
    required:true,
  },
  location:{
    type:String,
    required:true,
  },
  type:{
    type:String,
    enum:["Sale","Rent" ]
  },
},{
  timestamps:true
})

const CarListing = mongoose.model("CarListing", carListingSchema )
export default CarListing
import mongoose from "mongoose";
import CarListing from "../models/listing.model.js";

const editableFields = [
  "name",
  "description",
  "make",
  "model",
  "year",
  "price",
  "offer",
  "discountPercent",
  "mileage",
  "fuelType",
  "transmission",
  "condition",
  "imageURLs",
  "location",
  "type",
];

const getListingData = (body) =>
  Object.fromEntries(
    editableFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]]),
  );

const validateListingData = (data, { partial = false } = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be a JSON object.";
  }

  const missingFields = editableFields.filter(
    (field) =>
      !partial &&
      !["offer", "model", "discountPercent"].includes(field) &&
      (data[field] === undefined || data[field] === null || data[field] === ""),
  );
  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(", ")}.`;
  }

  if (data.imageURLs !== undefined) {
    if (
      !Array.isArray(data.imageURLs) ||
      data.imageURLs.length === 0 ||
      data.imageURLs.some(
        (url) =>
          typeof url !== "string" ||
          !URL.canParse(url) ||
          !["http:", "https:"].includes(new URL(url).protocol),
      )
    ) {
      return "imageURLs must be a non-empty array of valid HTTP or HTTPS URLs.";
    }
  }

  for (const field of ["year", "price", "mileage"]) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "number" || !Number.isFinite(data[field]))
    ) {
      return `${field} must be a valid number.`;
    }
  }
  if (data.offer !== undefined && typeof data.offer !== "boolean") {
    return "offer must be a boolean.";
  }
  if (
    data.discountPercent !== undefined &&
    (typeof data.discountPercent !== "number" ||
      !Number.isInteger(data.discountPercent) ||
      data.discountPercent < 0 ||
      data.discountPercent > 99)
  ) {
    return "discountPercent must be a whole number from 0 to 99.";
  }
  if (data.offer === true && !(data.discountPercent >= 1 && data.discountPercent <= 99)) {
    return "Enter a discount from 1% to 99% when an offer is enabled.";
  }
  if (data.offer === false && data.discountPercent > 0) {
    return "Turn on Offer to apply a discount.";
  }

  return null;
};

const sendValidationError = (res, message) =>
  res.status(400).json({ success: false, message });

const serializeListing = (listing) => ({
  ...listing.toObject(),
  id: listing._id.toString(),
});

export const createListing = async (req, res, next) => {
  const validationError = validateListingData(req.body);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const listingData = getListingData(req.body);
    if (!listingData.offer) {
      listingData.discountPercent = 0;
    }
    const listing = await CarListing.create({
      ...listingData,
      userId: req.firebaseUser.sub,
    });

    return res.status(201).json({
      success: true,
      message: "Car listing created successfully.",
      data: serializeListing(listing),
    });
  } catch (error) {
    return next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.fuelType) filter.fuelType = req.query.fuelType;
    if (req.query.transmission) filter.transmission = req.query.transmission;

    const listings = await CarListing.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings.map(serializeListing),
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const listings = await CarListing.find({ userId: req.firebaseUser.sub })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings.map(serializeListing),
    });
  } catch (error) {
    return next(error);
  }
};

export const getListing = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid listing ID." });
  }

  try {
    const listing = await CarListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Car listing not found." });
    }

    return res.status(200).json({ success: true, data: serializeListing(listing) });
  } catch (error) {
    return next(error);
  }
};

export const updateListing = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid listing ID." });
  }

  const validationError = validateListingData(req.body, { partial: true });
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const changes = getListingData(req.body);
  if (changes.offer === false) {
    changes.discountPercent = 0;
  }
  if (!Object.keys(changes).length) {
    return sendValidationError(res, "Provide at least one listing field to update.");
  }

  try {
    const listing = await CarListing.findOneAndUpdate(
      { _id: req.params.id, userId: req.firebaseUser.sub },
      { $set: changes },
      { new: true, runValidators: true },
    );
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Car listing not found or you do not own it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car listing updated successfully.",
      data: serializeListing(listing),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid listing ID." });
  }

  try {
    const listing = await CarListing.findOneAndDelete({
      _id: req.params.id,
      userId: req.firebaseUser.sub,
    });
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Car listing not found or you do not own it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car listing deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

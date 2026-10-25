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
      data.imageURLs.length > 6 ||
      data.imageURLs.some(
        (url) =>
          typeof url !== "string" ||
          !URL.canParse(url) ||
          !["http:", "https:"].includes(new URL(url).protocol),
      )
    ) {
      return "imageURLs must contain 1 to 6 valid HTTP or HTTPS URLs.";
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

const serializeListing = (listing) => {
  const data = listing.toObject();
  delete data.sellerEmail;
  return {
    ...data,
    id: listing._id.toString(),
  };
};

export const createListing = async (req, res, next) => {
  const validationError = validateListingData(req.body);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const sellerEmail =
    typeof req.firebaseUser.email === "string"
      ? req.firebaseUser.email.trim()
      : "";
  if (!sellerEmail) {
    return res.status(400).json({
      success: false,
      message:
        "Your signed-in account needs an email address before you can create a listing, so buyers can contact you.",
    });
  }

  try {
    const listingData = getListingData(req.body);
    if (!listingData.offer) {
      listingData.discountPercent = 0;
    }
    const sellerName =
      (typeof req.firebaseUser.name === "string" && req.firebaseUser.name.trim()) ||
      sellerEmail.split("@")[0] ||
      "Car owner";

    await CarListing.updateMany(
      { userId: req.firebaseUser.sub },
      {
        $set: {
          sellerEmail,
          sellerName,
        },
      },
    );

    const listing = await CarListing.create({
      ...listingData,
      userId: req.firebaseUser.sub,
      sellerName,
      sellerEmail,
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
    const query = req.query.q;
    if (query !== undefined) {
      if (typeof query !== "string" || query.trim().length > 100) {
        return sendValidationError(res, "Search terms must be 100 characters or fewer.");
      }

      const term = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (term) {
        const expression = new RegExp(term, "i");
        filter.$or = ["name", "make", "model", "description", "location"].map(
          (field) => ({ [field]: expression }),
        );
        const numericTerm = Number(term.replace(/,/g, ""));
        if (Number.isFinite(numericTerm)) {
          filter.$or.push(
            { year: numericTerm },
            { price: numericTerm },
            { mileage: numericTerm },
          );
        }
      }
    }

    const types = req.query.type === undefined
      ? []
      : (Array.isArray(req.query.type) ? req.query.type : [req.query.type])
        .flatMap((value) => typeof value === "string" ? value.split(",") : value)
        .filter(Boolean);
    if (types.some((type) => !["Sale", "Rent"].includes(type))) {
      return sendValidationError(res, "type must be Sale or Rent.");
    }
    if (types.length === 1) filter.type = types[0];
    if (types.length > 1) filter.type = { $in: [...new Set(types)] };

    const enumFilters = {
      condition: ["New", "Used", "Damaged"],
      fuelType: ["Petrol", "Diesel", "Electric", "Hybrid"],
      transmission: ["Automatic", "Manual", "CVT"],
    };
    for (const [field, allowedValues] of Object.entries(enumFilters)) {
      const value = req.query[field];
      if (value === undefined) continue;
      if (typeof value !== "string" || !allowedValues.includes(value)) {
        return sendValidationError(
          res,
          `${field} must be one of: ${allowedValues.join(", ")}.`,
        );
      }
      filter[field] = value;
    }

    if (req.query.offer !== undefined) {
      if (!["true", "false"].includes(req.query.offer)) {
        return sendValidationError(res, "offer must be true or false.");
      }
      filter.offer = req.query.offer === "true";
    }

    const numericFilters = [
      ["minPrice", "price", "$gte"],
      ["maxPrice", "price", "$lte"],
      ["minYear", "year", "$gte"],
      ["maxYear", "year", "$lte"],
    ];
    for (const [parameter, field, operator] of numericFilters) {
      const value = req.query[parameter];
      if (value === undefined || value === "") continue;
      const number = Number(value);
      if (
        typeof value !== "string" ||
        !Number.isFinite(number) ||
        number < 0 ||
        (field === "year" && !Number.isInteger(number))
      ) {
        return sendValidationError(
          res,
          `${parameter} must be a non-negative ${field === "year" ? "whole number" : "number"}.`,
        );
      }
      filter[field] = { ...filter[field], [operator]: number };
    }

    if (
      filter.year?.$gte !== undefined &&
      filter.year?.$lte !== undefined &&
      filter.year.$gte > filter.year.$lte
    ) {
      return sendValidationError(res, "minYear cannot be greater than maxYear.");
    }
    if (
      filter.price?.$gte !== undefined &&
      filter.price?.$lte !== undefined &&
      filter.price.$gte > filter.price.$lte
    ) {
      return sendValidationError(res, "minPrice cannot be greater than maxPrice.");
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1, createdAt: -1 },
      price_desc: { price: -1, createdAt: -1 },
      year_desc: { year: -1, createdAt: -1 },
      year_asc: { year: 1, createdAt: -1 },
    };
    const sortBy = req.query.sort || "newest";
    if (typeof sortBy !== "string" || !sortOptions[sortBy]) {
      return sendValidationError(
        res,
        `sort must be one of: ${Object.keys(sortOptions).join(", ")}.`,
      );
    }

    const [listings, count] = await Promise.all([
      CarListing.find(filter).sort(sortOptions[sortBy]).limit(100),
      CarListing.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      count,
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

export const syncMyListingContact = async (req, res, next) => {
  const email =
    typeof req.firebaseUser.email === "string"
      ? req.firebaseUser.email.trim()
      : "";
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Your signed-in account does not have an email address.",
    });
  }

  try {
    const result = await CarListing.updateMany(
      { userId: req.firebaseUser.sub },
      {
        $set: {
          sellerEmail: email,
          sellerName:
            (typeof req.firebaseUser.name === "string" &&
              req.firebaseUser.name.trim()) ||
            email.split("@")[0],
        },
      },
    );

    return res.status(200).json({
      success: true,
      updatedCount: result.modifiedCount,
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

export const getListingContact = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid listing ID." });
  }

  try {
    const listing = await CarListing.findById(req.params.id).select("+sellerEmail");
    if (!listing) {
      return res.status(404).json({ success: false, message: "Car listing not found." });
    }
    if (listing.userId === req.firebaseUser.sub) {
      return res.status(403).json({
        success: false,
        message: "This is your listing.",
      });
    }
    if (!listing.sellerEmail) {
      return res.status(404).json({
        success: false,
        message:
          "The seller needs to sign in and open their profile once to enable contact on this listing.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { email: listing.sellerEmail },
    });
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
  if (typeof req.firebaseUser.email === "string") {
    changes.sellerEmail = req.firebaseUser.email;
  }
  if (typeof req.firebaseUser.name === "string" && req.firebaseUser.name.trim()) {
    changes.sellerName = req.firebaseUser.name.trim();
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

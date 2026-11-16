
import Wishlist from "../model/wishlist.js";
import asyncHandler from "express-async-handler";

// =========================
// ADD TO WISHLIST
// =========================

export const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.create({
    user: req.user.id,
    product: req.body.product,
  });

  // Return product populated
  const populatedWishlist = await Wishlist.findById(wishlist._id)
    .populate("product");

  res.status(201).json(populatedWishlist);
});

// =========================
// GET WISHLIST
// =========================

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.find({
    user: req.user.id,
  }).populate("product");

  res.json(wishlist);
});

// =========================
// REMOVE WISHLIST
// =========================

export const removeWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);

  res.json({
    message: "Removed successfully",
  });
});

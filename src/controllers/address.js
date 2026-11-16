import asyncHandler from "express-async-handler";
import Address from "../model/addressModel.js";

// GET MY ADDRESSES
export const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({
    user: req.user._id,
  }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    addresses,
  });
});

// ADD ADDRESS
export const createAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    city,
    district,
    address,
    notes,
    isDefault,
  } = req.body;

  if (!fullName || !phone || !city || !address) {
    return res.status(400).json({
      success: false,
      message: "Full name, phone, city and address are required",
    });
  }

  if (isDefault) {
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );
  }

  const addressData = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    city,
    district,
    address,
    notes,
    isDefault: Boolean(isDefault),
  });

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    address: addressData,
  });
});

// UPDATE ADDRESS
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );
  }

  Object.assign(address, req.body);

  await address.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    address,
  });
});

// DELETE ADDRESS
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  await address.deleteOne();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

// SET DEFAULT ADDRESS
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  await Address.updateMany(
    { user: req.user._id },
    { $set: { isDefault: false } }
  );

  address.isDefault = true;

  await address.save();

  res.status(200).json({
    success: true,
    message: "Default address updated",
    address,
  });
});
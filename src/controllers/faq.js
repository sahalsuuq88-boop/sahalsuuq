import asyncHandler from "express-async-handler";
import FAQ from "../model/faq.js";

// GET ACTIVE FAQS
export const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({
    isActive: true,
  }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    faqs,
  });
});

// GET ALL FAQS - ADMIN
export const getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    faqs,
  });
});

// CREATE FAQ
export const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);

  res.status(201).json({
    success: true,
    message: "FAQ created successfully",
    faq,
  });
});

// UPDATE FAQ
export const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: "FAQ not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "FAQ updated successfully",
    faq,
  });
});

// DELETE FAQ
export const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: "FAQ not found",
    });
  }

  await faq.deleteOne();

  res.status(200).json({
    success: true,
    message: "FAQ deleted successfully",
  });
});
import asyncHandler from "express-async-handler";
import Contact from "../model/contect.js";

// CREATE MESSAGE
export const createContact = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    message,
  } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const contact = await Contact.create({
    firstName,
    lastName,
    email,
    message,
  });

  res.status(201).json({
    success: true,
    message: "Your message has been sent successfully",
    contact,
  });
});

// GET ALL MESSAGES
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    contacts,
  });
});

// GET ONE MESSAGE
export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// UPDATE STATUS
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  contact.status = status;

  await contact.save();

  res.status(200).json({
    success: true,
    message: "Message status updated",
    contact,
  });
});

// DELETE MESSAGE
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});
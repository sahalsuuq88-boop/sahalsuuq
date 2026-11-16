import asyncHandler from "express-async-handler";
import Expense from "../model/expenses.js";

// ===============================
// GET ALL EXPENSES
// ===============================

export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find()
    .populate("createdBy", "name email")
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    expenses,
  });
});

// ===============================
// GET ONE EXPENSE
// ===============================

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate("createdBy", "name email");

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  res.status(200).json({
    success: true,
    expense,
  });
});

// ===============================
// CREATE EXPENSE
// ===============================

export const createExpense = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    description,
    amount,
    paymentMethod,
    date,
  } = req.body;

  if (!title || !category || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: "Title, category and amount are required",
    });
  }

  if (Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Expense amount cannot be negative",
    });
  }

  const expense = await Expense.create({
    title,
    category,
    description,
    amount: Number(amount),
    paymentMethod,
    date,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Expense created successfully",
    expense,
  });
});

// ===============================
// UPDATE EXPENSE
// ===============================

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  const {
    title,
    category,
    description,
    amount,
    paymentMethod,
    date,
  } = req.body;

  if (amount !== undefined && Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Expense amount cannot be negative",
    });
  }

  expense.title = title ?? expense.title;
  expense.category = category ?? expense.category;
  expense.description =
    description ?? expense.description;

  expense.amount =
    amount !== undefined
      ? Number(amount)
      : expense.amount;

  expense.paymentMethod =
    paymentMethod ?? expense.paymentMethod;

  expense.date = date ?? expense.date;

  const updatedExpense = await expense.save();

  res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    expense: updatedExpense,
  });
});

// ===============================
// DELETE EXPENSE
// ===============================

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  });
});
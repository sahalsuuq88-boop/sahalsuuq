import express from "express";

import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.js";

import { adminOnly, profileUser } from "../middleware/authMiddleWare.js";

const expenseRouter = express.Router();

// GET ALL
expenseRouter.get("/", profileUser, adminOnly, getExpenses);

// GET ONE
expenseRouter.get("/:id", profileUser, adminOnly, getExpense);

// CREATE
expenseRouter.post("/", profileUser, adminOnly, createExpense);

// UPDATE
expenseRouter.put("/:id", profileUser, adminOnly, updateExpense);

// DELETE
expenseRouter.delete("/:id", profileUser, adminOnly, deleteExpense);

export default expenseRouter;

import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.js";

import { profileUser } from "../middleware/authMiddleWare.js";
import { adminOnly } from "../middleware/authMiddleWare.js";
import upload from "../model/upload.js";
import { createProductValidation } from "../validators/productValidator.js";
import validate from "../middleware/validators.js";

const categoryRouter = express.Router();

// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategory);

// Admin
categoryRouter.post(
  "/",
  profileUser,
  adminOnly,
  upload.single("image"),
  createCategory
);

categoryRouter.put(
  "/:id",
  profileUser,
  adminOnly,
  upload.single("image"),
  updateCategory
);

categoryRouter.delete("/:id", profileUser, adminOnly, deleteCategory);

export default categoryRouter;
import express from "express";

import {
  getStoreStatus,
  updateStoreStatus,
} from "../controllers/systemSettings.js";

import { adminOnly, profileUser } from "../middleware/authMiddleWare.js";

const systemRouter = express.Router();

// ==========================================
// CUSTOMER + ADMIN
// Get current store status
// ==========================================
systemRouter.get("/status", getStoreStatus);

// ==========================================
// ADMIN ONLY
// Update store status
// ==========================================
systemRouter.put("/status", profileUser, adminOnly, updateStoreStatus);

export default systemRouter;

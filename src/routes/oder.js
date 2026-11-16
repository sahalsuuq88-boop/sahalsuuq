import express from "express";

import {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
  debugOrders,
  calculateDeliveryPreview,
} from "../controllers/order.js";

import { profileUser, adminOnly } from "../middleware/authMiddleWare.js";

import { GetOrders } from "../controllers/getOrders.js";
import { storeOpenMiddleware } from "../middleware/storeOpenMiddleware.js";

const orderRouter = express.Router();

// =====================================================
// CUSTOMER
// =====================================================

// Create Order
orderRouter.post("/", profileUser, storeOpenMiddleware, createOrder);

// Calculate Delivery Fee
orderRouter.post("/calculate-delivery", profileUser, calculateDeliveryPreview);

// Debug Orders
// MUST be before /:id
orderRouter.get("/debug-orders", profileUser, adminOnly, debugOrders);

// My Orders
orderRouter.get("/my-orders", profileUser, getMyOrders);

// Get Single Order
orderRouter.get("/:id", profileUser, getOrderById);

// =====================================================
// ADMIN
// =====================================================

// Get All Orders
orderRouter.get("/", profileUser, adminOnly, GetOrders, getOrders);

// Update Order Status
orderRouter.put("/:id", profileUser, adminOnly, updateOrderStatus);

// Delete Order
orderRouter.delete("/:id", profileUser, adminOnly, deleteOrder);

export default orderRouter;

import express from "express";

import {
  createPayment,
  getPayments,
  updatePaymentStatus,
} from "../controllers/payment.js";

import { profileUser, adminOnly } from "../middleware/authMiddleWare.js";

const paymentRouter = express.Router();

paymentRouter.post("/", profileUser, createPayment);

paymentRouter.get("/", profileUser, adminOnly, getPayments);

paymentRouter.put("/:id", profileUser, adminOnly, updatePaymentStatus);

export default paymentRouter;

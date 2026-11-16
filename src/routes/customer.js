import express from "express";
import {
  getUser,
  updateRole,
  deleteUser,
  getCustomers,
  debugOrders,
} from "../controllers/customer.js";

import { profileUser } from "../middleware/authMiddleWare.js";
import { adminOnly } from "../middleware/authMiddleWare.js";
import { createProductValidation } from "../validators/productValidator.js";

const customerRouter = express.Router();

customerRouter.get("/", profileUser, adminOnly, getCustomers);

customerRouter.get("/debug-orders", profileUser, adminOnly, debugOrders)

customerRouter.get("/:id", profileUser, adminOnly, getUser);

customerRouter.put("/:id/role", profileUser, adminOnly, createProductValidation, updateRole);

customerRouter.delete("/:id", profileUser, adminOnly, deleteUser);

export default customerRouter;
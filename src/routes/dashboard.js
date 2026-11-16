import express from "express";
import { getDashboardStats, getSalesData } from "../controllers/dashboard.js";
import { profileUser } from "../middleware/authMiddleWare.js";
import { adminOnly } from "../middleware/authMiddleWare.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", profileUser, adminOnly, getDashboardStats);
dashboardRouter.get("/sales", profileUser, adminOnly, getSalesData);

export default dashboardRouter;
import express from "express";

import {
  deleteNotification,
  getAdminNotifications,
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.js";

import { adminOnly, profileUser } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",

  profileUser,

  getMyNotifications,
);
notificationRouter.get(
  "/admin",

  profileUser,
  adminOnly,
  getAdminNotifications,
);
// routes/notificationRouter.js
notificationRouter.put("/read-all", profileUser, markAllAsRead);

notificationRouter.put(
  "/:id",

  profileUser,

  markAsRead,
);
notificationRouter.delete(
  "/:id",
  profileUser,
  deleteNotification
);
export default notificationRouter;

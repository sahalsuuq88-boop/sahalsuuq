import express from "express";

import { testPushNotification } from "../controllers/notificationController.js";
import { profileUser } from "../middleware/authMiddleWare.js";

const NotificationRouter = express.Router();

NotificationRouter.post(
  "/test-push",
  profileUser,
  testPushNotification
);

export default NotificationRouter;import Notification from "../model/notification.js";
import asyncHandler from "express-async-handler";

// =====================================================
// GET CUSTOMER NOTIFICATIONS
// Customer wuxuu helayaa notifications-kiisa oo keliya
// =====================================================

export const getMyNotifications = asyncHandler(async (req, res) => {
  // Admin ma isticmaali karo customer notifications
  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins must use admin notifications",
    });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const filter = {
    user: req.user._id,
  };

  const notifications = await Notification.find(filter)
    .populate("order", "_id totalPrice status")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(filter);

  const unreadCount = await Notification.countDocuments({
    ...filter,
    isRead: false,
  });

  res.json({
    success: true,
    notifications,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// =====================================================
// GET ALL ADMIN NOTIFICATIONS
// Admin wuxuu helayaa DHAMMAAN notifications-ka database-ka
// =====================================================

export const getAdminNotifications = asyncHandler(async (req, res) => {
  // Kaliya admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  // MUHIIM:
  // Halkan user filter ma jiro.
  // Sidaas darteed admin wuxuu helayaa dhammaan notifications-ka.
  const notifications = await Notification.find({})
    .populate("user", "name email")
    .populate("order", "_id totalPrice status")
    .sort({ createdAt: -1 })
    .lean();

  const unreadCount = await Notification.countDocuments({
    isRead: false,
  });

  const total = await Notification.countDocuments({});

  res.json({
    success: true,
    notifications,
    unreadCount,
    total,
  });
});

// =====================================================
// MARK ONE AS READ
// User/Admin notification-ka waa la akhriyey
// LAKIIN lama delete-gareynayo
// =====================================================

export const markAsRead = asyncHandler(async (req, res) => {
  const filter = {
    _id: req.params.id,
    user: req.user._id,
  };

  const notification = await Notification.findOneAndUpdate(
    filter,
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    notification,
  });
});

// =====================================================
// MARK ALL AS READ
// User → dhammaan notifications-kiisa
// =====================================================

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

// =====================================================
// DELETE ONE NOTIFICATION
// User wuxuu delete-gareyn karaa notification-kiisa
// =====================================================

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    message: "Notification deleted",
  });
});
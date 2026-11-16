import Notification from "../model/notification.js";
import asyncHandler from "express-async-handler";

// =====================================================
// GET MY NOTIFICATIONS
// Admin iyo Customer labaduba waxay helayaan
// notifications-kooda oo keliya
// =====================================================

export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 50, 1);

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

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// =====================================================
// GET ADMIN NOTIFICATIONS
// Admin wuxuu helayaa notifications-kiisa oo keliya
// =====================================================

export const getAdminNotifications = asyncHandler(async (req, res) => {
  const role = req.user.role?.trim()?.toLowerCase();

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 50, 1);

  const filter = {
    user: req.user._id,
  };

  const notifications = await Notification.find(filter)
    .populate("user", "name email")
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

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// =====================================================
// MARK ONE AS READ
// User wuxuu read ka dhigi karaa kiisa oo keliya
// =====================================================

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    },
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.status(200).json({
    success: true,
    notification,
  });
});

// =====================================================
// MARK ALL AS READ
// User wuxuu read ka dhigayaa notifications-kiisa oo keliya
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
    },
  );

  res.status(200).json({
    success: true,
    message: "All your notifications marked as read",
  });
});

// =====================================================
// DELETE ONE NOTIFICATION
// User wuxuu delete gareyn karaa kiisa oo keliya
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

  res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
});
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import { sendPushNotification } from "../services/pushNotificationServices.js";

export const testPushNotification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.pushToken) {
    return res.status(400).json({
      success: false,
      message: "User does not have a push token",
    });
  }

  const result = await sendPushNotification({
    pushToken: user.pushToken,
    title: "HEL SUUQ",
    body: "Push notification is working successfully! 🎉",
    data: {
      type: "test",
      screen: "notifications",
    },
  });

  res.status(200).json({
    success: true,
    message: "Test notification sent",
    result,
  });
});
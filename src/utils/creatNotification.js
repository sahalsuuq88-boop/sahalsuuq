import Notification from "../model/notification.js";
import User from "../model/User.js";
import { sendPushNotification } from "./pushNotification.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  orderId = null,
  link = "",
  priority = "normal",
}) => {
  // 1. Save notification to MongoDB
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    order: orderId,
    link,
    priority,
  });

  // 2. Find user push token
  const user = await User.findById(userId).select(
    "pushToken pushPlatform name email role",
  );

  if (!user) {
    console.log("Notification user not found:", userId);
    return notification;
  }

  // 3. Send push notification
  if (user.pushToken) {
    await sendPushNotification({
      pushToken: user.pushToken,
      title,
      message,
      data: {
        notificationId: notification._id.toString(),
        type,
        orderId: orderId ? orderId.toString() : null,
        link,
      },
    });
  } else {
    console.log(`NO PUSH TOKEN FOR USER: ${user.name}`);
  }

  return notification;
};

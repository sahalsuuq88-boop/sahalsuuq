import Notification from "../model/notification.js";
import User from "../model/User.js";
import { sendPushNotification } from "./pushNotificationServices.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  priority = "normal",
  link = "",
  orderId = null,
  data = {},
}) => {
  try {
    // =====================================================
    // 1. ALWAYS SAVE NOTIFICATION TO DATABASE
    // =====================================================

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      link,
      order: orderId || undefined,
    });

    console.log("✅ NOTIFICATION CREATED:", notification._id);

    // =====================================================
    // 2. FIND USER PUSH TOKEN
    // =====================================================

    const user = await User.findById(userId).select(
      "name pushToken pushPlatform"
    );

    if (!user) {
      console.log("⚠️ USER NOT FOUND:", userId);
      return notification;
    }

    console.log("USER:", user.name);
    console.log("PUSH TOKEN:", user.pushToken);
    console.log("PUSH PLATFORM:", user.pushPlatform);

    // =====================================================
    // 3. SEND PUSH NOTIFICATION
    // =====================================================

    if (user.pushToken) {
      try {
        const pushResult = await sendPushNotification({
          pushToken: user.pushToken,
          title,
          message,

          data: {
            type,
            screen: data.screen || "notifications",

            notificationId: notification._id.toString(),

            ...(orderId && {
              orderId: orderId.toString(),
            }),

            ...data,
          },
        });

        console.log(
          `✅ PUSH SENT TO: ${user.name}`,
          pushResult
        );
      } catch (pushError) {
        // Push failure should NOT delete DB notification
        console.error(
          `⚠️ PUSH FAILED FOR ${user.name}:`,
          pushError?.message
        );
      }
    } else {
      console.log(
        `⚠️ NO PUSH TOKEN FOR USER: ${user.name}`
      );
    }

    // =====================================================
    // 4. RETURN DATABASE NOTIFICATION
    // =====================================================

    return notification;
  } catch (error) {
    console.error(
      "❌ CREATE NOTIFICATION ERROR:",
      error
    );

    throw error;
  }
};
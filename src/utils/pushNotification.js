import fetch from "node-fetch";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const sendPushNotification = async ({
  pushToken,
  title,
  message,
  data = {},
}) => {
  if (!pushToken) {
    console.log("NO PUSH TOKEN");
    return null;
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title,
        body: message,
        channelId: "orders",
        priority: "high",
        data,
      }),
    });

    const result = await response.json();

    console.log("EXPO PUSH RESULT:", result);

    return result;
  } catch (error) {
    console.error("EXPO PUSH ERROR:", error.message);
    return null;
  }
};

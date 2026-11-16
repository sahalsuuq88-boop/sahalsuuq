import axios from "axios";

export const sendPushNotification = async ({
  pushToken,
  title,
  body,
  data = {},
}) => {
  try {
    if (!pushToken) {
      console.log("❌ No push token provided");
      return null;
    }

    const message = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    };

    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      message,
      {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "✅ EXPO PUSH RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    const ticketId = response.data?.data?.id;

    if (!ticketId) {
      console.log("❌ No Expo ticket ID");
      return response.data;
    }

    // Give Expo a moment to process the notification
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const receiptResponse = await axios.post(
      "https://exp.host/--/api/v2/push/getReceipts",
      {
        ids: [ticketId],
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "📩 EXPO PUSH RECEIPT:",
      JSON.stringify(receiptResponse.data, null, 2)
    );

    return {
      ticket: response.data,
      receipt: receiptResponse.data,
    };
  } catch (error) {
    console.error(
      "❌ PUSH SEND ERROR:",
      error.response?.data || error.message
    );

    return null;
  }
};
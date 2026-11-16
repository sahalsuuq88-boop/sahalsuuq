import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "system",
        "delivery",
        "promotion",
        "stock",
        "refund",
        "account",
      ],
      default: "system",
    },
    icon: {
      type: String,
      default: "notifications",
    },
    link: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

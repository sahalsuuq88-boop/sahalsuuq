import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    isStoreOpen: {
      type: Boolean,
      default: true,
    },

    message: {
      type: String,
      default: "HEL SUUQ is currently closed. Please come back later.",
      trim: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    closedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const systemSettings = mongoose.model('systemSetting', systemSettingsSchema);
export default systemSettings;
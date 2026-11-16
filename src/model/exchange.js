import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: "USD_TO_SLSH",
      unique: true,
      required: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
      default: 8000,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ExchangeRate = mongoose.model(
  "ExchangeRate",
  exchangeRateSchema
);

export default ExchangeRate;
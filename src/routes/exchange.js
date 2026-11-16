import express from "express";
import asyncHandler from "express-async-handler";

import ExchangeRate from "../model/exchange.js";
import { profileUser, adminOnly } from "../middleware/authMiddleware.js";

const exchangeRateRouter = express.Router();


// ===============================
// GET CURRENT EXCHANGE RATE
// ===============================
exchangeRateRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    let exchangeRate = await ExchangeRate.findOne({
      currency: "USD_TO_SLSH",
    });

    // Haddii uusan jirin, mid cusub samee
    if (!exchangeRate) {
      exchangeRate = await ExchangeRate.create({
        currency: "USD_TO_SLSH",
        rate: 8000,
      });
    }

    res.status(200).json({
      success: true,
      rate: exchangeRate.rate,
      currency: exchangeRate.currency,
      updatedAt: exchangeRate.updatedAt,
    });
  })
);


// ===============================
// UPDATE EXCHANGE RATE
// ADMIN ONLY
// ===============================
exchangeRateRouter.put(
  "/",
  profileUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { rate } = req.body;

    if (rate === undefined || rate === null || rate === "") {
      return res.status(400).json({
        success: false,
        message: "Exchange rate is required",
      });
    }

    const newRate = Number(rate);

    if (!Number.isFinite(newRate) || newRate <= 0) {
      return res.status(400).json({
        success: false,
        message: "Exchange rate must be a valid number greater than 0",
      });
    }

    const exchangeRate = await ExchangeRate.findOneAndUpdate(
      {
        currency: "USD_TO_SLSH",
      },
      {
        rate: newRate,
        updatedBy: req.user._id,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Exchange rate updated successfully",
      rate: exchangeRate.rate,
      currency: exchangeRate.currency,
      updatedAt: exchangeRate.updatedAt,
    });
  })
);

export default exchangeRateRouter;
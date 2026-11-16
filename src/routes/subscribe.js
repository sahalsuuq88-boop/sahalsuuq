import express from "express";
import subscribe from "../model/subscribe.js";
import asyncHandler from 'express-async-handler'


const subscribeRouter = express.Router();

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Puplic

subscribeRouter.post("/subscribe", asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send("Email is required");
  }
    // check if the email is already subscribed
    let Subscriber = await subscribe.findOne({ email });
    if (Subscriber) {
      return res.status(400).json({ message: "email already subscribed" });
    }

    //create a new subscriber
    Subscriber = new subscribe({ email });
    await Subscriber.save();

    res.status(201).send("successfully subscribed to thr newsletter");
}));


export default subscribeRouter;
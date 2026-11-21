import express from "express";
import checkout from "../model/checkout.js";
import Cart from "../model/cart.js";
import Product from "../model/product.js";
import Order from "../model/Oder.js";
import { profileUser } from "../middleware/authMiddleWare.js";
import asyncHandler from 'express-async-handler'


const checkoutRoute = express.Router();

// @route POST /api/checkout
// @ desc Create a new checkout session
// @ access private

checkoutRoute.post("/", profileUser, asyncHandler(async (req, res) => {
  const {
    checkoutItems,
    shippingAddress,
    paymentMethod,
    paymentDetails,
    totalPrice,
  } = req.body;

  // SAXAN:
  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "no items in checkout" });
  }
    // create a new checkout sesion
    const newCheckOut = await checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentDetails,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).send(newCheckOut);

}));

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successful payment
// @access Private

checkoutRoute.put("/:id/pay", profileUser, asyncHandler(async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

    const checkoutModel = await checkout.findById(req.params.id);

    if (!checkoutModel) {
      return res.status(404).send("checkout not found");
    }

    if (paymentStatus === "paid") {
      checkoutModel.isPaid = true;

      checkoutModel.paymentStatus = paymentStatus;

      checkoutModel.paymentDetails = paymentDetails;

      checkoutModel.paidAt = Date.now();

      await checkoutModel.save();

      res.status(200).send(checkoutModel);
    } else {
      res.status(400).send("Invalid Payment Status");
    }

}));

// @route POST /api/checkout/:id/finalize
// @desc finalize checkout and convert to an order after payment confirmation
// @access Private

checkoutRoute.post("/:id/finalize", profileUser, asyncHandler(async (req, res) => {
    const checkoutModel = await checkout.findById(req.params.id);
    if (!checkoutModel) {
      return res.status(404).send("checkout not found");
    }
    if (checkoutModel.isPaid && !checkoutModel.isFinalized) {
      // create final order based on the checkout details
      // create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkoutModel.user,
        checkoutId: checkoutModel._id, // Hubi in field-kan uu ku jiro Oder.js Schema-gaaga

        // Mapping-ka saxda ah:
        orderItems: checkoutModel.checkoutItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity || 1, // Haddii quantity aysan jirin, default u dhig 1
        })),

        shippingAddress: checkoutModel.shippingAddress,
        paymentMethod: checkoutModel.paymentMethod,
        totalPrice: checkoutModel.totalPrice,
        isPaid: true,
        paidAt: checkoutModel.paidAt,
        isDeliverd: false,
        paymentStatus: "paid",
        paymentDetails: checkoutModel.paymentDetails,
      });

      //Mark the checkout as finlized
      checkoutModel.isFinalized = true;
      checkoutModel.finalizedAt = Date.now();
      await checkoutModel.save();

      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkoutModel.user });

      // U dir Admin-ka ogeysiis real-time ah
      const io = req.app.get("io");
      if (io) {
        io.to("admins").emit("newOrder", finalOrder);
      }

      res.status(201).send(finalOrder);
    } else if (checkoutModel.isFinalized) {
      // WAA INAAD HESTAA 'checkoutId' gudaha Order model-ka si aad u hesho
      const existingOrder = await Order.findOne({
        checkoutId: checkoutModel._id,
      });
      return res.status(200).json({
        message: "Order-kaaga mar hore ayuu dhameystirmay",
        order: existingOrder, // ama u soo dir order-kii hore
      });
    } else {
      res.status(400).send("checkout is not paid");
    }

}));

export default checkoutRoute;

import Payment from "../model/payment.js";
import Order from "../model/Oder.js";
import asyncHandler from "express-async-handler";
import Notification from "../model/notification.js";

export const createPayment = asyncHandler(async (req, res) => {
  const foundOrder = await Order.findById(req.body.order);

  if (!foundOrder) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const payment = await Payment.create({
    order: foundOrder._id,

    user: req.user.id,

    paymentMethod: req.body.paymentMethod || "Cash",

    amount: foundOrder.totalPrice,
  });

  payment.paymentStatus = req.body.status;
  await payment.save();

  if (payment.paymentStatus === "Paid") {
    await Notification.create({
      user: payment.user,
      title: "Payment Successful",
      message: "Your payment has been received successfully.",
      type: "payment",
    });
  }

  res.status(201).json(payment);
});
export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate("user", "name email")
    .populate("order");

  res.json(payments);
});
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found",
    });
  }

  payment.paymentStatus = req.body.status;

  await payment.save();

  // Haddii payment noqdo Paid
  // Order u beddel Processing

  if (req.body.status === "Paid") {
    const foundOrder = await Order.findById(payment.order);

    if (foundOrder) {
      foundOrder.orderStatus = "Processing";

      await foundOrder.save();
    }
  }

  res.json({
    message: "Payment updated successfully",

    payment,
  });
});

// import Payment from "../models/Payment.js";
// import Order from "../models/Order.js";

// export const updatePaymentStatus = async (req, res) => {
//   try {
//     const payment = await Payment.findById(req.params.id);

//     if (!payment) {
//       return res.status(404).json({
//         message: "Payment not found",
//       });
//     }

//     payment.paymentStatus = req.body.status;

//     await payment.save();

//     // Haddii payment noqdo Paid
//     // Order u beddel Processing

//     if (req.body.status === "Paid") {
//       const order = await Order.findById(payment.order);

//       if (order) {
//         order.orderStatus = "Processing";

//         await order.save();
//       }
//     }

//     res.json({
//       message: "Payment updated successfully",

//       payment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

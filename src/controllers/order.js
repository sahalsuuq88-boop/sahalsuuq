import Order from "../model/Oder.js";
import Product from "../model/product.js";
import User from "../model/user.js";
import asyncHandler from "express-async-handler";

import { createNotification } from "../services/notificationServer.js";

import { calculateDistanceKm } from "../services/distanceServices.js";

import { calculateDeliveryFee } from "../services/deliveryServices.js";

// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentPhone,
    deliveryMethod,
    latitude,
    longitude,
  } = req.body;

  console.log("========================================");

  console.log("CREATE ORDER BODY:", req.body);

  console.log("DELIVERY METHOD:", deliveryMethod);

  console.log("USER:", req.user?.name);

  console.log("USER ID:", req.user?._id);

  console.log("========================================");

  // =================================================
  // VALIDATION
  // =================================================

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No products selected",
    });
  }

  if (!["Delivery", "Pickup"].includes(deliveryMethod)) {
    return res.status(400).json({
      success: false,
      message: "Invalid delivery method",
    });
  }

  // =================================================
  // DELIVERY VALIDATION
  // =================================================

  if (deliveryMethod === "Delivery") {
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery location is required",
      });
    }
  }

  // =================================================
  // PROCESS PRODUCTS
  // =================================================

  const processedOrderItems = [];

  let totalPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${item.productId} not found`,
      });
    }

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product quantity",
      });
    }

    // =================================================
    // ORDER ITEM
    // =================================================

    processedOrderItems.push({
      productId: product._id,

      quantity,

      price: product.price,
    });

    // =================================================
    // TOTAL
    // =================================================

    totalPrice += product.price * quantity;

    // =================================================
    // SOLD
    // =================================================

    product.sold = (product.sold || 0) + quantity;

    await product.save();
  }

  // =================================================
  // DELIVERY CALCULATION
  // =================================================

  let deliveryDistance = 0;

  let deliveryZone = null;

  let deliveryZoneName = "";

  let deliveryFee = 0;

  let deliveryCost = 0;

  // =================================================
  // DELIVERY
  // =================================================

  if (deliveryMethod === "Delivery") {
    // Calculate distance from Waaheen
    deliveryDistance = calculateDistanceKm(latitude, longitude);

    // Calculate delivery fee
    const deliveryInfo = calculateDeliveryFee({
      distanceKm: deliveryDistance,

      orderTotal: totalPrice,
    });

    deliveryZone = deliveryInfo.distanceZone;

    deliveryZoneName = deliveryInfo.distanceZoneName;

    deliveryFee = deliveryInfo.deliveryFee;

    deliveryCost = 1.5;

    console.log("========================================");

    console.log("DELIVERY CALCULATION");

    console.log("Latitude:", latitude);

    console.log("Longitude:", longitude);

    console.log("Distance:", deliveryDistance, "KM");

    console.log("Zone:", deliveryZone);

    console.log("Zone Name:", deliveryZoneName);

    console.log("Order Total:", totalPrice);

    console.log("Delivery Fee:", deliveryFee);

    console.log("========================================");
  }

  // =================================================
  // PICKUP
  // =================================================

  if (deliveryMethod === "Pickup") {
    deliveryDistance = 0;
    deliveryZone = null;
    deliveryZoneName = "";
    deliveryFee = 0;
    deliveryCost = 0;
  }

  // =================================================
  // GRAND TOTAL
  // =================================================

  const grandTotal = Number((totalPrice + deliveryFee).toFixed(2));

  // =================================================
  // CREATE ORDER
  // =================================================

  const order = await Order.create({
    user: req.user._id,

    orderItems: processedOrderItems,

    deliveryMethod,

    shippingAddress:
      deliveryMethod === "Delivery" ? shippingAddress : undefined,

    latitude: deliveryMethod === "Delivery" ? Number(latitude) : undefined,

    longitude: deliveryMethod === "Delivery" ? Number(longitude) : undefined,

    deliveryDistance,

    deliveryZone,

    deliveryZoneName,

    deliveryFee,

    deliveryCost,

    paymentMethod,

    paymentPhone: paymentMethod === "Cash" ? null : paymentPhone,

    totalPrice,

    grandTotal,
  });

  console.log("========================================");

  console.log("ORDER CREATED:", order._id);

  console.log("PRODUCT TOTAL:", totalPrice);

  console.log("DELIVERY FEE:", deliveryFee);

  console.log("DELIVERY COST:", deliveryCost);

  console.log("GRAND TOTAL:", grandTotal);

  console.log("========================================");

  // =================================================
  // ADMIN NOTIFICATION
  // =================================================

  const admins = await User.find({
    role: "admin",
  }).select("_id name pushToken pushPlatform");

  console.log("ADMINS FOUND:", admins.length);

  for (const admin of admins) {
    try {
      await createNotification({
        userId: admin._id,

        title: "🛍️ New Order Received",

        message: `New order from ${req.user.name}`,

        type: "order",

        priority: "high",

        link: `/admin/orders/${order._id}`,

        orderId: order._id,

        data: {
          screen: "admin/orders",
        },
      });

      console.log(`✅ ADMIN NOTIFICATION SENT: ${admin.name}`);
    } catch (error) {
      console.error(
        `❌ ADMIN NOTIFICATION ERROR: ${admin.name}`,
        error.message,
      );
    }
  }

  // =================================================
  // CUSTOMER NOTIFICATION
  // =================================================

  try {
    await createNotification({
      userId: req.user._id,

      title: "✅ Order Placed",

      message: `Your order has been placed successfully. Total: $${grandTotal}`,

      type: "order",

      priority: "normal",

      link: `/orderSummary/${order._id}`,

      orderId: order._id,

      data: {
        screen: "orders",
      },
    });

    console.log(`✅ CUSTOMER NOTIFICATION SENT: ${req.user.name}`);
  } catch (error) {
    console.error("❌ CUSTOMER NOTIFICATION ERROR:", error.message);
  }

  // =================================================
  // RESPONSE
  // =================================================

  res.status(201).json({
    success: true,

    message: "Order created successfully",

    data: order,

    delivery: {
      distanceKm: deliveryDistance,

      zone: deliveryZone,

      zoneName: deliveryZoneName,

      fee: deliveryFee,

      cost: deliveryCost,
    },

    pricing: {
      subtotal: totalPrice,

      deliveryFee,

      deliveryCost,

      grandTotal,
    },
  });
});

// =====================================================
// GET ALL ORDERS
// =====================================================

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email number")
    .populate("orderItems.productId")
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,

    count: orders.length,

    orders,
  });
});

// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("orderItems.productId")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const updateOrder = await Order.findById(req.params.id);

  if (!updateOrder) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const oldStatus = updateOrder.status;

  const newStatus = req.body.status;

  const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  updateOrder.status = newStatus;

  // Mark delivery completed
  if (newStatus === "Delivered") {
    updateOrder.isDeliverd = true;

    updateOrder.deliveredAt = new Date();
  }

  await updateOrder.save();

  console.log("========================================");

  console.log("ORDER STATUS UPDATED");

  console.log("ORDER:", updateOrder._id);

  console.log("OLD STATUS:", oldStatus);

  console.log("NEW STATUS:", newStatus);

  console.log("========================================");

  // =================================================
  // CUSTOMER NOTIFICATION
  // =================================================

  if (updateOrder.user && oldStatus !== newStatus) {
    try {
      await createNotification({
        userId: updateOrder.user,

        title: "📦 Order Updated",

        message: `Your order is now ${newStatus}`,

        type: "order",

        priority: "high",

        link: `/orders/${updateOrder._id}`,

        orderId: updateOrder._id,

        data: {
          screen: "orders",
        },
      });

      console.log("✅ CUSTOMER STATUS NOTIFICATION SENT");
    } catch (error) {
      console.error("❌ STATUS NOTIFICATION ERROR:", error.message);
    }
  }

  // =================================================
  // RETURN UPDATED ORDERS
  // =================================================

  const orders = await Order.find()
    .populate("user", "name email number")
    .populate("orderItems.productId")
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    orders,
  });
});

// =====================================================
// DELETE ORDER
// =====================================================

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Order Deleted",
  });
});

// =====================================================
// GET ORDER BY ID
// =====================================================

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email number")
    .populate("orderItems.productId");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.json({
    success: true,
    order,
  });
});

// =====================================================
// DEBUG ORDERS
// =====================================================

export const debugOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .select(
      "_id user totalPrice grandTotal deliveryFee deliveryDistance deliveryZone status createdAt",
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  const userIds = [
    ...new Set(orders.map((order) => order.user?.toString()).filter(Boolean)),
  ];

  const users = await User.find({
    _id: {
      $in: userIds,
    },
  }).select("_id name email role pushToken pushPlatform");

  console.log("ORDER USERS:", JSON.stringify(users, null, 2));

  res.json({
    success: true,

    count: orders.length,

    orders,

    orderUsers: users,
  });
});

// =====================================================
// CALCULATE DELIVERY FEE
// =====================================================

export const calculateDeliveryPreview = asyncHandler(async (req, res) => {
  const { orderItems, latitude, longitude, deliveryMethod } = req.body;

  if (deliveryMethod === "Pickup") {
    return res.json({
      success: true,
      delivery: {
        distanceKm: 0,
        zone: null,
        zoneName: "Pickup",
        fee: 0,
      },
      pricing: {
        subtotal: 0,
        deliveryFee: 0,
        grandTotal: 0,
      },
    });
  }

  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No products selected",
    });
  }

  // Calculate subtotal from database prices
  let subtotal = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${item.productId} not found`,
      });
    }

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product quantity",
      });
    }

    subtotal += product.price * quantity;
  }

  // Calculate distance from Waaheen
  const distanceKm = calculateDistanceKm(Number(latitude), Number(longitude));

  // Calculate delivery fee
  const deliveryInfo = calculateDeliveryFee({
    distanceKm,
    orderTotal: subtotal,
  });

  const deliveryFee = Number(deliveryInfo.deliveryFee || 0);

  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));

  res.json({
    success: true,

    delivery: {
      distanceKm,
      zone: deliveryInfo.distanceZone,
      zoneName: deliveryInfo.distanceZoneName,
      fee: deliveryFee,
    },

    pricing: {
      subtotal,
      deliveryFee,
      grandTotal,
    },
  });
});

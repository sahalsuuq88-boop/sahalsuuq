import mongoose from "mongoose";

// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // =================================================
    // CUSTOMER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =================================================
    // DELIVERY METHOD
    // =================================================

    deliveryMethod: {
      type: String,
      enum: ["Delivery", "Pickup"],
      default: "Delivery",
      required: true,
    },

    // =================================================
    // ORDER ITEMS
    // =================================================

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    // =================================================
    // SHIPPING ADDRESS
    // =================================================

    shippingAddress: {
      fullName: {
        type: String,
      },

      phone: {
        type: String,
      },

      address: {
        type: String,
      },

      city: {
        type: String,
      },
    },

    // =================================================
    // CUSTOMER GPS LOCATION
    // =================================================

    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },

    // =================================================
    // DELIVERY DISTANCE
    // =================================================

    deliveryDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // DELIVERY ZONE
    // =================================================

    deliveryZone: {
      type: Number,
      enum: [1, 2, 3, null],
      default: null,
    },

    deliveryZoneName: {
      type: String,
      enum: ["Near", "Middle", "Far", ""],
      default: "",
    },

    // =================================================
    // DELIVERY FEE
    // =================================================

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // DELIVERY COST
    // =================================================

    // Actual cost paid/spent for delivering this order
    deliveryCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // PAYMENT
    // =================================================

    paymentMethod: {
      type: String,
      enum: ["Cash", "Zaad", "Edahab"],
      default: "Cash",
      required: true,
    },

    paymentPhone: {
      type: String,
      default: null,
    },

    // =================================================
    // PRICES
    // =================================================

    // Product total
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Product total + delivery fee
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // =================================================
    // PAYMENT STATUS
    // =================================================

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // =================================================
    // DELIVERY STATUS
    // =================================================

    isDeliverd: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    // =================================================
    // ORDER STATUS
    // =================================================

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },

  {
    timestamps: true,
  },
);

// =====================================================
// MODEL
// =====================================================

const Order = mongoose.model("Order", orderSchema);

export default Order;

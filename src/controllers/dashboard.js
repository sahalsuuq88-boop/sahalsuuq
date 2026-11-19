import Product from "../model/product.js";
import Order from "../model/Oder.js";
import User from "../model/User.js";
import asyncHandler from "express-async-handler";

// =====================================================
// CONSTANTS
// =====================================================

// Delivery-ga adiga ayaad u qoondeysay $1.50
// Looma baahna setting ama model.
const DELIVERY_COST = 1.5;

// Orders-kan ayaa accounting ahaan loo tixgelinayaa
// revenue iyo COGS.
const ACCOUNTING_STATUSES = ["Shipped", "Delivered"];

// =====================================================
// CALCULATE PERCENTAGE CHANGE
// =====================================================

const calculateChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

// =====================================================
// DATE RANGES
// =====================================================

const getDateRanges = () => {
  const now = new Date();

  const startThisMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const startLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const endLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  return {
    startThisMonth,
    startLastMonth,
    endLastMonth,
  };
};

// =====================================================
// ACCOUNTING CALCULATIONS
// =====================================================

const calculateAccounting = async (orders) => {
  let productRevenue = 0;
  let deliveryRevenue = 0;

  let productCOGS = 0;
  let deliveryCost = 0;

  for (const order of orders) {
    // ==========================================
    // PRODUCT REVENUE
    // ==========================================

    productRevenue += Number(order.totalPrice || 0);

    // ==========================================
    // DELIVERY REVENUE
    // ==========================================

    if (order.deliveryMethod === "Delivery") {
      deliveryRevenue += Number(order.deliveryFee || 0);

      // Adiga waxaad go'aamisay:
      // Delivery cost = $1.50
      deliveryCost += DELIVERY_COST;
    }

    // ==========================================
    // PRODUCT COGS
    // ==========================================

    for (const item of order.orderItems || []) {
      const product = item.productId;

      if (!product) continue;

      const costPrice = Number(product.costPrice || 0);
      const quantity = Number(item.quantity || 0);

      productCOGS += costPrice * quantity;
    }
  }

  // ==========================================
  // TOTAL REVENUE
  // ==========================================

  const totalRevenue = productRevenue + deliveryRevenue;

  // ==========================================
  // GROSS PROFIT
  // ==========================================

  const grossProfit =
    totalRevenue - productCOGS - deliveryCost;

  // ==========================================
  // EXPENSES
  // ==========================================

  // Phase 1:
  // Expenses model wali wali ayaan ku dari doonaa.
  // Hadda 0 ayaan dhigeynaa.
  const operatingExpenses = 0;

  // ==========================================
  // NET INCOME
  // ==========================================

  const netIncome =
    grossProfit - operatingExpenses;

  // ==========================================
  // PROFIT MARGIN
  // ==========================================

  const profitMargin =
    totalRevenue > 0
      ? Number(((netIncome / totalRevenue) * 100).toFixed(1))
      : 0;

  return {
    productRevenue: Number(productRevenue.toFixed(2)),
    deliveryRevenue: Number(deliveryRevenue.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),

    productCOGS: Number(productCOGS.toFixed(2)),
    deliveryCost: Number(deliveryCost.toFixed(2)),

    grossProfit: Number(grossProfit.toFixed(2)),

    operatingExpenses,

    netIncome: Number(netIncome.toFixed(2)),

    profitMargin,
  };
};

// =====================================================
// DASHBOARD STATS
// =====================================================

export const getDashboardStats = asyncHandler(async (req, res) => {
  const {
    startThisMonth,
    startLastMonth,
    endLastMonth,
  } = getDateRanges();

  // =====================================================
  // PRODUCTS
  // =====================================================

  const totalProducts = await Product.countDocuments();

  const productsThisMonth = await Product.countDocuments({
    createdAt: {
      $gte: startThisMonth,
    },
  });

  const productsLastMonth = await Product.countDocuments({
    createdAt: {
      $gte: startLastMonth,
      $lte: endLastMonth,
    },
  });

  const productChange = calculateChange(
    productsThisMonth,
    productsLastMonth,
  );

  // =====================================================
  // CUSTOMERS
  // =====================================================

  const totalCustomers = await User.countDocuments({
    role: "customer",
  });

  const customersThisMonth = await User.countDocuments({
    role: "customer",
    createdAt: {
      $gte: startThisMonth,
    },
  });

  const customersLastMonth = await User.countDocuments({
    role: "customer",
    createdAt: {
      $gte: startLastMonth,
      $lte: endLastMonth,
    },
  });

  const customerChange = calculateChange(
    customersThisMonth,
    customersLastMonth,
  );

  // =====================================================
  // ORDERS
  // =====================================================

  const totalOrders = await Order.countDocuments();

  const ordersThisMonth = await Order.countDocuments({
    createdAt: {
      $gte: startThisMonth,
    },
  });

  const ordersLastMonth = await Order.countDocuments({
    createdAt: {
      $gte: startLastMonth,
      $lte: endLastMonth,
    },
  });

  const orderChange = calculateChange(
    ordersThisMonth,
    ordersLastMonth,
  );

  // =====================================================
  // ACCOUNTING ORDERS
  // =====================================================
  // ONLY:
  // Shipped
  // Delivered
  //
  // NOT:
  // Processing
  // Cancelled
  // =====================================================

  const accountingOrders = await Order.find({
    status: {
      $in: ACCOUNTING_STATUSES,
    },
  }).populate({
    path: "orderItems.productId",
    select: "name price costPrice",
  });

  // =====================================================
  // ACCOUNTING
  // =====================================================

  const accounting = await calculateAccounting(
    accountingOrders,
  );

  // =====================================================
  // THIS MONTH ACCOUNTING
  // =====================================================

  const accountingThisMonthOrders = await Order.find({
    status: {
      $in: ACCOUNTING_STATUSES,
    },
    createdAt: {
      $gte: startThisMonth,
    },
  }).populate({
    path: "orderItems.productId",
    select: "name price costPrice",
  });

  const accountingThisMonth =
    await calculateAccounting(
      accountingThisMonthOrders,
    );

  // =====================================================
  // LAST MONTH ACCOUNTING
  // =====================================================

  const accountingLastMonthOrders = await Order.find({
    status: {
      $in: ACCOUNTING_STATUSES,
    },
    createdAt: {
      $gte: startLastMonth,
      $lte: endLastMonth,
    },
  }).populate({
    path: "orderItems.productId",
    select: "name price costPrice",
  });

  const accountingLastMonth =
    await calculateAccounting(
      accountingLastMonthOrders,
    );

  // =====================================================
  // ACCOUNTING CHANGES
  // =====================================================

  const revenueChange = calculateChange(
    accountingThisMonth.totalRevenue,
    accountingLastMonth.totalRevenue,
  );

  const grossProfitChange = calculateChange(
    accountingThisMonth.grossProfit,
    accountingLastMonth.grossProfit,
  );

  const netIncomeChange = calculateChange(
    accountingThisMonth.netIncome,
    accountingLastMonth.netIncome,
  );

  // =====================================================
  // STAT CARDS
  // =====================================================

  const stats = [
    {
      title: "Revenue",
      value: accounting.totalRevenue,
      change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      type: "revenue",
    },

    {
      title: "Gross Profit",
      value: accounting.grossProfit,
      change: `${grossProfitChange >= 0 ? "+" : ""}${grossProfitChange}%`,
      type: "grossProfit",
    },

    {
      title: "Net Income",
      value: accounting.netIncome,
      change: `${netIncomeChange >= 0 ? "+" : ""}${netIncomeChange}%`,
      type: "netIncome",
    },

    {
      title: "Orders",
      value: totalOrders,
      change: `${orderChange >= 0 ? "+" : ""}${orderChange}%`,
      type: "orders",
    },

    {
      title: "Products",
      value: totalProducts,
      change: `${productChange >= 0 ? "+" : ""}${productChange}%`,
      type: "products",
    },

    {
      title: "Customers",
      value: totalCustomers,
      change: `${customerChange >= 0 ? "+" : ""}${customerChange}%`,
      type: "customers",
    },
  ];

  // =====================================================
  // LATEST ORDERS
  // =====================================================

  const latestOrders = await getLatestOrders();

  // =====================================================
  // TOP PRODUCTS
  // =====================================================

  const topProducts = await getTopProducts();

  // =====================================================
  // RESPONSE
  // =====================================================

  res.json({
    success: true,

    stats,

    // ==========================================
    // ACCOUNTING
    // ==========================================

    accounting: {
      revenue: {
        productRevenue: accounting.productRevenue,
        deliveryRevenue: accounting.deliveryRevenue,
        totalRevenue: accounting.totalRevenue,
      },

      costOfGoodsSold: accounting.productCOGS,

      deliveryCost: accounting.deliveryCost,

      grossProfit: accounting.grossProfit,

      operatingExpenses: accounting.operatingExpenses,

      netIncome: accounting.netIncome,

      profitMargin: accounting.profitMargin,

      deliveryCostPerOrder: DELIVERY_COST,

      accountingStatuses: ACCOUNTING_STATUSES,
    },

    latestOrders,

    topProducts,
  });
});

// =====================================================
// LATEST ORDERS
// =====================================================

export const getLatestOrders = async () => {
  return await Order.find()
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .populate("user", "name email")
    .populate(
      "orderItems.productId",
      "name imageUrl price costPrice",
    );
};

// =====================================================
// TOP PRODUCTS
// =====================================================

export const getTopProducts = async () => {
  return await Product.find()
    .sort({
      sold: -1,
    })
    .limit(5);
};

// =====================================================
// SALES DATA
// =====================================================

export const getSalesData = asyncHandler(async (req, res) => {
  const sales = await Order.aggregate([
    // ONLY REALIZED SALES
    {
      $match: {
        status: {
          $in: ["Shipped", "Delivered"],
        },
      },
    },

    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt",
          },

          year: {
            $year: "$createdAt",
          },
        },

        // Product revenue
        productRevenue: {
          $sum: "$totalPrice",
        },

        // Delivery revenue
        deliveryRevenue: {
          $sum: "$deliveryFee",
        },

        // Total revenue
        totalRevenue: {
          $sum: {
            $add: [
              "$totalPrice",
              "$deliveryFee",
            ],
          },
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const formattedSales = sales.map((item) => ({
    month: item._id.month,

    year: item._id.year,

    productRevenue: Number(
      (item.productRevenue || 0).toFixed(2),
    ),

    deliveryRevenue: Number(
      (item.deliveryRevenue || 0).toFixed(2),
    ),

    revenue: Number(
      (item.totalRevenue || 0).toFixed(2),
    ),
  }));

  res.json({
    success: true,
    sales: formattedSales,
  });
});
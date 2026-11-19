import User from "../model/User.js";
import Order from "../model/Oder.js";
import asyncHandler from "express-async-handler";

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.aggregate([
    {
      $match: {
        role: "customer",
      },
    },

    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },

    {
      $addFields: {
        totalOrders: {
          $size: "$orders",
        },

        totalSpent: {
          $sum: "$orders.totalPrice",
        },

        status: {
          $cond: [
            {
              $gt: [
                {
                  $size: "$orders",
                },
                0,
              ],
            },
            "Active",
            "Inactive",
          ],
        },
      },
    },

    {
      $project: {
        password: 0,
        orders: 0,
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  res.json({
    success: true,

    data : customers,
  });
});

// export const getCustomers = asyncHandler(async (req, res) => {
//   const customers = await User.aggregate([
//     {
//       $match: {
//         role: "customer",
//       },
//     },

//     {
//       $lookup: {
//         from: "orders",
//         localField: "_id",
//         foreignField: "user",
//         as: "orders",
//       },
//     },

//     {
//       $project: {
//         name: 1,
//         email: 1,
//         number: 1,
//         role: 1,
//         createdAt: 1,

//         orderCount: {
//           $size: "$orders",
//         },

//         orderTotal: {
//           $sum: "$orders.totalPrice",
//         },

//         orderIds: "$orders._id",
//       },
//     },
//   ]);

//   console.log(
//     "CUSTOMERS WITH ORDERS:",
//     JSON.stringify(customers, null, 2)
//   );

//   res.json({
//     success: true,
//     data: customers,
//   });
// });
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    user,
  });
});

export const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["admin", "customer"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    user,
  });
});
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

export const debugOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .select("_id user totalPrice status createdAt")
    .lean();

  const userIds = [
    ...new Set(
      orders
        .map((order) => order.user?.toString())
        .filter(Boolean)
    ),
  ];

  const users = await User.find({
    _id: { $in: userIds },
  }).select("_id name email role");

  console.log(
    "ORDER USERS:",
    JSON.stringify(users, null, 2)
  );

  res.json({
    success: true,
    count: orders.length,
    orders,
    orderUsers: users,
  });
});
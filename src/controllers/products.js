import asyncHandler from "express-async-handler";
import Product from "../model/product.js";

export const GetProducts = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    badge,
    search,
    sortBy,
    page = 1,
    limit = 10,
  } = req.query;

  // Customer-ka waxaa loo soo celinayaa oo keliya
  // products stock-koodu ka weyn yahay 0
  const query = {
    stock: { $gt: 0 },
  };

  // =========================
  // Category Filter
  // =========================
  if (category && category.toLowerCase() !== "all") {
    query.category = category;
  }

  // =========================
  // Price Filter
  // =========================
  // Product-ku wuxuu yeelan karaa units kala duwan
  //
  // Tusaale:
  // Mid-mid = $1
  // Half    = $15
  // Kiish   = $28
  //
  // Haddii units jiraan, waxaan raadineynaa
  // unit kasta qiimihiisa.
  if (minPrice || maxPrice) {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    query.$or = [
      {
        price: {
          $gte: min,
          $lte: max,
        },
      },
      {
        units: {
          $elemMatch: {
            price: {
              $gte: min,
              $lte: max,
            },
          },
        },
      },
    ];
  }

  // =========================
  // Badge Filter
  // =========================
  if (badge && badge.toLowerCase() !== "all") {
    query.badge = badge;
  }

  // =========================
  // Search
  // =========================
  if (search) {
    query.$and = [
      {
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    ];
  }

  // =========================
  // Sort
  // =========================
  let sort = {};

  switch (sortBy) {
    case "priceAsc":
      sort = { price: 1 };
      break;

    case "priceDesc":
      sort = { price: -1 };
      break;

    case "latest":
      sort = { createdAt: -1 };
      break;

    case "oldest":
      sort = { createdAt: 1 };
      break;

    case "popularity":
      sort = { rating: -1 };
      break;

    default:
      sort = { createdAt: -1 };
  }

  // =========================
  // Pagination
  // =========================
  const currentPage = Number(page);
  const perPage = Number(limit);
  const skip = (currentPage - 1) * perPage;

  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("category", "name")
    .sort(sort)
    .skip(skip)
    .limit(perPage);

  // =========================
  // Response
  // =========================
  res.status(200).json({
    success: true,
    page: currentPage,
    totalPages: Math.ceil(totalProducts / perPage),
    totalProducts,
    count: products.length,
    products,
  });
});
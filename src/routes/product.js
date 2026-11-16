import express from "express";
import Product from "../model/product.js";
import { adminOnly, profileUser } from "../middleware/authMiddleWare.js";
import upload from "../model/upload.js";
import asyncHandler from "express-async-handler";
import { GetProducts } from "../controllers/products.js";
import { updateProductValidation } from "../validators/updateProductValidator.js";
import { createReview } from "../controllers/review.js";
import Category from "../model/category.js";

const productRouter = express.Router();

// @route POST /api/products
// @desc create a new product
// @access Private/admin

productRouter.post(
  "/",
  profileUser,
  adminOnly,
  upload.single("image"),

  asyncHandler(async (req, res) => {
    const {
      name,
      price,
      costPrice,
      description,
      badge,
      rating,
      category,
      stock,
      units,
    } = req.body;

    // Image
    const imageUrl = req.file ? req.file.path : req.body.image || "";

    // Category
    let categoryId = category;

    const foundCategory = await Category.findOne({
      name: category,
    });

    if (foundCategory) {
      categoryId = foundCategory._id;
    }

    // Units
    let productUnits = [];

    if (units) {
      productUnits = typeof units === "string" ? JSON.parse(units) : units;
    }

    // Create product
    const newProduct = new Product({
      name,
      price,
      costPrice,
      description,
      badge,
      seller: req.user._id,
      imageUrl,
      rating,
      category: categoryId,
      stock,
      units: productUnits,
      createdBy: req.user._id,
    });

    const createdProduct = await newProduct.save();

    res.status(201).json(createdProduct);
  }),
);

// @route POST /api/products/:id/review
// @desc create a new product review
// @acess Puplic

productRouter.post("/:id/review", profileUser, createReview);

// @route PUT /api/products/:id
// @desc update an existing product ID
// @acess Private/admin

productRouter.put(
  "/:id",
  profileUser,
  adminOnly,
  upload.single("image"), // 1. Ku dar middleware-ka upload-ka si sawirka loo bedeli karo
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Hagaaji Category-ga (haddii magac la soo diro, ka raadi ID-giisa)
    let categoryId = product.category;
    if (req.body.category) {
      const foundCategory = await Category.findOne({ name: req.body.category });
      if (foundCategory) {
        categoryId = foundCategory._id;
      } else {
        categoryId = req.body.category; // Haddii uu horay u ahaa ID sax ah
      }
    }

    // 3. Hubi in file cusub la soo geliyay iyo in kale
    const imageUrl = req.file
      ? req.file.path
      : req.body.imageUrl || product.imageUrl;

    product.name = req.body.name || product.name;
    product.price = req.body.price ?? product.price;
    product.costPrice = req.body.costPrice ?? product.costPrice;
    product.description = req.body.description || product.description;
    product.category = categoryId;
    product.imageUrl = imageUrl;
    product.badge = req.body.badge || product.badge;
    product.stock = req.body.stock ?? product.stock;

    // Update units
    if (req.body.units !== undefined) {
      product.units =
        typeof req.body.units === "string"
          ? JSON.parse(req.body.units)
          : req.body.units;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  }),
);

// @route DELETE /api/products/:id
// @desc delete an  product by ID
// @acess Private/admin

productRouter.delete(
  "/:id",
  profileUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    //find product by id

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,

      message: "Product deleted successfully",
    });
  }),
);

// @route GET /api/products
// @desc get all products with optional query filters
// @acess Public

productRouter.get("/", GetProducts);

// @route GET /api/products/admin
// @desc Get ALL products for admin
// @access Private/Admin
productRouter.get(
  "/admin",
  profileUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const products = await Product.find()
      .populate("category", "name")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  }),
);

// @route GET /api/products/top-rated
// @desc Retrieve top-rated products
// @acess Public

productRouter.get(
  "/top-rated",
  asyncHandler(async (req, res) => {
    const topRatedProducts = await Product.find({
      stock: { $gt: 0 },
    })
      .sort({ rating: -1 })
      .limit(5);
    if (topRatedProducts) {
      res.send(topRatedProducts);
    } else {
      res.status(404).json({ message: "No top-rated products found" });
    }
    // res.status(200).json(topRatedProducts);
    // res.send("This endpoint will return top-rated products. Implementation is pending.");
  }),
);

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products - creation date
// @access public
productRouter.get(
  "/new-arrivals",
  asyncHandler(async (req, res) => {
    // fetch latest 8 products
    const newArrivals = await Product.find({
      stock: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(newArrivals);
  }),
);

// @route GET /api/products/:id
// @desc get a single product by ID
// @acess Public

productRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  }),
);

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's category
// @acess Public

productRouter.get(
  "/similar/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      stock: { $gt: 0 },
    }).limit(4); // Limit to 4 similar products
    res.status(200).json(similarProducts);
  }),
);

export default productRouter;

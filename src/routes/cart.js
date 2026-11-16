import express from "express";
import Cart from "../model/cart.js";
import Product from "../model/product.js";
import { profileUser } from "../middleware/authMiddleWare.js";
import asyncHandler from 'express-async-handler'


const cartRouter = express.Router();

// Helper function to get the cart for a user or guest ID
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId: guestId });
  }
  return null;
};

// @route GET /api/cart
// @desc Add a product to the cart for a guest or logged-in user
// @access Public

cartRouter.post("/", asyncHandler(async (req, res) => {
  // console.log("Req Body:", req.body);
  // console.log("Req User:", req.user);
  const { userId, productId, quantity, guestId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Determine if the user is logged in or a guest
    let cart = await getCart(userId, guestId);

    // if cart exists, update it
    if (cart) {
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (existingProductIndex !== -1) {
        // Update quantity and total price
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Add new product to cart
        cart.products.push({
          productId: product._id,
          name: product.name,
          image: product.imageUrl,
          price: product.price,
          quantity,
        });
      }
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      // Create a new cart
      const newCart = new Cart({
        user: userId ? userId : null,
        guestId: guestId ? guestId : "guest_" + Date.now(),
        products: [
          {
            productId: product._id,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      await newCart.save();
      return res.status(201).json(newCart);
    }

}));

// @route PUT /api/cart
// @desc Update the quantity of a product in the cart for a guest or logged-in user
// @access Public

cartRouter.put("/", asyncHandler(async (req, res) => {
  const { productId, quantity, guestId, userId } = req.body;
    let cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex > -1) {
      if (quantity > 0) {
        // Update quantity
        cart.products[productIndex].quantity = quantity;
      } else {
        // Remove product from cart if quantity is 0 or less
        cart.products.splice(productIndex, 1);
      }
      // Update total price
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

}));

// @route DELETE /api/cart
// @desc Clear the cart for a guest or logged-in user
// @access Public

cartRouter.delete("/", asyncHandler(async (req, res) => {
  const { guestId, userId, productId } = req.body;
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

}));

// @route GET /api/cart
// @desc Get the cart for a guest or logged-in user
// @access Public

cartRouter.get("/", asyncHandler(async (req, res) => {
  const { guestId, userId } = req.query;

    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    return res.status(200).json(cart);

}));

// @route POST /api/cart/merge
// @desc Merge a guest cart with a logged-in user's cart upon login
// @access Public

cartRouter.post("/merge", asyncHandler(async (req, res) => {
  const { guestId, userId } = req.body;
    // find the guest cart and user cart
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: userId });

    if (guestCart) {
      if (guestCart.products.length === 0) {
        return res
          .status(200)
          .json({
            message: "Guest cart is empty. No merge needed.",
            cart: userCart,
          });
      }
      if (userCart) {
        // Merge products from guest cart into user cart
        guestCart.products.forEach((guestItem) => {
          const existingProductIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString()
          );
          if (existingProductIndex > -1) {
            // If product already exists in user cart, update quantity
            userCart.products[existingProductIndex].quantity +=
              guestItem.quantity;
          } else {
            // If product does not exist in user cart, add it
            userCart.products.push(guestItem);
          }
        });
        // Recalculate total price for user cart
        userCart.totalPrice = userCart.products.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        await userCart.save();
        // Delete the guest cart after merging
        try {
          await Cart.findOneAndDelete({ guestId });
        } catch (error) {
          console.error("Error deleting guest cart:", error);
        }
        return res
          .status(200)
          .json( userCart );
      }else{
        // If user cart does not exist, assign guest cart to user
        guestCart.user = userId;
        guestCart.guestId = undefined; // Remove guestId since it's now a user cart
        await guestCart.save();
        return res.status(200).json(guestCart);
      }
    }else{
        if(userCart){
            // Guest cart has already been merged, return the user cart
            return res.status(200).json(userCart);
        }
        return res.status(404).json({ message: "No cart found to merge." });
    }

}));
export default cartRouter;

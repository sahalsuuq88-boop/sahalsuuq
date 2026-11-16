import express from 'express';
import { addToWishlist, getWishlist, removeWishlist } from '../controllers/wishlist.js';
import { profileUser } from '../middleware/authMiddleWare.js';

const wishlistRouter = express.Router();

wishlistRouter.post("/", profileUser, addToWishlist);

wishlistRouter.get("/", profileUser, getWishlist);

wishlistRouter.delete("/:id", profileUser, removeWishlist);

export default wishlistRouter;
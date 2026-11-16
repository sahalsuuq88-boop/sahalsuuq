import express from 'express'
import Product from '../model/product.js';
import { profileUser, adminOnly } from '../middleware/authMiddleWare.js';
import asyncHandler from 'express-async-handler'


const productAdminRoute = express.Router();

// @route GET /api/admin/product
// @desc Get all products (admin only)
// @access Private/admin

productAdminRoute.get('/', profileUser, adminOnly, asyncHandler(async(req, res) => {

        const products = await Product.find({});
        res.json(products)
}))

export default productAdminRoute;
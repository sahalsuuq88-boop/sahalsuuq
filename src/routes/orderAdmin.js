import express from 'express';
import Order from '../model/Oder.js';
import { profileUser, adminOnly } from '../middleware/authMiddleWare.js';
import asyncHandler from 'express-async-handler'


const orderAdminRouter = express.Router();

// @route GET /api/admin/orders
// @desc Get all order (admin only)
// @access Private/admin

orderAdminRouter.get('/', profileUser, adminOnly, asyncHandler(async(req, res) =>{

        const orders = await Order.find({}).populate('user', 'name email')
        res.json(orders)
}))

// @route PUT /api/admin/orders/:id
// @desc update orders 
// @access Private/admin

orderAdminRouter.put('/:id', profileUser, adminOnly, asyncHandler(async(req, res) =>{
        const orders = await Order.findById(req.params.id)
        if(orders){
            orders.status = req.body.status || orders.status
            orders.isDeliverd = req.body.isDeliverd === 'Delivered' ? true : orders.isDeliverd
            orders.deliveredAt = req.body.deliveredAt === 'Delivered' ? Date.now() : orders.deliveredAt

            const updatedOrders = await orders.save();
            res.json(updatedOrders)
        }else{
            res.status(404).json({message: 'order not found'})
        }

}))
// @route DELETE /api/admin/orders/:id
// @desc DELETE orders 
// @access Private/admin

orderAdminRouter.delete('/:id', profileUser, adminOnly, asyncHandler(async(req, res) =>{
        const orders = await Order.findById(req.params.id)
        if(orders){
            await orders.deleteOne();
            res.json({message: 'order removed'})
        }else{
            res.status(404).json({message: 'order not found'})
        }

}))



export default orderAdminRouter;
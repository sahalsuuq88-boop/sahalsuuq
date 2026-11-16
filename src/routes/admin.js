import express from "express";
import User from "../model/user.js";
import { profileUser, adminOnly } from "../middleware/authMiddleWare.js";

const adminRouter = express.Router();

// @route GET /api/admin/users
// @desc Get  all users (Admin only)
// @access Private/admin

adminRouter.get("/", profileUser, adminOnly, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// @route POST /api/admin/users
// @desc Add a new user(admin only)
// @access private/admin

adminRouter.post("/", profileUser, adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }
    user = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await user.save();
    res.status(201).json({message: "User created success", user})
  } catch (error) {
    console.error(error);
    res.status(500).send('server error')
    
  }
});

// @route PUT /api/admin/user/:id
// @desc Update user info (admin only)
// @access private/admin

adminRouter.put('/:id', profileUser, adminOnly, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user){
            user.name = req.body.name || user.name
            user.email = req.body.email || user.email
            user.role = req.body.role || user.role
        }
        const updatedUser = await user.save();
        res.json({message: "User updated successfull", user: updatedUser})
    } catch (error) {
        console.error(error);
        res.status(500).send('server error')
        
    }
})

// @route DELETE /api/admin/user/:id
// @desc delete user info (admin only)
// @access private/admin

adminRouter.delete('/:id', profileUser, adminOnly, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user){
            await user.deleteOne();
            res.json({message: "User delete success"})
        }else{
            res.json({message: 'user not found'})
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('server error')
        
    }
})


export default adminRouter;

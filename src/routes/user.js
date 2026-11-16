import express from "express";

import {
  changePassword,
  forgotPassword,
  getMyProfile,
  googleLogin,
  loginUser,
  registerUser,
  resetPassword,
  updateUser,
  updatePushToken,
} from "../controllers/userController.js";

import { profileUser } from "../middleware/authMiddleWare.js";

const userRouter = express.Router();

userRouter.post("/register-user", registerUser);

userRouter.post("/login-user", loginUser);

userRouter.post("/google-login", googleLogin);

// ✅ MUST COME BEFORE /:id
userRouter.put("/push-token", profileUser, updatePushToken);

userRouter.put("/change-password", profileUser, changePassword);

userRouter.get("/profile", profileUser, getMyProfile);

userRouter.put("/:id", updateUser);

userRouter.post("/forgot-password", forgotPassword);

userRouter.put("/reset-password/:token", resetPassword);

export default userRouter;
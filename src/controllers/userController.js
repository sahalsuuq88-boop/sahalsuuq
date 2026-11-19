import { googleClient, jwtSecret } from "../config/config.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, number } = req.body;

  const normalizedEmail = email.toLowerCase();

  const isUserExists = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { name },
    ],
  });

  if (isUserExists) {
    return res.status(400).json({
      success: false,
      message: "Email or name already exists",
    });
  }

  const user = new User({
    name,
    email: normalizedEmail,
    password,
    number,
    role: "customer",
  });

  await user.save();

  // JWT
  const expiresIn = 7 * 24 * 60 * 60;

  const token = jwt.sign(
    {
      id: user._id,
    },
    jwtSecret,
    {
      expiresIn,
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: expiresIn * 1000,
  });

  // Password ha loo dirin frontend
  user.password = undefined;

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: user.toJSON(),
    token,
    expiresIn,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const isUserExists = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!isUserExists) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  const isPasswordCorrect = await isUserExists.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: "Invalid password",
    });
  }

  const expiresIn = 7 * 24 * 60 * 60;

  const token = jwt.sign(
    {
      id: isUserExists._id,
    },
    jwtSecret,
    {
      expiresIn,
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: expiresIn * 1000,
  });

  // Password-ka ha u dirin frontend-ka
  isUserExists.password = undefined;

  res.status(200).json({
    success: true,

    user: isUserExists.toJSON(),

    token,

    expiresIn,
  });
});

// export const profileUser = async (req, res, next) => {
//   let token;
//   if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, jwtSecret);
//       req.user = await User.findById(decoded.id).select("-password");
//     } catch (error) {
//       console.error("Error extracting token:", error);
//       return res.status(401).send("Unauthorized: Invalid token format");

//     }
//   } else{
//     return res.status(401).send("Unauthorized: No token provided");
//   }
// }

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Google ID token is required",
    });
  }

  // Verify Google ID token
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }

  const { sub: googleId, email, name } = payload;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Google account email not found",
    });
  }

  // Find existing user
  let user = await User.findOne({
    email: email.toLowerCase(),
  });

  // Create user if doesn't exist
  if (!user) {
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      googleId,
      role: "customer",
    });
  } else {
    // Existing account
    // Add googleId if it doesn't exist
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  }

  // Generate your normal JWT
  const expiresIn = 7 * 24 * 60 * 60;

  const token = jwt.sign(
    {
      id: user._id,
    },
    jwtSecret,
    {
      expiresIn,
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: expiresIn * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Google login successful",
    user: user.toJSON(),
    token,
    expiresIn,
  });
});

export const getMyProfile = async (req, res) => {
  // Halkan req.user waxa hore u soo buuxiyay authMiddleware
  res.status(200).json(req.user);
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(user);
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hubi password kii hore
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash password cusub
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // generate token

  const resetToken = crypto.randomBytes(32).toString("hex");

  // save hashed token

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  // temporary response
  // later email ayaa diri doona

  res.json({
    message: "Reset link generated",

    resetToken,
  });
});
export const resetPassword = asyncHandler(async (req, res) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: token,

    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }

  user.password = await bcrypt.hash(req.body.password, 10);

  user.resetPasswordToken = undefined;

  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({
    message: "Password reset successful",
  });
});

export const updatePushToken = asyncHandler(async (req, res) => {
  const { pushToken, pushPlatform } = req.body;

  if (!pushToken) {
    return res.status(400).json({
      success: false,
      message: "Push token is required",
    });
  }

  console.log("================================");
  console.log("PUSH TOKEN UPDATE");
  console.log("USER ID:", req.user?._id);
  console.log("USER NAME:", req.user?.name);
  console.log("PUSH TOKEN:", pushToken);
  console.log("PLATFORM:", pushPlatform);
  console.log("================================");

  // =====================================================
  // REMOVE THIS TOKEN FROM ANY OTHER USER
  // =====================================================

  await User.updateMany(
    {
      pushToken,
      _id: { $ne: req.user._id },
    },
    {
      $unset: {
        pushToken: "",
        pushPlatform: "",
      },
    },
  );

  // =====================================================
  // SAVE TOKEN TO CURRENT USER
  // =====================================================

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      pushToken,
      pushPlatform,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  console.log("✅ PUSH TOKEN SAVED");
  console.log("USER:", user.name);
  console.log("TOKEN:", user.pushToken);

  res.status(200).json({
    success: true,
    message: "Push token saved successfully",
    pushToken: user.pushToken,
    pushPlatform: user.pushPlatform,
  });
});

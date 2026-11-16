import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: false,
      select: false,
      validate: {
        validator: function (value) {
          if (!value) return true;

          return validator.isStrongPassword(value);
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.",
      },
    },

    number: {
      type: String,
      required: false,
      validate: {
        validator: function (value) {
          if (!value) return true;

          return validator.isMobilePhone(value);
        },
        message: "Please provide a valid mobile phone number",
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "store"],
      default: "customer",
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return 
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (givenPassword) {
  if (!this.password) return false;

  return await bcrypt.compare(givenPassword, this.password);
};

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
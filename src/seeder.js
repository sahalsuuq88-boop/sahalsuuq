import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./model/product.js";
import User from "./model/user.js";
import products from "./data/products.js";
import Cart from "./model/cart.js";


dotenv.config();

// connect to MongoDB

mongoose.connect(process.env.MONGODB_URL);

// function to seed the database with sample data

const seedDatabase = async () => {
  try {
    //clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});

    //create a default admin user

    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin@1234",
      role: "admin",
    });

    // Assign the default user ID to each product

    const userID = createdUser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, userID };
    });

    // Insert sample products into the database

    await Product.insertMany(sampleProducts);
    console.log("Database seeded successfully");
    process.exit(); // Exit the process with success code
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1); // Exit the process with failure code
  }
};
seedDatabase();
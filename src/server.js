import crypto from "node:crypto";
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

import "dotenv/config";
import dns from "dns";
import http from "http";
import { Server } from "socket.io";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

import express from "express";
import cors from "cors";
import chalk from "chalk";

import connectDB from "./config/db.js";

import userRouter from "./routes/user.js";
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import checkoutRoute from './routes/checkout.js';
import orderRouter from './routes/oder.js';
import subscribeRouter from './routes/subscribe.js';

// Admin
import adminRouter from './routes/admin.js';
import productAdminRoute from './routes/productAdmin.js';
import orderAdminRouter from './routes/orderAdmin.js';
import categoryRouter from './routes/category.js';
import dashboardRouter from './routes/dashboard.js';
import customerRouter from './routes/customer.js';
import paymentRouter from './routes/payment.js';
import notificationRouter from './routes/notification.js';
import wishlistRouter from './routes/wishlist.js';
import AboutCrouter from './routes/about.js';
import ContactRouter from './routes/contects.js';
import FaqRouter from './routes/faq.js';
import AddessRouter from './routes/address.js';
import NotificationRouter from './routes/notificationRouter.js';
import systemRouter from './routes/sytemSettings.js';
import expenseRouter from './routes/expense.js';
import exchangeRateRouter from './routes/exchange.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.106:3000",
  "http://192.168.0.113:3000",
  "https://helsuuq-market.vercel.app",
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- KAN WAA WAXA LA KUSODARAY (Ping Endpoint) ---
app.get("/ping", (req, res) => {
  res.status(200).send("Server-ka Sahal Suuq wuu taagan yahay oo wuu shaqeynayaa! 🚀");
});
// ------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Waxaad ku kaydin kartaa io gudaha app si route-yada orders-ku u isticmaalaan
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected via Socket.io:", socket.id);

  // Admin-ku wuxuu geli karaa qol u gaar ah
  socket.on("joinAdminRoom", () => {
    socket.join("admins");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/exchange-rate", exchangeRateRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRoute);
app.use("/api/orders", orderRouter);
app.use("/api", subscribeRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customerRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/whishlist', wishlistRouter);
app.use('/api/about', AboutCrouter);
app.use('/api/contact', ContactRouter);
app.use('/api/faq', FaqRouter);
app.use('/api/address', AddessRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/expenses", expenseRouter);

// Admin routes
app.use('/api/admin/users', adminRouter);
app.use('/api/admin/products', productAdminRoute);
app.use('/api/admin/orders', orderAdminRouter);
app.use('/api/system-settings', systemRouter);

// DB + Server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `${chalk.green.bold("Server")} running on port ${chalk.blue.bold(PORT)}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
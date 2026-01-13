import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import "express-async-errors";
import { Server } from "socket.io";
import { createServer } from "http";

import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Needed for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Socket.IO CORS (in production same domain so no issue)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// ✅ CORS for API requests
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, cb) {
      // allow requests like Postman / server-to-server (no origin)
      if (!origin) return cb(null, true);

      // ✅ In Render (client+server together), origin will be your Render URL
      // so include CLIENT_URL in env or allow it dynamically if you want
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Initialize Socket.io
initializeSocket(io);

// ✅ Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


// ✅ Serve frontend (React build) in production
// Render will build client into client/dist
app.use(express.static(path.join(__dirname, ".

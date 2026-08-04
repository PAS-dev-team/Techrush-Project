const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "EventOS API",
    message: "Backend is running",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "OK", time: new Date().toISOString() });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true });

app.use("/api/auth", authLimiter, authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
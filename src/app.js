const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const { PORT, NODE_ENV, FRONTEND_URL } = require('./config/env');
const { prisma } = require('./config/db');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const bedRoutes = require('./modules/beds/bed.routes');
const roomRoutes = require('./modules/rooms/room.routes');
const equipmentRoutes = require('./modules/equipment/equipment.routes');
const alertRoutes = require('./modules/alerts/alert.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

// Initialize express
const app = express();

/* ---------------- SECURITY MIDDLEWARE ---------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

/* ---------------- RATE LIMIT ---------------- */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 100 : 1000,
  message: {
    success: false,
    message: "Too many requests from this IP. Try again later.",
  },
});

app.use("/api", limiter);

/* ---------------- BODY PARSER ---------------- */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------- SANITIZATION ---------------- */

app.use(mongoSanitize());

/* ---------------- COMPRESSION ---------------- */

app.use(compression());

/* ---------------- LOGGING ---------------- */

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

/* ---------------- HEALTH CHECK ---------------- */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- API ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ---------------- 404 HANDLER ---------------- */

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((error, req, res, next) => {
  logger.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: error.stack }),
  });
});

/* ---------------- GRACEFUL SHUTDOWN ---------------- */

const shutdown = async (signal) => {
  try {
    logger.info(`Received ${signal}. Closing server...`);

    await prisma.$disconnect();

    logger.info("Database disconnected");

    process.exit(0);
  } catch (err) {
    logger.error("Shutdown error:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});

module.exports = app;
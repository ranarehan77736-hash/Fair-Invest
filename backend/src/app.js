const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const apiRouter = require("./routes");
const { writeAuditLog } = require("./utils/audit");

const app = express();
const uploadsRoot = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (origin === env.clientUrl) return callback(null, true)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    // Allow frontend/admin domains to embed media served by API /uploads.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(writeAuditLog);
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static(uploadsRoot));
app.use("/api", apiRouter);

const frontendRoot = env.frontendRoot || path.resolve(process.cwd(), "..");
const frontendIndex = path.join(frontendRoot, "index.html");
const adminRoot = path.join(frontendRoot, "admin");
const adminIndex = path.join(adminRoot, "index.html");
const canServeFrontend = fs.existsSync(frontendIndex);
const canServeAdmin = fs.existsSync(adminIndex);

if (canServeAdmin) {
  app.use("/admin", express.static(adminRoot));
}

if (canServeFrontend) {
  app.use(express.static(frontendRoot));
  if (canServeAdmin) {
    app.get(/^\/admin(?:\/.*)?$/, (_req, res) => {
      res.sendFile(adminIndex);
    });
  }
  app.get(/^\/(?!api(?:\/|$)|admin(?:\/|$)).*$/, (_req, res) => {
    res.sendFile(frontendIndex);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

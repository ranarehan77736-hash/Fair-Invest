const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const db = require("../db/knex");

async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return next(new ApiError(401, "Missing authentication token"));
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await db("users").where({ id: payload.id }).select("is_blocked as isBlocked").first();
    if (!user) return next(new ApiError(401, "User not found"));
    if (user.isBlocked) return next(new ApiError(403, "Account is blocked"));
    req.user = payload;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    return next();
  };
}

module.exports = { requireAuth, requireRole };

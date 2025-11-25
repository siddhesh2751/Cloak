import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return next(new ApiError(401, "Authorization header missing"));

  const token = authHeader.split(" ")[1];
  if (!token) return next(new ApiError(401, "Access token missing"));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // attach userId and deviceId for controllers
    req.userId = decoded.userId;
    req.deviceId = decoded.deviceId;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};

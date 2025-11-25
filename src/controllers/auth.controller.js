import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Credential from "../models/credential.model.js";
import Device from "../models/device.model.js";
import { generateTokens } from "../utils/generateTokens.js";
import { compareHash } from "../utils/hash.js";
import jwt from "jsonwebtoken";


export const register = asyncHandler(async (req, res) => {
  let { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId)
    throw new ApiError(400, "username, password and deviceId are required");

  username = username.trim().toLowerCase();

  const exists = await User.findOne({ username });
  if (exists) throw new ApiError(409, "username already exists");

  const user = await User.create({ username });
  // create credential - note: credential model will hash password in pre-save
  await Credential.create({ userId: user._id, passwordHash: password });

  // generate tokens bound to device
  const { accessToken, refreshToken, refreshTokenHash } = await generateTokens({
    userId: user._id,
    deviceId
  });

  // create device entry (store hashed refresh token)
  await Device.create({
    userId: user._id,
    deviceId,
    refreshTokenHash,
    issuedAt: new Date(),
    lastSeenAt: new Date()
  });

  const outUser = await User.findById(user._id).select("-__v");

  return res
    .status(201)
    .json(new ApiResponse(201, { user: outUser, accessToken, refreshToken }, "User registered"));
});

export const login = asyncHandler(async (req, res) => {
  let { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId)
    throw new ApiError(400, "username, password and deviceId are required");

  username = username.trim().toLowerCase();

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, "User not found");

  const credential = await Credential.findOne({ userId: user._id });
  if (!credential) throw new ApiError(500, "Credentials missing");

  const ok = await credential.isPasswordCorrect(password);
  if (!ok) {
    credential.failedLogins = (credential.failedLogins || 0) + 1;
    await credential.save();
    throw new ApiError(401, "Invalid credentials");
  }

  // generate tokens and save refreshHash in device
  const { accessToken, refreshToken, refreshTokenHash } = await generateTokens({
    userId: user._id,
    deviceId
  });

  const devicePayload = {
    userId: user._id,
    deviceId,
    refreshTokenHash,
    lastSeenAt: new Date()
  };

  // update or create device record
  await Device.findOneAndUpdate(
    { userId: user._id, deviceId },
    { $set: devicePayload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { user: { id: user._id, username: user.username }, accessToken, refreshToken }, "Login successful"));
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const deviceId = req.body.deviceId;

  if (!incomingRefreshToken || !deviceId) {
      throw new ApiError(401, "refreshToken and deviceId required");
  }

  // Decode refresh token
  let decoded;
  try {
      decoded = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      );
  } catch (err) {
      throw new ApiError(401, "Invalid refresh token");
  }

  // Validate user
  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(401, "Invalid refresh token");

  // Fetch device session
  const device = await Device.findOne({
      userId: decoded.userId,
      deviceId
  });
  if (!device) throw new ApiError(401, "Device session not found");

  // Compare hash stored in DB
  const isValid = await compareHash(incomingRefreshToken, device.refreshTokenHash);
  if (!isValid) throw new ApiError(401, "Refresh token expired or revoked");

  // Generate new tokens
  const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenHash
  } = await generateTokens({
      userId: decoded.userId,
      deviceId
  });

  // Rotate refresh token
  device.refreshTokenHash = refreshTokenHash;
  device.lastSeenAt = new Date();
  await device.save();

  return res
      .status(200)
      .json(
          new ApiResponse(
              200,
              { accessToken, refreshToken: newRefreshToken },
              "Access token refreshed"
          )
      );
});



export const logout = asyncHandler(async (req, res) => {
  // Expect deviceId + optionally refreshToken to be provided
  const { deviceId } = req.body;
  const userId = req.userId; // set by middleware

  if (!deviceId) throw new ApiError(400, "deviceId required to logout this device");

  await Device.findOneAndDelete({ userId, deviceId });
  return res.status(200).json(new ApiResponse(200, null, "Logged out from device"));
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.userId;
  await Device.deleteMany({ userId });
  return res.status(200).json(new ApiResponse(200, null, "Logged out from all devices"));
});

export const listDevices = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const devices = await Device.find({ userId }).select("-refreshTokenHash -__v");
  return res.status(200).json(new ApiResponse(200, { devices }, "User devices"));
});

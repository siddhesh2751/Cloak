import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const generateTokens = async ({ userId, deviceId }) => {
    if (!userId || !deviceId) {
        throw new Error("userId and deviceId are required for token generation");
    }

    // 1. Create Access Token
    const accessToken = jwt.sign(
        {
            userId,
            deviceId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXP
        }
    );

    // 2. Create Refresh Token
    const refreshToken = jwt.sign(
        {
            userId,
            deviceId
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXP
        }
    );

    // 3. Hash refreshToken before storing in DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    return {
        accessToken,
        refreshToken,
        refreshTokenHash
    };
};

import jwt from 'jsonwebtoken';
import User from "../Models/User.Models.js";
import { generateAccessAndRefreshTokens } from "../Utils/JsonWebToken.Utils.js";


export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Optional: Verify if this refresh token exists in DB if you stored it
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ message: "Access token refreshed" });

  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
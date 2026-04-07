import jwt from 'jsonwebtoken';
import User from '../Models/User.Models.js';

export const verifyJWT = async (req, res, next) => {
  try {
    // Access cookie directly via cookie-parser
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decodedToken.id).select("-password -secretCode");

    if (!user) {
      return res.status(401).json({ message: "Invalid Access Token" });
    }

    req.user = user;
    next(); 
  } catch (error) {
    return res.status(401).json({ message: error?.message || "Invalid Access Token" });
  }
};
import jwt from "jsonwebtoken";
import { asyncError } from "./asyncErrors.js";
import ErrorHandler from "./errorHandle.middleware.js";
import { User } from "../models/userSchema.models.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  // Get the token from cookies
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("user is not authorized and authenticated", 401)
    );
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fetch the user from the database
  req.user = await User.findById(decoded.id).select("-password"); // Exclude password

  // Check if the user exists
  if (!req.user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Move to the next middleware or route handler
  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this recourse`,
          400
        )
      );
    }
    next();
  };
};

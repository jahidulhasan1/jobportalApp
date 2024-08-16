import jwt from "jsonwebtoken";

export const sendToken = (user, res, statusCode, message) => {
  if (!res || typeof res.status !== 'function') {
    console.error('Invalid res object passed to sendToken:', res);
    return;
  }
  // Generate the JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "Strict",
  };
  user.password = undefined;
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,
  });
};

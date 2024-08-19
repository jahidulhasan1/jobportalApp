import { asyncError } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/errorHandle.middleware.js";
import { User } from "../models/userSchema.models.js";
import { sendToken } from "../utils/sendToken.js";
import { handleResumeUpload } from "../helperFunctions/helperFun.userController.js";
import cloudinary from "cloudinary";
import {
  checkUserExists,
  prepareUserData,
  validateRequiredFields,
} from "../helperFunctions/helperFun.userController.js";
export const register = asyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    address,
    phone,
    firstNiche,
    secondNiche,
    thirdNiche,
    coverLetter,
  } = req.body;

  // Validate required fields
 
  if (
    validateRequiredFields(
      {
        name,
        email,
        password,
        phone,
        address,
        coverLetter,
        firstNiche,
        secondNiche,
        thirdNiche,
       
      },
      role,
      next
    )
  ) {
    console.log("lol valid");
    
    return;
  }
  // Check if the user already exists
  if (await checkUserExists(email, next)) {
    return;
  }

  // Prepare user data
  const userData = prepareUserData({
    name,
    email,
    password,
    role,
    address,
    phone,
    firstNiche,
    secondNiche,
    thirdNiche,
    coverLetter,
  });

  // Handle resume upload if provided
  if (req.files && req.files.resume) {
    const uploadResult = await handleResumeUpload(req.files.resume, next);
    if (!uploadResult) {
      return next(new ErrorHandler("please upload resume as job seeker"), 400);
      return;
    } // If an error occurred in file upload, it’s already handled
    userData.resume = uploadResult;
  }

  // Create the user
  const user = await User.create(userData);

  sendToken(user, res, 200, "Registered successfully");
});

// Helper functions

export const login = asyncError(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if all required fields are provided
  if (!role || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Find the user by email and explicitly select the password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  // const hashedPassword = await bcrypt.hash(password, 12);

  // const isMatch = await bcrypt.compare(password, hashedPassword);
  const isPasswordMatched = await user.comparePass(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  // Check if the user's role matches the provided role
  if (user.role !== role) {
    return next(new ErrorHandler("Invalid user role", 400));
  }

  // If login is successful, send a response
  sendToken(user, res, 200, "Login successful");
});

export const logout = asyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), // Expire the cookie immediately
    httpOnly: true,
    sameSite: "Strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getUser = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({
    success: true,
    user,
  });
});

export const updateProfile = asyncError(async (req, res, next) => {
  // new data obj
  const newDataObj = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
    role: req.body.role,
  };

  const { firstNiche, secondNiche, thirdNiche } = newDataObj.niches;

  if (
    newDataObj.role === "job seeker" &&
    (!firstNiche, !secondNiche, !thirdNiche)
  ) {
    return next(new ErrorHandler("niches are required", 404));
  }

  if (req.files) {
    const { resume } = req.files;

    if (resume) {
      const currentResumeId = req.user.resume.public_id;
      currentResumeId ?? (await cloudinary.uploader.destroy(currentResumeId));
    }

    const newResume = await handleResumeUpload(resume, next);
    if (!newResume) return; // If an error occurred in file upload, it’s already handled
    newDataObj.resume = newResume;
  }

  // update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, newDataObj, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  }).select("-password");

  res.status(201).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

export const updatePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePass(req.body.oldPassword);
  console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect.", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("New password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, res, 200, "Password updated successfully.");
});

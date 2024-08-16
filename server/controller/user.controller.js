import { v2 as cloudinary } from "cloudinary";

import { asyncError } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/errorHandle.middleware.js";
import { User } from "../models/userSchema.models.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/sendToken.js";
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

  // Basic validation
  if (!name || !email || !password || !phone || !address || !role) {
    return next(new ErrorHandler("All fields must be filled", 400));
  }

  if (role === "job seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
    return next(
      new ErrorHandler("Please provide all three preferred job niches", 400)
    );
  }

  // Check if user already exists
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    return next(
      new ErrorHandler("User already exists, please use a different email", 400)
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Prepare user data
  const userData = {
    name,
    email,
    password: hashedPassword,
    role,
    address,
    phone,
    niches: {
      firstNiche,
      secondNiche,
      thirdNiche,
    },
    coverLetter,
    resume: {
      public_id: "",
      url: "",
    },
  };

  // Handle file upload if resume is present
  if (req.files && req.files.resume) {
    const { resume } = req.files;

    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        { folder: "Job_Seekers_Resume" }
      );
      userData.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      return next(
        new ErrorHandler("Failed to upload resume to the cloud", 500)
      );
    }
  }

  // Create user
  const user = await User.create(userData);

 sendToken(user, res, 201, "register successfully");
});

export const login = asyncError(async(req,res,next)=>{
const {name,email,password} =req.body;

});

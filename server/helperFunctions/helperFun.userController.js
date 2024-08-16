import { v2 as cloudinary } from "cloudinary";

export const validateRequiredFields = (fields, role, next) => {
  const { name, email, password, phone, address } = fields;
  if (!name || !email || !password || !role || !phone || !address) {
    next(new ErrorHandler("All fields must be filled", 400));
    return false;
  }
  if (
    role === "job seeker" &&
    (!fields.firstNiche || !fields.secondNiche || !fields.thirdNiche)
  ) {
    next(
      new ErrorHandler("Please provide all three preferred job niches", 400)
    );
    return false;
  }
  return true;
};

export const checkUserExists = async (email, next) => {
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    next(
      new ErrorHandler("User already exists, please use a different email", 400)
    );
    return true;
  }
  return false;
};

export const prepareUserData = (data) => {
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
  } = data;
  return {
    name,
    email,
    password,
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
};

export const handleResumeUpload = async (resume, next) => {
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "Job_Seekers_Resume" }
    );
    return {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  } catch (error) {
    next(new ErrorHandler("Failed to upload resume to the cloud", 500));
    return null;
  }
};

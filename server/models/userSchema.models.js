import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [3, "Name must contain at least 3 characters"],
    maxLength: [32, "Name cannot exceed 32 characters"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    // validate: {
    //   validator: function (v) {
    //     return validator.isMobilePhone(v, 'any', { strictMode: true });
    //   },
    //   message: "Please provide a valid phone number.",
    // }
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must contain at least 8 characters"],
    maxLength: [100, "Password cannot exceed 32 characters"],
    select: false,
  },
  resume: {
    public_id: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  coverLetter: {
    type: String,
    
  },
  niches: {
    firstNiche: { type: String, default: "" },
    secondNiche: { type: String, default: "" },
    thirdNiche: { type: String, default: "" },
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: ["job seeker", "Employer"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing logic can be added as a pre-save hook here

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePass = async function (enteredPass) {
  console.log("Entered Password:", enteredPass);
  console.log("Stored Hashed Password:", this.password);

  const isMatch = await bcrypt.compare(enteredPass, this.password);


  return isMatch;
};


export const User = mongoose.model("User", userSchema);

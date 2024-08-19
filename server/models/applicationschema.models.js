import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema(
  {
    jobSeekerInfo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Please provide a valid email."],
      },
      phone: {
        type: String, // Store phone numbers as strings
        required: true,
        // validate: {
        //   validator: function (v) {
        //     return validator.isMobilePhone(v, 'any', { strictMode: true });
        //   },
        //   message: "Please provide a valid phone number.",
        // },
      },
      address: {
        type: String,
        required: true,
      },
      resume: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      coverLetter: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["job seeker"],
        required: true,
      },
    },
    employerInfo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
      role: {
        type: String,
        enum: ["Employer"], // Ensure consistent casing
        required: true,
      },
    },
    jobInfo: {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model
        required: true,
      },
      jobTitle: {
        type: String,
        required: true,
      },
    },
    deletedBy: {
      jobSeeker: {
        type: Boolean,
        default: false,
      },
      employer: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
); // Add timestamps for createdAt and updatedAt

export const Application = mongoose.model("Application", applicationSchema);

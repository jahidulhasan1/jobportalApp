import { handleResumeUpload } from "../helperFunctions/helperFun.userController.js";
import { asyncError } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/errorHandle.middleware.js";
import { Application } from "../models/applicationschema.models.js";
import { Job } from "../models/jobSchema.models.js";
// apply for job
export const postApplication = asyncError(async (req, res, next) => {
  const { id } = req.params;

  const { name, email, phone, address, coverLetter } = req.body;

  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("All fields are required.", 400));
  }
  const jobSeekerInfo = {
    id: req.user?._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "job seeker",
  };
  const jobDetails = await Job.findById(id);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    "jobSeekerInfo.id": req.user._id,
  });
  if (isAlreadyApplied) {
    return next(
      new ErrorHandler("You have already applied for this job.", 400)
    );
  }
  //  if resume uploaded then use that other wise new one upload
  if (req.files && req.files.resume) {
    const { resume } = req.files;
    const resumeResult = await handleResumeUpload(resume, next);
    if (!resumeResult) return;
    jobSeekerInfo.resume = resumeResult;
  } else {
    if (req.user && !req.user.resume.url) {
      return next(new ErrorHandler("Please upload your resume.", 400));
    }
    jobSeekerInfo.resume = {
      public_id: req.user.resume.public_id,
      url: req.user.resume.url,
    };
  }

  const employerInfo = {
    id: jobDetails.postedBy,
    role: "Employer",
  };
  const jobInfo = {
    jobId: id,
    jobTitle: jobDetails.title,
  };

  const application = await Application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res.status(201).json({
    success: true,
    message: "Application submitted.",
    application,
  });
});

export const employeeGetAllApplication = asyncError(async (req, res, next) => {
  const { _id } = req.user;

  const applications = await Application.find({
    "employerInfo.id": _id,
    "deletedBy.employer": false,
  });

  res.status(200).json({
    success: true,
    message: "Applications retrieved successfully.",
    applications,
  });
});

export const jobSeekerGetAllApplication = asyncError(async (req, res, next) => {
  const { _id } = req.user;

  const applications = await Application.find({
    "jobSeekerInfo.id": _id,
    "deletedBy.jobSeeker": false,
  });

  res.status(200).json({
    success: true,
    message: " Applications retrieved successfully.",
    applications,
  });
});

export const deleteApplication = asyncError(async (req, res, next) => {
  const { id } = req.params; //id of a job post
  console.log(req.user);
  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found.", 404));
  }

  const  {role}  = req.user;

 

  switch (role) {
    case "job seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;

    default:
      console.log("Default case for application delete function.");
      break;
  }

  if (
    application.deletedBy.employer === true ||
    application.deletedBy.jobSeeker === true
  ) {
    await application.deleteOne();
  }
  res.status(200).json({
    success: true,
    message: "Application Deleted.",
  });
});

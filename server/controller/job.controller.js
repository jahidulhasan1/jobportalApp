import {
  prepareJobData,
  validateJobInput,
} from "../helperFunctions/helperFunction.jobController.js";
import ErrorHandler from "../middleware/errorHandle.middleware.js";
import { Job } from "../models/jobSchema.models.js";
import { asyncError } from "./../middleware/asyncErrors.js";

export const postJob = asyncError(async (req, res, next) => {
  validateJobInput(req.body);
  const jobData = prepareJobData(req.body, req.user._id);

  const job = await Job.create(jobData);
  res.status(201).json({
    success: true,
    message: "Job posted successfully.",
    job,
  });
});

export const getAllJobs = asyncError(async (req, res, next) => {
  const query = {};
  if (req.query.niche) {
    query.jobNiche = req.query.niche;
  }
  if (req.query.city && typeof req.query.city === "string") {
    query.city = { $regex: req.query.city, $options: "i" };
  }

  if (req.query.searchKeyword && typeof req.query.searchKeyword === "string") {
    query.$or = [
      { title: { $regex: req.query.searchKeyword, $options: "i" } },
      { companyName: { $regex: req.query.companyName, $options: "i" } },
      { introduction: { $regex: req.query.introduction, $options: "i" } },
    ];
  }
  const jobs = await Job.find(query);
  res.status(200).json({
    success: true,
    message: "All jobs retrieved successfully.",
    jobs,
    jobsLength: jobs.length,
  });
});
export const getMyAllJobs = asyncError(async (req, res, next) => {
  const userId = req.user._id;

  const jobs = await Job.find({ postedBy: userId });

  res.status(201).json({
    success: true,
    message: " retrieved jobs successfully.",
    jobs,
  });
});

export const deleteJobs = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("job post not found", 404));
  }

  await Job.deleteOne();

  res.status(201).json({
    success: true,
    message: " Job deleted successfully.",
    job,
  });
});

export const getJobDetails = asyncError(async (req, res, next) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("job post not found", 404));
    }
  
    res.status(200).json({
      success: true,
      message: " Job deleted successfully.",
      job,
    });

   
});

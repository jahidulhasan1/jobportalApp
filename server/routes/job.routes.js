import express from "express";
import {
  deleteJobs,
  getAllJobs,
  getJobDetails,
  getMyAllJobs,
  postJob,
} from "../controller/job.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/createjob", isAuthenticated, isAuthorized("Employer"), postJob);

router.get("/getalljobs", getAllJobs);
router.get(
  "/getmyjobs",
  isAuthenticated,
  isAuthorized("Employer"),
  getMyAllJobs
);

router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Employer"),
  deleteJobs
);

router.get("/getjobdetails/:id", isAuthenticated, getJobDetails);

export default router;

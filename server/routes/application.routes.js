import express from "express";
import {
  deleteApplication,
  employeeGetAllApplication,
  jobSeekerGetAllApplication,
  postApplication,
} from "../controller/application.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/post/:id",isAuthenticated,isAuthorized("job seeker"), postApplication);

router.get(
  "/employer/getall",
  isAuthenticated,
  isAuthorized("Employer"),
  employeeGetAllApplication
);

router.get(
  "/jobseeker/getall",
  isAuthenticated,
  isAuthorized("job seeker"),
 jobSeekerGetAllApplication
);

router.delete("/delete/:id", isAuthenticated,deleteApplication);

export default router;

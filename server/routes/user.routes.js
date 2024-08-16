import express from "express";
import {
  getUser,
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

router.get("/user/:id", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
export default router;

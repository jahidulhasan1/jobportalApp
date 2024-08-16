import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { dbConnect } from "./db/db.connect.js";
import { ErrorMiddleware } from "./middleware/errorHandle.middleware.js";
import cloudinary from "cloudinary";

import fileUpload from "express-fileupload";
import userRouter from "./routes/user.routes.js";
const app = express();

config({ path: "./config/.env" });
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "HEAD", "POST", "PUT"],
    credentials: true, // Corrected from "credential"
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/users", userRouter);
dbConnect();

app.get("/", (req, res) => {
  res.send("App started");
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
app.use(ErrorMiddleware);

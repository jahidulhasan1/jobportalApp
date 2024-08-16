
import { mongoose } from 'mongoose';
// connect db
export const dbConnect = () =>
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "jobPortalDb",
    })
    .then(() => {
      console.log("connected to MongoDB");
    })
    .catch((err) => {
      console.log("error from db", err);
    });

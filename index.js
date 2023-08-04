import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import videoRoute from "./routes/videoRoute.js";
import commentRoute from "./routes/commentRoute.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const corsOptions = {
  origin: "https://youtube-frontend.onrender.com",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
// const corsOptions = {
//   origin: "https://localhost:8000",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

dotenv.config({ path: "./config.env" });

const app = express();

const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("DB connection successful!"))
    .catch((err) => {
      throw err;
    });
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/video", videoRoute);
app.use("/api/comment", commentRoute);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "something went wrong";

  return res.status(status).json({
    success: "false",
    status: status,
    message: message,
  });
});

app.listen(8000, () => {
  connect();
  console.log(`App running on port 8000...`);
});

////////////////////////////////////////////////////////////////////////////////////////

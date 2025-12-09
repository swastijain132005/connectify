import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/post.routes.js";
import userroutes from "./routes/user.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));



mongoose.connect(process.env.MONGO_URI)
  .then(() => 
    console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/", postRoutes);
app.use("/", userroutes);

app.listen(5000, () => console.log("Server running on 5000"));

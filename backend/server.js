import "dotenv/config"; // 🔥 MUST be first line

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
import path from "path";

import postRoutes from "./routes/post.routes.js";
import userroutes from "./routes/user.routes.js";

const app = express();




app.use(cors());
app.use(express.json());

app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(process.cwd(), "public/images")));



app.use("/", postRoutes);
app.use("/", userroutes);

app.set("etag", false);

app.listen(5000, () => console.log("Server running on 5000"));

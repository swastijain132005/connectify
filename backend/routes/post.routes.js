import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createpost,
  getAllPosts,
  deletepost,
} from "../controllers/post.controller.js";

import {
  commentpost,
  getAllComments,
  deleteComment,
  incrementLikes,
  decrementLikes,
  getPostsbyuserid,
} from "../controllers/post.controller.js";

import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "public", "images", "posts"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

router.post("/createpost", authMiddleware, upload.single("file"), createpost);
router.get("/getPosts", authMiddleware, getAllPosts);
router.post("/deletepost", authMiddleware, deletepost);
router.post("/commentPost", authMiddleware, commentpost);
router.get("/getComments/:postId", authMiddleware, getAllComments);
router.post("/deleteComment", authMiddleware, deleteComment);
router.post("/incrementLikes", authMiddleware, incrementLikes);
router.post("/decrementLikes", authMiddleware, decrementLikes);
router.get("/getPostsByUserId/:userid", authMiddleware, getPostsbyuserid);

export default router;

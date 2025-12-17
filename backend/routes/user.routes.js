import { Router } from "express";
import path from "path";
import multer from "multer";

import { authMiddleware } from "../middleware/auth.js"; // your JWT middleware
import {
  register,
  login,
  logout,
  updateProfilePicture,
  updateuserprofile,
  getAllUsers,
  getUserById,
  downloadprofile,
  send_conn_req,
  getConnectionRequests,
  getConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyProfile,
  chatbot,
  getMatchedProfiles,
  getConnectionStatus
} from "../controllers/usercontroller.js";

const router = Router();

// -------------------- Multer setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "public", "images", "profiles"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});
const upload = multer({ storage });

// -------------------- Auth routes --------------------
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

// -------------------- User routes --------------------
router.put(
  "/update-profile-picture",
  authMiddleware,
  upload.single("profilepicture"),
  updateProfilePicture
);

router.put("/updateprofile", authMiddleware, updateuserprofile); // use PUT for updates
router.get("/users", authMiddleware, getAllUsers);
router.get("/user/:id", authMiddleware, getUserById);
router.get("/user/:id/download_resume", authMiddleware, downloadprofile);

// -------------------- Connection routes --------------------
router.post("/send_conn_req", authMiddleware, send_conn_req);
router.get("/get_conn_req", authMiddleware, getConnectionRequests);
router.get("/get_conns", authMiddleware, getConnections);
router.post("/accept_conn_req", authMiddleware, acceptConnectionRequest);
router.post("/reject_conn_req", authMiddleware, rejectConnectionRequest);
router.get("/myprofile", authMiddleware, getMyProfile);
router.post("/api/chatbot", authMiddleware, chatbot);
router.get("/getMatchedProfiles", authMiddleware, getMatchedProfiles);
router.get("/getConnectionStatus/:id", authMiddleware, getConnectionStatus);

export default router;

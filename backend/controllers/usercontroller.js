import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Profile from "../models/profile.model.js";
import Connection from "../models/connection.model.js";
import Post from "../models/post.model.js";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";



// ---------------------------------------------------
// REGISTER
// ---------------------------------------------------
export const register = async (req, res) => {
  const { name, email, password, username } = req.body;

  try {
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    if (password.length < 10) {
      return res.status(400).json({ message: "Password must be at least 10 characters long" });
    };

    const existingUser2 = await User.findOne({ username });
    if (existingUser2)
      return res.status(400).json({ message: "Username already exists" });


    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      username,
      password: hash,
    });

    // Create linked profile
    await Profile.create({
      userid: newUser._id,
      name,
      about: "I am a new user",
      currentpost: "I am a new user",
          bannerpicture: "uploads/banner.jpg",

      education: {
        school: "I am a new user",
        degree: "I am a new user",
        fieldofstudy: "I am a new user",
      },
      work: {
        company: "I am a new user",
        position: "I am a new user",
        year: "I am a new user",
      },
    });

    

    const token = newUser.generateAuthToken();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// LOGIN
// ---------------------------------------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "Invalid Credentials" });

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
        profilepicture: existingUser.profilepicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// GET ALL USERS
// ---------------------------------------------------
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const users = await User.find({
      _id: { $ne: req.user.id }
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({
      _id: { $ne: req.user.id }
    });

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ---------------------------------------------------
// GET USER BY ID (req.params.id)
// ---------------------------------------------------
export const getUserById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userid: req.params.id }).populate("userid", "name username email profilepicture");
    console.log("Profile:", profile);
    if (!profile) return res.status(400).json({ message: "User not found" });

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// LOGOUT
// ---------------------------------------------------
export const logout = async (req, res) => {
  return res.status(200).json({ message: "Logged out" });
};

// ---------------------------------------------------
// UPLOAD PROFILE PICTURE
// ---------------------------------------------------
const url = process.env.NEXT_BACKEND_URL;
export const updateProfilePicture = async (req, res) => {
  try {
     
    const imagePath = `/images/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilepicture: imagePath },
      { new: true }
    );

    res.json({
      success: true,
      profilepicture: user.profilepicture,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------------------------------------------
// UPDATE PROFILE (Profile model, not User)
// ---------------------------------------------------
export const updateuserprofile = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const updatedProfile = await Profile.findOneAndUpdate(
      { userid: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ profile: updatedProfile });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------
// DOWNLOAD PROFILE (PDF or Picture)
// ---------------------------------------------------


export const downloadprofile = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the user whose resume we want

    const profile = await Profile.findOne({ userid: id }).populate("userid", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Create PDF Document
    const doc = new PDFDocument();

    // Set headers so browser treats response as file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${profile.userid.name}_Resume.pdf`
    );

    // Pipe PDF to the response
    doc.pipe(res);

    // ---------------------------
    //  HEADER
    // ---------------------------
    doc.fontSize(22).text(profile.userid.name, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(profile.userid.email, { align: "center" });
    doc.moveDown(2);

    // ---------------------------
    //  ABOUT
    // ---------------------------
    doc.fontSize(16).text("About", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(profile.about || "N/A");
    doc.moveDown(1.5);

    // ---------------------------
    //  EDUCATION
    // ---------------------------
    doc.fontSize(16).text("Education", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`School: ${profile.education?.school || "N/A"}`);
    doc.text(`Degree: ${profile.education?.degree || "N/A"}`);
    doc.text(`Field: ${profile.education?.fieldofstudy || "N/A"}`);
    doc.moveDown(1.5);

    // ---------------------------
    //  WORK EXPERIENCE
    // ---------------------------
    doc.fontSize(16).text("Work Experience", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Company: ${profile.work?.company || "N/A"}`);
    doc.text(`Position: ${profile.work?.position || "N/A"}`);
    doc.text(`Year: ${profile.work?.year || "N/A"}`);
    doc.moveDown(1.5);

    // ---------------------------
    //  SKILLS (optional)
    // ---------------------------
    if (profile.skills?.length) {
      doc.fontSize(16).text("Skills", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(profile.skills.join(", "));
      doc.moveDown(1.5);
    }

    // End the PDF
    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ---------------------------------------------------
// SEND CONNECTION REQUEST
// ---------------------------------------------------
export const send_conn_req = async (req, res) => {
  try {
    const sender = req.user.id;
    const { conn_id } = req.body;

    const receiver = await User.findById(conn_id);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const exists = await Connection.findOne({
      sender,
      receiver: conn_id,
    });

    if (exists) return res.status(400).json({ message: "Already sent" });

    const request = await Connection.create({
      sender,
      receiver: conn_id,
      status: "pending",
    });

    res.status(200).json({ message: "Request Sent", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// GET CONNECTION STORIES
// ---------------------------------------------------
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name username profilepicture")
      .populate("receiver", "name username profilepicture");

    // 🔑 Normalize data
    const formattedConnections = connections.map((conn) => {
      const isSender = conn.sender._id.toString() === userId;

      return {
        _id: conn._id,
        user: isSender ? conn.receiver : conn.sender,
        connectedAt: conn.updatedAt,
      };
    });

    res.status(200).json({ connections: formattedConnections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ---------------------------------------------------
// ACCEPT REQUEST
// ---------------------------------------------------
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conn_id } = req.body;

    const request = await Connection.findOne({
      sender: conn_id,
      receiver: userId,
      status: "pending",
    });

    if (!request)
      return res.status(400).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    res.status(200).json({ message: "Request Accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// REJECT REQUEST
// ---------------------------------------------------
export const rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conn_id } = req.body;

    const request = await Connection.findOne({
      sender: conn_id,
      receiver: userId,
      status: "pending",
    });

    if (!request)
      return res.status(400).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Request Rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// GET ALL REQUESTS SENT TO YOU
// ---------------------------------------------------
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name username profilepicture");

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userid = req.user.id;
    const profile = await Profile.findOne({ userid })
      .populate("userid", "username email profilepicture");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Service function (no res here)
export async function matchProfiles(profile) {
  const matchedProfiles = await Profile.find({
    _id: { $ne: profile._id },
    $or: [
      { currentpost: profile.currentpost },
      { "work.position": profile.work?.position },
      { "work.company": profile.work?.company }
    ]
  })
  .limit(5)
  .populate("userid", "name username email profilepicture");

  return matchedProfiles;
}

// Route handler
export const getMatchedProfilesHandler = async (req, res) => {
  try {
    const userProfile = await Profile.findOne({ userid: req.user.id });
    if (!userProfile) return res.status(404).json({ message: "Profile not found" });

    const matchedProfiles = await matchProfiles(userProfile);
    res.status(200).json({ profiles: matchedProfiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const chatbot= async (req, res) => {
  try {
    const {  question, extraData } = req.body;

    if ( !question) {
      return res.status(400).json({ error: "Missing inputs" });
    }

    const profile = await Profile.findOne({ userid: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 🔹 Prompt
    const prompt = `
You are a career guidance AI.

User Profile:
- Education: ${profile.education.degree}
- Skills: ${profile.skills.join(", ")}
- Career Interest: ${profile.careerInterest}
- Location: ${profile.location}

Additional Info (not stored in DB):
${JSON.stringify(extraData)}

Rules:
- Suggest practical career advice
- Be concise
- Focus on India-specific opportunities
- Avoid generic motivation

User Question:
${question}
`;

    // 🔹 Gemini Call
    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();

    // 🔹 Profile Matching
    const matchedProfiles = await matchProfiles(profile);

    res.json({
      reply: aiReply,
      matchedProfiles
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI response failed" });
  }
};

export const getMatchedProfiles = async (req, res) => {
  try {
    const { search } = req.query;

    const users = await User.find({
      name: { $regex: search, $options: "i" },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching matched profiles" });
  }
};

export const getConnectionStatus = async (req, res) => {
  const me = req.user.id;
  const other = req.params.id;

  const connection = await Connection.findOne({
    $or: [
      { sender: me, receiver: other },
      { sender: other, receiver: me }
    ]
  });

  if (!connection) {
    return res.json({ status: "Connect" });
  }

  return res.json({ status: connection.status });
};


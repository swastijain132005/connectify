import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Profile from "../models/profile.model.js";
import Connection from "../models/connection.model.js";

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// ---------------------------------------------------
// Convert Profile to PDF
// ---------------------------------------------------
export const convertUserDataToPDF = async (userprofile) => {
  return new Promise((resolve, reject) => {
    const folder = path.join(process.cwd(), "public", "images", "profiles");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const pdfPath = path.join(folder, "resume.pdf");
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Add profile picture
    if (userprofile.userid.profilepicture) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        "images",
        "profiles",
        path.basename(userprofile.userid.profilepicture)
      );

      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 20, 20, { width: 100, height: 100 });
      }
    }

    doc.fontSize(14).text(`Name: ${userprofile.name}`, 20, 140);
    doc.text(`Email: ${userprofile.email}`);
    doc.text(`Username: ${userprofile.userid.username}`);
    doc.text(`About: ${userprofile.about}`);
    doc.moveDown();

    doc.text("Education:");
    doc.text(`School: ${userprofile.education.school}`);
    doc.text(`Degree: ${userprofile.education.degree}`);
    doc.text(`Field of Study: ${userprofile.education.fieldofstudy}`);
    doc.moveDown();

    doc.text("Work:");
    doc.text(`Company: ${userprofile.work.company}`);
    doc.text(`Position: ${userprofile.work.position}`);
    doc.text(`Year: ${userprofile.work.year}`);

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};

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
          bannerpicture: "http://localhost:5000/uploads/banner.jpg",

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
    const users = (await User.find().select("-password") .sort({ createdAt: -1 }));;
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
export const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profilepicture = `/images/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Profile picture updated",
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
    const profile = await Profile.findOne({ userid: req.user.id });

    if (!profile) return res.status(400).json({ message: "Profile not found" });

    const { name, about, currentpost, education, work } = req.body;

    profile.name = name;
    profile.about = about;
    profile.currentpost = currentpost;
    profile.education = education;
    profile.work = work;

    await profile.save();

    res.status(200).json({ message: "Profile updated", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// DOWNLOAD PROFILE (PDF or Picture)
// ---------------------------------------------------
export const downloadprofile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userid: req.user.id });

    if (!profile) return res.status(400).json({ message: "Profile not found" });

    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "profiles",
      "resume.pdf"
    );

    return res.download(filePath);
  } catch (error) {
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

    res.status(200).json({ connections });
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

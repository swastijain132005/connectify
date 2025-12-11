import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: { type: String, required: true },
    about: { type: String, default: "I am a new user" },
    currentpost: { type: String, default: "I am a new user" },
    bannerpicture: { type: String ,default:"http://localhost:5000/uploads/banner.jpg"},

    education: {
      school: { type: String, default: "N/A" },
      degree: { type: String, default: "N/A" },
      fieldofstudy: { type: String, default: "N/A" },
    },

    work: {
      company: { type: String, default: "N/A" },
      position: { type: String, default: "N/A" },
      year: { type: String, default: "N/A" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

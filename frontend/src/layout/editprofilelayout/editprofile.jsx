import React, { useState } from "react";
import styles from "./style.module.css";
import axiosClient from "@/config/axios";
import { useAuthStore } from "@/counterstore";

export default function EditProfileModal({ profile, onClose, onSave }) {
  const token = useAuthStore((state) => state.token);

  const [formData, setFormData] = useState({
    about: profile.about || "",
    currentpost: profile.currentpost || "",
    skills: profile.skills?.join(", ") || "",
    careerInterest: profile.careerInterest || "",
    location: profile.location || "",
    education: { ...profile.education },
    work: { ...profile.work },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await axiosClient.put("/updateprofile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave(res.data.profile); // update parent UI
      onClose();
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  return (
    <div className={styles.overlay} onClick={()=>{
        onClose();
    }}>
      <div className={styles.modal} onClick={(e)=>{
        e.stopPropagation();

      }}>
        <h2>Edit Profile</h2>

        <label>About</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
        />

        <label>Current Post</label>
        <input
          name="currentpost"
          value={formData.currentpost}
          onChange={handleChange}
        />

        <label>Skills (comma separated)</label>
        <input
          name="skills"
          value={formData.skills}
          onChange={handleChange}
        />

        <label>Career Interest</label>
        <input
          name="careerInterest"
          value={formData.careerInterest}
          onChange={handleChange}
        />

        <label>Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
        />

        <h3>Education</h3>
        <input
          placeholder="School"
          value={formData.education.school}
          onChange={(e) =>
            handleNestedChange("education", "school", e.target.value)
          }
        />
        <input
          placeholder="Degree"
          value={formData.education.degree}
          onChange={(e) =>
            handleNestedChange("education", "degree", e.target.value)
          }
        />
        <input
          placeholder="Field of Study"
          value={formData.education.fieldofstudy}
          onChange={(e) =>
            handleNestedChange("education", "fieldofstudy", e.target.value)
          }
        />

        <h3>Work</h3>
        <input
          placeholder="Company"
          value={formData.work.company}
          onChange={(e) =>
            handleNestedChange("work", "company", e.target.value)
          }
        />
        <input
          placeholder="Position"
          value={formData.work.position}
          onChange={(e) =>
            handleNestedChange("work", "position", e.target.value)
          }
        />
        <input
          placeholder="Year"
          value={formData.work.year}
          onChange={(e) =>
            handleNestedChange("work", "year", e.target.value)
          }
        />

        <div className={styles.actions}>
          <button onClick={handleSubmit}>💾 Save</button>
          <button onClick={onClose}>❌ Cancel</button>
        </div>
      </div>
    </div>
  );
}

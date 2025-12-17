import React, { useState, useEffect } from "react";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import axiosClient from "@/config/axios";
import { useAuthStore } from "@/counterstore";
import styles from "./style.module.css";
import ChatbotModal from "@/layout/chatbotlayout/chatbotModal";
import EditProfileModal from "@/layout/editprofilelayout/editprofile";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export default function Profile() {


  const token = useAuthStore((state) => state.token);

const [profile, setProfile] = useState({});
const [openModal, setOpenModal] = useState(null);
const [activeModal, setActiveModal] = useState(null);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("MY PROFILE DATA:", res.data);
        setProfile(res.data.profile);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfilePicChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profilepicture", file);

  try {
    const res = await axiosClient.put("/update-profile-picture", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // 🔥 Update UI instantly
    setProfile((prev) => ({
      ...prev,
      userid: {
        ...prev.userid,
        profilepicture: res.data.profilepicture,
      },
    }));
  } catch (err) {
    console.error(err);
  }
};




  if (!profile) {
  return (
    <Userlayout>
      <Dashboardlayout>
        <p style={{ padding: "20px" }}>Loading profile...</p>
      </Dashboardlayout>
    </Userlayout>
  );
}


  return (
    <Userlayout>
      <Dashboardlayout>
        <div className={styles.pro_profile_page}>

          {/* Banner */}
          <div className={styles.pro_main}>

          <div className={styles.pro_banner}>
            <img
              src={
                profile.bannerpicture && profile.bannerpicture.trim() !== ""
                  ? `${BACKEND_URL}/${profile.bannerpicture}`
                  : "/images/default-banner.jpg"
              }
              alt="banner"
              className={styles.pro_banner_img}
            />
          </div>

          {/* Main Card */}
          <div className={styles.pro_main_card}>
            
            {/* Profile Header */}
            <div className={styles.pro_profile_header}>
              <div className={styles.pro_avatar_wrapper}>
  <div className={styles.pro_avatar}>
    <img
      src={
`${BACKEND_URL}${profile.userid?.profilepicture}`         
      }
      alt="avatar"
    />
  </div>

  <label htmlFor="profilePicInput" className={styles.pro_edit_icon}>
  edit
  </label>

  <input
    type="file"
    id="profilePicInput"
    accept="image/*"
    hidden
    onChange={handleProfilePicChange}
  />
</div>

<div className={styles.pro_profile_card2}>

  <h1 className={styles.pro_name}>{profile.name}</h1>
              <p className={styles.pro_about}>{profile.about}</p>
</div>

<div className={styles.buttonGroup}>
<button
  className={styles.actionButtons}
  onClick={async () => {
    try {
      const res = await axiosClient.get(
        `/user/${profile?.userid._id}/download_resume`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.name}_Resume.pdf`;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  }}
>
  📄 My Resume
</button>

<button
  className={styles.actionButtons} onClick={() => setActiveModal("edit")}
  
>
  ✏️ Edit Profile
</button>

<button
  className={styles.chatbotButton} onClick={() => setOpenModal(true)}
  
>
<i class="fa-solid fa-message"></i> chatbot 
</button>

</div>
          </div>    

            </div>
             </div>

            {/* Education */}
            <div className={styles.pro_section}>
              <h2>🎓 Education</h2>
              <p><strong>School:</strong> {profile.education?.school}</p>
              <p><strong>Degree:</strong> {profile.education?.degree}</p>
              <p><strong>Field of Study:</strong> {profile.education?.fieldofstudy}</p>
            </div>

            {/* Work */}
            <div className={styles.pro_section}>
              <h2>💼 Work Experience</h2>
              <p><strong>Company:</strong> {profile.work?.company}</p>
              <p><strong>Position:</strong> {profile.work?.position}</p>
              <p><strong>Year:</strong> {profile.work?.year}</p>
            </div>

            <div className={styles.pro_section}>
              <h2>🤹 Skills</h2>
              <p><strong>Skills:</strong> {profile.skills?.join(", ")}</p>
              <p><strong>Career Interest:</strong> {profile.careerInterest}</p>
              <p><strong>Location:</strong> {profile.location}</p>
            </div>


            {openModal && (
  <ChatbotModal
    isOpen={openModal}
    onClose={() => setOpenModal(false)}
  />
)}

{activeModal === "edit" && (
  <EditProfileModal
    profile={profile}
    onClose={() => setActiveModal(null)}
    onSave={(updatedProfile) => setProfile(updatedProfile)}
  />
)}


         
        </div>
      </Dashboardlayout>
    </Userlayout>
  );
}

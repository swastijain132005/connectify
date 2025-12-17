import React, { useState, useEffect } from "react";
import axiosClient from "@/config/axios";
import styles from "./style.module.css";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import { useAuthStore } from "@/counterstore";
import { useRouter } from "next/router";
import UserPosts from "@/layout/userpostslayout";
import toast from "react-hot-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState(" connect");

  const token = useAuthStore((state) => state.token);

  const [profile, setProfile] = useState({
    education: {},
    work: {},
  });


  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    if (!id || !token) return;

    try {
      const res = await axiosClient.get(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data.profile);

    
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, token]);

  // ---------------- SEND CONNECTION REQUEST ----------------
  const handleclick = async () => {
  if (status !== "Connect") return;

  try {
    await axiosClient.post(
      "/send_Conn_req",
      { conn_id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ UPDATE UI IMMEDIATELY
    setStatus("Request Sent");
    toast.success("Connection request sent");

  } catch (err) {
    console.log("ERROR:", err);
    toast.error("Failed to send request");
  }
};

  const fetchConnectionStatus = async () => {
  try {
    const res = await axiosClient.get(`/getConnectionStatus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStatus( res.data.status);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchConnectionStatus();
},[id, token]);





  return (
    <Userlayout>
      <Dashboardlayout>
        <div className={styles.page}>

          {/* ---------- TOP PROFILE HEADER ---------- */}
          <div className={styles.header}>
            <img
              src={`${BACKEND_URL}/${profile?.bannerpicture}`}
              className={styles.banner}
              alt="banner"
            />

            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <img
                  src={`${BACKEND_URL}${profile.userid?.profilepicture}`}
                  alt="avatar"
                  className={styles.profilePic}
                />

                <div>
                  <h1>{profile.name}</h1>
                  <p className={styles.bio}>{profile.about}</p>
                  <p className={styles.position}>{profile.currentpost}</p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.connectBtn}
                   disabled={status !== "Connect"}
                 
                  onClick={handleclick}
                >
                  {status}
                </button>

                <button className={styles.msgBtn}>Message</button>
              </div>
            </div>
          </div>

          {/* ---------- BODY LAYOUT ---------- */}
          <div className={styles.body}>

            {/* LEFT SIDE – POSTS */}
            <div className={styles.leftSide}>
              <UserPosts userId={id} token={token} />
            </div>

            {/* RIGHT SIDE – DETAILS */}
            <div className={styles.rightSide}>

              <div className={styles.card}>
                <h2>About</h2>
                <p>{profile.about}</p>
              </div>

              <div className={styles.card}>
                <h2>Education</h2>
                <p>{profile.education?.school}</p>
                <p>{profile.education?.degree}</p>
                <p>{profile.education?.fieldofstudy}</p>
              </div>

              <div className={styles.card}>
                <h2>Work</h2>
                <p>{profile.work?.company}</p>
                <p>{profile.work?.position}</p>
                <p>{profile.work?.year}</p>
              </div>

            </div>
          </div>
        </div>
      </Dashboardlayout>
    </Userlayout>
  );
}

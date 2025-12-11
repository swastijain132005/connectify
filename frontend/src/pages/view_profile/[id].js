import React, { useState, useEffect } from "react";
import axiosClient from "@/config/axios";
import styles from "./style.module.css";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import { useAuthStore } from "@/counterstore";
import { useRouter } from "next/router";
import UserPosts from "@/layout/userpostslayout";

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  console.log("the id is", id) // 👈 GET CLICKED USER ID FROM URL

  const token = useAuthStore((state) => state.token);

  const [profile, setProfile] = useState({
    education: {},
    work: {}
  });

  const fetchProfile = async () => {
    if (!id) return; // Wait for router to load id

    try {
      const res = await axiosClient.get(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data.profile);
      console.log("Fetched profile:", res.data.profile);

    } catch (err) {

      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    console.log("PROFILE DATA:", profile);
  }, [id]);

  return (
    <Userlayout>
      <Dashboardlayout>
        <div className={styles.page}>

          {/* ---------- TOP PROFILE HEADER ---------- */}
          <div className={styles.header}>
            <img src={profile?.bannerpicture} className={styles.banner} />

            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <img
                  src={profile?.userid?.profilepicture}
                  className={styles.profilePic}
                />

                <div>
                  <h1>{profile.name}</h1>
                  <p className={styles.bio}>{profile.about}</p>
                  <p className={styles.position}>{profile.currentpost}</p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.connectBtn}>Connect</button>
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

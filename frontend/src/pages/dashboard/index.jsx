"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import styles from "./style.module.css";
import { useAuthStore, usePostStore } from "@/counterstore";
import PostsFeed from "@/layout/postslayout";
import axiosClient from "@/config/axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const addPost = usePostStore((state) => state.addPost);

  const [postText, setPostText] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);

  // Redirect to login if user not available
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const handlePost = async () => {
    if ((!postText || !postText.trim()) && !file) return;
    if (posting) return;

    setPosting(true);

    const formData = new FormData();
    if (postText.trim()) formData.append("body", postText.trim());
    if (file) formData.append("file", file);

    try {
      const res = await axiosClient.post("/createpost", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.post;

      // Add post to Zustand store
      addPost({
        _id: data._id,
        body: data.body,
        media: data.media ? `/images/posts/${data.media}` : null,
        userid: {
          name: data.author,
          profilepicture: user.profilepicture,
        },
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      });

      // Clear input and file
      setPostText("");
      setFile(null);
    } catch (err) {
      console.error("Post error:", err.response?.data?.message || err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Userlayout>
      <Dashboardlayout>
        <div className="scrollcomponent">
          <div className={styles.createpostcontainer}>
            {/* Row 1: Profile */}
            <div className={styles.profileRow}>
              <img
                className={styles.profilepic}
                src={`${BACKEND_URL}${user?.profilepicture}`}
              />
              <div className={styles.emptySpace}></div>
            </div>

            {/* Row 2: Input */}
            <input
              className={styles.postinput}
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              disabled={posting}
            />

            {/* Row 3: Upload + Post */}
            <div className={styles.bottomrow}>
              <label className={styles.filelabel}>
                {file ? file.name : "Upload Image"}
                <input
                  type="file"
                  className={styles.fileinput}
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={posting}
                />
              </label>

              {(postText.trim() || file) && (
                <button
                  type="button"
                  className={styles.postbutton}
                  onClick={handlePost}
                  disabled={posting}
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feed */}
        <PostsFeed />
      </Dashboardlayout>
    </Userlayout>
  );
}

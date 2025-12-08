"use client";

import { useEffect, useState } from "react";
import { useAuthStore, usePostStore } from "@/counterstore";
import styles from "./style.module.css";

export default function PostsFeed() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { posts, setPosts } = usePostStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || !token) {
        setError("User not logged in");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch("http://localhost:5000/getPosts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server did not return JSON. Check backend!");
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch posts");
        }

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Fetch posts error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, token, setPosts]);

  if (loading) return <p className={styles.status}>Loading posts...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (!posts.length) return <p className={styles.status}>No posts yet</p>;

  return (
    <div className={styles.postsFeed}>
     
      {posts.map((post) => (
  <div key={post._id} className={styles.postCard}>
    <div className={styles.postHeader}>
      <img
        src={post.userid?.profilepicture} // optional chaining avoids crash
        alt={post.userid?.name}
        className={styles.profilePic}
      />
      <span>{post.userid?.name}</span>
    </div>
    <p className={styles.postText}>{post.body}</p> {/* match your schema */}
    {post.media && (   /* match your schema */
      <img src={post.media} alt="Post media" className={styles.postImage} />
    )}
  </div>
))}

    </div>
  );
}

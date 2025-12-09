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

  const handleLike = (post) => {
    console.log("🔥 HANDLE LIKE CLICKED");
    alert("button clicked");
  };


  const handleShare = (post) => {
  const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`);
const text = encodeURIComponent(post.body);
window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");

};


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

    <div className={styles.postFooterContainer}>
  <div className={styles.postFooter}>
    <span className={styles.postFooterText}>{post.likes}</span>
    <i className="fa-regular fa-thumbs-up"></i>
  </div>

  <div className={styles.postFooter}>
    <span className={styles.postFooterText}>{post.comments?.length || 0}</span>
    <i className="fa-regular fa-comment-dots"></i>
  </div>
  <div  onClick={() => handleShare(post)}>
    <i className="fa-regular fa-share-from-square"></i>
</div>
  </div>

  

  </div>
      ))}

    </div>
  );
}

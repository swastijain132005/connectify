"use client";

import { useEffect, useState } from "react";
import { useAuthStore, usePostStore } from "@/counterstore";
import styles from "./style.module.css";
import axiosClient from "@/config/axios";
import CommentModal from "@/layout/commentlayout";

export default function PostsFeed() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { posts, setPosts } = usePostStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const [likesCount, setLikesCount] = useState({});
    const [liked, setLiked] = useState({});
const [disliked, setDisliked] = useState({});
const [openModal, setOpenModal] = useState(null);


  


  const handleShare = (post) => {
  const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`);
const text = encodeURIComponent(post.body);
window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");

};


 const handleLike = async (postId) => {
  if (liked[postId]) return; // already liked

  try {
    const res = await axiosClient.post("/incrementLikes", { id: postId });

    setLikesCount((prev) => ({
      ...prev,
      [postId]: res.data.post.likes,
    }));

    setLiked((prev) => ({ ...prev, [postId]: true }));
    setDisliked((prev) => ({ ...prev, [postId]: false }));
  } catch (error) {
    console.error("Error liking:", error);
  }
};

const handleDislike = async (postId) => {
  if (disliked[postId]) return; // already disliked

  try {
    const res = await axiosClient.post("/decrementLikes", { id: postId });

    setLikesCount((prev) => ({
      ...prev,
      [postId]: res.data.post.likes,
    }));

    setDisliked((prev) => ({ ...prev, [postId]: true }));
    setLiked((prev) => ({ ...prev, [postId]: false }));
  } catch (error) {
    console.error("Error disliking:", error);
  }
};
useEffect(() => {
  if (posts.length > 0) {
    const initialCounts = {};
    posts.forEach(p => {
      initialCounts[p._id] = p.likes;
    });
    setLikesCount(initialCounts);
  }
}, [posts]);

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
    
    {/* --- Header --- */}
    <div className={styles.postHeader}>
      <img
        src={post.userid?.profilepicture}
        alt={post.userid?.name}
        className={styles.profilePic}
      />
      <div className={styles.postUserInfo}>
        <h4 className={styles.userName}>{post.userid?.name}</h4>
        <p className={styles.postTime}>
          {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Options */}
      <button className={styles.moreBtn}>⋮</button>
    </div>

    {/* --- Post Text --- */}
    <p className={styles.postText}>{post.body}</p>

    {/* --- Media Image --- */}
    {post.media && (
      <div className={styles.postImageWrapper}>
        <img src={post.media} alt="Post media" className={styles.postImage} />
      </div>
    )}

    {/* --- Footer Buttons --- */}
    <div className={styles.footerRow}>
      <button
        className={styles.actionBtn}
        onClick={() => handleLike(post._id)}
      >
        👍 {likesCount[post._id] || 0}
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => handleDislike(post._id)}
      >
        👎
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => setOpenModal(post._id)}
      >
        💬 {post.comments?.length || 0}
      </button>

      <button className={styles.actionBtn} onClick={() => handleShare(post)}>
        🔁
      </button>
    </div>

    {/* Comments modal */}
    {openModal === post._id && (
      <CommentModal
        postId={openModal}
        onClose={() => setOpenModal(null)}
      />
    )}
  </div>
))}


    </div>
  );
}

import React, { useEffect, useState } from "react";
import axiosClient from "@/config/axios";
import styles from "./style.module.css";

export default function UserPosts({ userId, token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axiosClient.get(`/getPostsByUserId/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Error loading user posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  if (loading) return <p>Loading posts...</p>;
  if (!posts.length) return <p>No posts yet</p>;

  return (
    <div className={styles.postsWrapper}>
      {posts.map((post) => (
        <div key={post._id} className={styles.postCard}>
<small className={styles.likesText}>
  posted at: {post.createdAt}
</small>          <p className={styles.body}>{post.body}</p>
          {post.media && (
            <img src={post.media} className={styles.image} />
          )}
<small className={styles.likesText}>
  Likes: {post.likes}
</small>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuthStore, usePostStore } from "@/counterstore";
import styles from "./style.module.css";
import axiosClient from "@/config/axios";
import CommentModal from "@/layout/commentlayout";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PostsFeed() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const posts = usePostStore((state) => state.posts);
  const setPosts = usePostStore((state) => state.setPosts);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [likesCount, setLikesCount] = useState({});
  const [liked, setLiked] = useState({});
  const [disliked, setDisliked] = useState({});
  const [openModal, setOpenModal] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  /* ---------------- Init Likes ---------------- */
  useEffect(() => {
    const counts = {};
    posts.forEach((p) => (counts[p._id] = p.likes));
    setLikesCount(counts);
  }, [posts]);

  /* ---------------- Fetch Posts ---------------- */
  const fetchPosts = async (reset = false) => {
    if (!user || !token || loading || (!hasNextPage && !reset)) return;

    setLoading(true);
    try {
      const res = await axiosClient.get(`/getPosts?page=${reset ? 1 : page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newPosts = Array.isArray(res.data.posts) ? res.data.posts : [];

      if (reset) {
        setPosts(newPosts); // replace on reset (page 1 or refresh)
        setPage(2);
      } else {
        setPosts([...posts, ...newPosts]); // append for pagination
        setPage((prev) => prev + 1);
      }

      setHasNextPage(res.data.hasNextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Reset on login change ---------------- */
  useEffect(() => {
    if (!user || !token) return;
    fetchPosts(true); // reset posts on login/token change
  }, [user, token]);

  /* ---------------- Actions ---------------- */
  const handleLike = async (id) => {
    if (liked[id]) return;

    const res = await axiosClient.post("/incrementLikes", { id });
    setLikesCount((p) => ({ ...p, [id]: res.data.post.likes }));
    setLiked((p) => ({ ...p, [id]: true }));
    setDisliked((p) => ({ ...p, [id]: false }));
    setPosts(posts.map(p => p._id === id ? { ...p, likes: res.data.post.likes } : p));
  };

  const handleDislike = async (id) => {
    if (disliked[id]) return;

    const res = await axiosClient.post("/decrementLikes", { id });
    setLikesCount((p) => ({ ...p, [id]: res.data.post.likes }));
    setDisliked((p) => ({ ...p, [id]: true }));
    setLiked((p) => ({ ...p, [id]: false }));
    setPosts(posts.map(p => p._id === id ? { ...p, likes: res.data.post.likes } : p));
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
  };

  /* ---------------- UI ---------------- */
  if (loading && posts.length === 0) return <p className={styles.status}>Loading posts...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (!posts.length) return <p className={styles.status}>No posts yet</p>;

  return (
    <div className={styles.postsFeed}>
      {posts.map((post) => (
        <div key={post._id} className={styles.postCard}>
          <div className={styles.postHeader}>
            <img
              src={post.userid?.profilepicture ? `${BACKEND_URL}${post.userid.profilepicture}` : "/default-avatar.png"}
              className={styles.profilePic}
            />
            <div>
              <h4>{post.userid?.name}</h4>
              <p>{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <p>{post.body}</p>
          {post.media && <img src={post.media} className={styles.postImage} />}

          <div className={styles.footerRow}>
            <button onClick={() => handleLike(post._id)}>👍 {likesCount[post._id] || 0}</button>
            <button onClick={() => handleDislike(post._id)}>👎</button>
            <button onClick={() => setOpenModal(post._id)}>💬 {post.comments?.length || 0}</button>
          </div>

          {openModal === post._id && (
            <CommentModal
              postId={post._id}
              onClose={() => setOpenModal(null)}
              onCommentAdded={(newComment) => handleCommentAdded(post._id, newComment)}
            />
          )}
        </div>
      ))}

      {hasNextPage && (
        <button className={styles.loadMore} onClick={() => fetchPosts()} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

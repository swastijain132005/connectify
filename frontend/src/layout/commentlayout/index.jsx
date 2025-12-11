"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/config/axios";
import styles from "./style.module.css";

export default function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments when modal opens
  const fetchComments = async () => {
    try {
      const res = await axiosClient.get(`/getComments/${postId}`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  };

  // Post new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axiosClient.post("/commentPost", {
        postId,
        commentBody: newComment,
      });

      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment", err);
    }
  };

  // Delete comment
  const handleDelete = async (id) => {
    try {
      await axiosClient.post("/deleteComment", { id });

      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>

        <h3>Comments</h3>

        <div className={styles.commentsList}>
          {comments.length === 0 ? (
            <p>No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <img
                    src={c.author?.profilepicture}
                    className={styles.profilePic}
                    alt="pp"
                  />
                  <span className={styles.username}>{c.author?.username}</span>
                </div>

                <p className={styles.commentText}>{c.content}</p>

                {c.userid === undefined ||
                c.userid === c.author?._id ? (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Send</button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import { useRouter } from "next/router";
import axiosClient from "@/config/axios";
import { useAuthStore } from "@/counterstore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Alluserlayout({ users }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalUsers = users ?? allUsers; // ⭐ KEY LINE

  useEffect(() => {
    // Fetch ALL users only when users prop is NOT passed
    if (users !== undefined) return;

    const fetchAllUsers = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const res = await axiosClient.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAllUsers(res.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [users, token]);

  // UI states
  if (loading) return <p className={styles.status}>Loading users...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (!finalUsers.length)
    return <p className={styles.status}>No users found</p>;

  return (
    <div className={styles.usersFeed}>
      {finalUsers.map((u) => (
        <div
          key={u._id}
          className={styles.userCard}
          onClick={() => router.push(`/view_profile/${u._id}`)}
        >
          <div className={styles.postHeader}>
            <img
              src={`${BACKEND_URL}${u.profilepicture}`}
              alt={u.name}
              className={styles.profilePic}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className={styles.userInfo}>
              <span className={styles.name}>{u.name}</span>
              <span className={styles.username}>@{u.username}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

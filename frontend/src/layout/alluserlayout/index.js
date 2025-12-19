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
  const [page, setPage] = useState(1);
const [hasNextPage, setHasNextPage] = useState(true);


  const finalUsers = users ?? allUsers; // ⭐ KEY LINE

  const fetchAllUsers = async () => {
  if (!token || !hasNextPage) return;

  setLoading(true);
  setError("");

  try {
    const res = await axiosClient.get(
      `/users?page=${page}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAllUsers(prev => [...prev, ...(res.data.users || [])]);
    setHasNextPage(res.data.hasNextPage);
    setPage(prev => prev + 1);
  } catch (err) {
    setError(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (users !== undefined) return;
  fetchAllUsers();
}, [token]);

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

      {hasNextPage && (
  <button
    className={styles.loadMore}
    onClick={fetchAllUsers}
    disabled={loading}
  >
    {loading ? "Loading..." : "Load More"}
  </button>
)}

    </div>
  );
}

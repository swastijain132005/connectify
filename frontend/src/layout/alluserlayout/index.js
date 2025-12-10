import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/counterstore";
import styles from "./style.module.css";

export default function AllUsers() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !token) {
        setError("User not logged in");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch("http://localhost:5000/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token]);

  if (loading) return <p className={styles.status}>Loading users...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (!users.length) return <p className={styles.status}>No users yet</p>;

  return (
    <div className={styles.usersFeed}>
      {users.map((u) => (
        <div key={u._id} className={styles.userCard}>
          <div className={styles.postHeader}>
            <img
              src={u.profilepicture}
              alt={u.name}
              className={styles.profilePic}
            />
            <span>{u.name}</span>
            <span>@{u.username}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

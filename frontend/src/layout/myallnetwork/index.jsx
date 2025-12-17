import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import axiosClient from "@/config/axios";
import { useRouter } from "next/router";
import { useAuthStore } from "@/counterstore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Mynetwork() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [connections, setConnections] = useState([]);

  const fetchConnections = async () => {
    if (!token) return;

    try {
      const res = await axiosClient.get("/get_Conns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConnections(res.data.connections || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [token]);

  return (
    <div className={styles.container}>
      {connections.length === 0 ? (
        <p className={styles.status}>No connections found</p>
      ) : (
        connections.map((conn) => (
          <div
            key={conn._id}
            className={styles.card}
            onClick={() => router.push(`/view_profile/${conn.user._id}`)}
          >
            <img
              src={`${BACKEND_URL}${conn.user.profilepicture}`}
              alt="profile"
              className={styles.avatar}
            />
            <h3>{conn.user.name}</h3>
            <p>@{conn.user.username}</p>
          </div>
        ))
      )}
    </div>
  );
}

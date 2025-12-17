import React, { useState, useEffect } from "react";
import axiosClient from "@/config/axios";
import styles from "./style.module.css";
import { useRouter } from "next/router";
import toast from "react-hot-toast";


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function MyRequest() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  async function getrequest() {
    try {
      const res = await axiosClient.get("/get_Conn_req");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getrequest();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await axiosClient.post("/accept_conn_req", { conn_id: id });
      console.log(res);
      setRequests((prev) =>
        prev.filter((req) => req._id !== id)
      );

      toast.success("Request Accepted");
    } catch (err) {
      console.log(err);
        toast.error("Error accepting request");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axiosClient.post("/reject_conn_req", { conn_id: id });
      console.log(res);
      setRequests((prev) =>
        prev.filter((req) => req._id !== id)
      );

      toast.success("Request Rejected");
    } catch (err) {
      console.log(err);
        toast.error("Error rejecting request");
    }
  };

  

  return (

    <div className={styles.container}>
      <div className={styles.requests}>
        {requests.map((request) => (
          <div
            key={request._id}
            className={styles.requestCard}
            onClick={() =>
              router.push(`/view_profile/${request.sender._id}`)
            }
          >
            <img
              src={`${BACKEND_URL}${request.sender.profilepicture}`}
              alt="Profile Picture"
              className={styles.profilePic}
            />

            <h3>{request.sender.name}</h3>
            <p>@{request.sender.username}</p>

            <div className={styles.actions} onClick={(e)=>{
                e.stopPropagation();

            }

            }>
              <button onClick={(id)=>{
                handleAccept(request.sender._id)
              }}>Accept</button>
              <button onClick={(id)=>{
                handleReject(request.sender._id)
              }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

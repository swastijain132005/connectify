import React from 'react'
import styles from './style.module.css'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/counterstore'
import axiosClient from '@/config/axios'
import { useState, useEffect } from 'react'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function dashboardlayout({ children }) {
  const[topprofiles, setTopProfiles] = useState([]);

        const router = useRouter();

        const token = useAuthStore((state) => state.token);
        const user = useAuthStore((state) => state.user);

         const getmatchedprofilesfortopprofiles = async () => {
          if (!token) return;

          try {
            const res = await axiosClient.get("/matchProfiles", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("🔥 RESPONSE RECEIVED:", res.data);
            setTopProfiles(res.data.profiles || []);
          } catch (err) {
            console.error(
              "Post error:",
              err.response?.data?.message || err.message
            );
          }
        };

        useEffect(() => {
  getmatchedprofilesfortopprofiles();
}, [token]);


  return (

    <div>dashboardlayout
        <div className="container">
      <div className={styles.homecontainer}>
        <div onClick ={()=>{router.push('/dashboard')}} className={styles.homecontainer_left}>
            <div className={styles.sidebaroptions}>
                <i className="fa-solid fa-house"></i>
                <p>Home</p>
            </div>

            <div onClick={()=>{router.push('/discover')}} className={styles.sidebaroptions}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <p>Discover</p>
            </div>

            <div onClick={()=>{router.push('/myprofile')}} className={styles.sidebaroptions}>
              <i class="fa-solid fa-user"></i>
               <p>My profile</p>
            </div>


            <div onClick={()=>{router.push('/myconnections')}} className={styles.sidebaroptions}>
            <i className="fa-solid fa-users"></i> 
               <p>My connections</p>
            </div>

            
        
        </div>
        <div className={styles.homecontainer_feed_container}>

            {children}
        </div>
      <div className={styles.homecontainer_extra_container}>
        <h3>Top profiles</h3>
        <div className={styles.topprofiles}>
          {topprofiles.map((profile) => (
            <div
              key={profile._id}
              className={styles.topprofile}
              onClick={() => router.push(`/view_profile/${profile.userid._id}`)}
            >
              <img
                src={`${BACKEND_URL}${profile.userid.profilepicture}`}
                alt="profile"
                className={styles.avatar}
              />
            <div className={styles.topprofileText}>
  <h3>{profile.userid.name}</h3>
  <p>@{profile.userid.username}</p>
</div>

            </div>
          ))}
        </div>
      </div>







      
      </div>

      
    </div>
    </div>
  )
}

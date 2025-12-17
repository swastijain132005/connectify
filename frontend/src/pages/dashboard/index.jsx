import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import styles from "./style.module.css";
import { useAuthStore } from "@/counterstore";
import { usePostStore } from "@/counterstore";
import PostsFeed from "@/layout/postslayout";
import axiosClient from "@/config/axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
const token = useAuthStore.getState().token;
  const router = useRouter();
  const { posts, addPost, setPosts } = usePostStore();


  useEffect(() => {
    if (!user) router.push("/login"); 
  }, [user, router]);

  const [post, setPost] = React.useState("");
  const [file, setFile] = React.useState();

  const handlePost = async () => {
  console.log("🔥 HANDLE POST CLICKED");

  if (!post && !file) return;

  const formData = new FormData();
  formData.append("body", post);
  if (file) formData.append("file", file);

  try {
    const res = await axiosClient.post("/createpost", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set Content-Type manually for FormData
      },
    });

    const data = res.data;

    // Convert DB post → frontend UI format
    usePostStore.getState().addPost({
      id: data.post._id,
      text: data.post.body,
      image: data.post.media
        ? `/images/posts/${data.post.media}`
        : null,
      user: {
        name: data.post.author,
        profilepicture: user.profilepicture,
      },
    });

    setPost("");
    setFile(null);

    console.log("🔥 RESPONSE RECEIVED:", res.status);
  } catch (err) {
    console.error(
      "Post error:",
      err.response?.data?.message || err.message
    );
  }
};



  return (
    <Userlayout>
      <Dashboardlayout>
        <div className="scrollcomponent">
          
<div className={styles.createpostcontainer}>

  {/* Row 1: Profile pic + empty space for future user details */}
  <div className={styles.profileRow}>
    <img className={styles.profilepic} src={`${BACKEND_URL}${user?.profilepicture}`} />
    <div className={styles.emptySpace}></div>
  </div>

  {/* Row 2: Full width input */}
  <input
    className={styles.postinput}
    placeholder="What's on your mind?"
    value={post}
    onChange={(e) => setPost(e.target.value)}
  />

  {/* Row 3: Upload + Post buttons */}
  <div className={styles.bottomrow}>
    <label className={styles.filelabel}>
      {file ? file.name : "Upload Image"}
      <input
        type="file"
        className={styles.fileinput}
        onChange={(e) => setFile(e.target.files[0])}
      />
    </label>
{post.length > 0 &&
<button type="button" className={styles.postbutton} onClick={handlePost}>
      Post
    </button>}
    
  </div>

</div>


          
        </div>
        <PostsFeed/>
      </Dashboardlayout>
    </Userlayout>
  );
}

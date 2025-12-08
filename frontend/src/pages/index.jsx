import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import Navbar from "@/components/navbar";

export default function Home() {
  const Router = useRouter();
  return (
    <>
    <Navbar/>

    <div className={styles.container}>
      <div className={styles.main_container}>
        <div className={styles.main_container_left}>
          <p>connect with friends without exaggeration</p>
          <p>A True Social media platform with stories no bluffs!!</p>
          <div onClick={()=>{
            Router.push("/login");
          }} className={styles.buttonjoin}>
            <p>Join Now</p>
          </div>
        </div>
        <div className={styles.main_container_right}>
          <img src="images/connect.jpg" alt="Logo" width={200} height={200} />
        </div>
      </div>
    </div>
    </>
  );
}

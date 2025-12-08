import React from 'react'
import styles from './styles.module.css'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/counterstore';

export default function Navbarcomponent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
  const logout = useAuthStore.getState().logout; // get logout function from store
  logout();  // clear user + token
  router.push("/login"); // redirect to login page
};


  return (
    <div className={styles.container}>
  <nav className={styles.navbar}>
    <h1 className={styles.logo} onClick={() => router.push("/")}>
      connectify
    </h1>

    {/* Right side buttons */}
    <div className={styles["navbar-buttons"]}>
      {!user && (
        <p className={styles.welcome}>
          Welcome to connectify, start by logging in now!!
        </p>
      )}

      {user && (
        <>
          <button
            className={styles.buttonjoin}
            onClick={() => router.push("/dashboard")}
          >
            Profile
          </button>
          <button className={styles.buttonjoin} onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  </nav>
</div>

  );
}

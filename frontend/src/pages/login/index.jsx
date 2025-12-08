"use client";

import { useAuthStore } from "@/counterstore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import UserLayout from "@/layout/userlayout";
import styles from "./style.module.css";


import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function LoginPage() {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const [isLogin, setIsLogin] = useState(true); // toggle form
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -------------------- LOGIN --------------------
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      login(res.data.user, res.data.token);
      toast.success("Login successful");
setTimeout(() => {
  router.push("/dashboard");
}, 1000);    } catch (err) {
      alert("Invalid credentials");
    }
  };

  // -------------------- REGISTER --------------------
  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/register", {
        
        username,
        name,
        email,
        password,
      });

      login(res.data.user, res.data.token);
      toast.success("Registration successful");
     setTimeout(() => {
  router.push("/dashboard");
}, 1000);  
  } catch (err) {
      
      console.log("REGISTER FRONTEND ERROR →", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <UserLayout>
      <ToastContainer />
      <div className={styles.container}>
        <div className={styles.card}>
          
          {/* LEFT SIDE */}
          <div className={styles.left}>
            <h1 className={styles.title}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className={styles.subtitle}>
              {isLogin
                ? "Login to continue your journey"
                : "Join us and explore fresh connections"}
            </p>

            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Full Name"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={isLogin ? handleLogin : handleRegister}
              className={styles.button}
            >
              {isLogin ? "Login" : "Register"}
            </button>

            <p
              onClick={() => setIsLogin(!isLogin)}
              className={styles.switch}
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.right}></div>
        </div>
      </div>
    </UserLayout>
  );
}

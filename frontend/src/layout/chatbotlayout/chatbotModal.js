"use client";
import { useState } from "react";
import axios from "axios";
import styles from "./style.module.css";
import axiosClient from "@/config/axios";

export default function ChatbotModal({ isOpen, onClose}) {
  const [messages, setMessages] = useState([]); // chat history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosClient.post(
        `/api/chatbot`,
        {
          
          question: input,
          extraData: {
            experienceLevel: "Beginner",
            industry: "Technology"}
        }
      );

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply }
      ]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to get response. Try again." }
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>AI Chatbot</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.sender === "user" ? styles.userMsg : styles.aiMsg}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className={styles.aiMsg}>Typing...</div>}
        </div>

        <div className={styles.footer}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Userlayout from "@/layout/userlayout";
import Dashboardlayout from "@/layout/dashboardlayout";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import styles from "./style.module.css";
import { purple } from "@mui/material/colors";
import Alluserlayout from "@/layout/alluserlayout";
import axiosClient from "@/config/axios";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [asked, setAsked] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const res = await axiosClient.get("/getMatchedProfiles", {
        params: { search },
      });
      setUsers(res.data.users || []);
      setAsked(true);
      setSearch("");
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  return (
    <Userlayout>
      <Dashboardlayout>
        <div className={styles.container}>
          <div className={styles.searchBox}>
            <TextField
              fullWidth
              label="Search profiles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Button
            variant="contained"
            style={{ backgroundColor: purple[500] }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {asked ? (
  <Alluserlayout users={users} />
) : (
  <Alluserlayout />   // full user layout
)}


      </Dashboardlayout>
    </Userlayout>
  );
}

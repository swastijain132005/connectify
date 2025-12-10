import React from 'react'
import Userlayout from '@/layout/userlayout';
import Dashboardlayout from '@/layout/dashboardlayout';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import styles from './style.module.css';
import { purple } from '@mui/material/colors';
import Alluserlayout from '@/layout/alluserlayout';

export default function discoverpage() {
  return (
    <Userlayout>
      <Dashboardlayout>
        <div className={styles.container}><Box sx={{ width: 700, maxWidth: '100%' }}>
      <TextField fullWidth label="search profiles" id="fullWidth" />
    </Box>
      <Button variant="contained" style={{backgroundcolor: purple[500]}}>
        Search
      </Button>
      
      </div>

      
    <Alluserlayout></Alluserlayout>
      </Dashboardlayout>
    </Userlayout>
  )
}

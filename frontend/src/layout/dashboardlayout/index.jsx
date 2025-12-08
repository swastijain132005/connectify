import React from 'react'
import styles from './style.module.css'
import { useRouter } from 'next/router'

export default function dashboardlayout({ children }) {

        const router = useRouter();

  return (

    <div>dashboardlayout
        <div className="container">
      <div className={styles.homecontainer}>
        <div onClick ={()=>{router.push('/dashboard')}} className={styles.homecontainer_left}>
            <div className={styles.sidebaroptions}>
                <i class="fa-solid fa-house"></i>
                <p>Home</p>
            </div>

            <div onClick={()=>{router.push('/discover')}} className={styles.sidebaroptions}>
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>Discover</p>
            </div>


            <div onClick={()=>{router.push('/myconnections')}} className={styles.sidebaroptions}>
            <i class="fa-solid fa-users"></i> 
               <p>My connections</p>
            </div>

            
        
        </div>
        <div className={styles.homecontainer_feed_container}>

            {children}
        </div>
      <div className={styles.homecontainer_extra_container}>
        <h3>Top profiles</h3>
      </div>
      </div>

      
    </div>
    </div>
  )
}

import React from 'react'
import Userlayout from '@/layout/userlayout';
import Dashboardlayout from '@/layout/dashboardlayout';
import axiosClient from '@/config/axios';
import Myrequest from '@/layout/myrequests';
import Mynetwork from '@/layout/myallnetwork';

export default function Myconnectionspage() {
  return (
    <Userlayout>
      <Dashboardlayout>

        <Myrequest />
        <Mynetwork />
      </Dashboardlayout>
    </Userlayout>
  )
}

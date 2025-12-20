import React from 'react'
import Navbarcomponent from '@/components/Navbar/index.jsx';

export default function index({children}) {
  return (
    <div>
<Navbarcomponent/>

<main>{children}</main>

    </div>
  )
}

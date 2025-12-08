import React from 'react'
import Navbarcomponent from '@/components/navbar'

export default function index({children}) {
  return (
    <div>
<Navbarcomponent/>

<main>{children}</main>

    </div>
  )
}

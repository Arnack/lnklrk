"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

// Pages where the navbar should NOT be shown
const hideNavbarPaths = [
  "/login",
  "/auth",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password"
]

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Check if current path should hide the navbar
  const shouldHideNavbar = hideNavbarPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // Also hide on root path (assuming it's a landing page)
  if (pathname === "/" || shouldHideNavbar) {
    return null
  }
  
  return <Navbar />
} 
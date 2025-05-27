"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-12 h-9">
        <span className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-12 h-9 text-sm font-medium transition-all
      backdrop-blur-md bg-gray-500/20
      shadow-none
      border-none cursor-pointer bg-transparent
      "
    >
      <span className="text-gray-200 dark:text-gray-200 mix-blend-difference">
        {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </Button>
  )
}

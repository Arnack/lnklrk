"use client"

import { useContext } from "react"
import { Button } from "@/components/ui/button"
import { LanguageContext } from "@/context/language-provider"
import { Language } from "@/lib/translations"
import "./globals.css"

export function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext)

  const toggleLanguage = () => {
    const newLanguage: Language = language === "en" ? "zh" : "en"
    setLanguage(newLanguage)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="w-12 h-9 text-sm font-medium transition-all
      backdrop-blur-md bg-gray-500/20
      shadow-none
      border-none cursor-pointer bg-transparent
      "
    >
      <span className="text-gray-200 dark:text-gray-200 mix-blend-revert">
        {language === "en" ? "中文" : "EN"}
      </span>
    </Button>
  )
}

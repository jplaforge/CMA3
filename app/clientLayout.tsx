"use client"

import type React from "react"

import "./globals.css"
import { useEffect, useState } from "react"
import { getContrastingTextColor, normalizeColorToHex } from "@/lib/utils"

interface RealtorProfile {
  realtor_url: string
  realtor_name?: string
  agency_name?: string
  primary_color?: string
  secondary_color?: string
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [bodyStyle, setBodyStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const realtorProfileString = localStorage.getItem("realtorProfile")
    let originalBg = ""
    let originalColor = ""
    let normalizedPrimary: string | null = null
    let normalizedSecondary: string | null = null

    if (realtorProfileString) {
      try {
        const profile: RealtorProfile = JSON.parse(realtorProfileString)

        normalizedPrimary = normalizeColorToHex(profile.primary_color || "")
        normalizedSecondary = normalizeColorToHex(profile.secondary_color || "")

        if (normalizedPrimary) {
          document.documentElement.style.setProperty("--primary", normalizedPrimary)
        }
        if (normalizedSecondary) {
          document.documentElement.style.setProperty("--secondary", normalizedSecondary)
          const contrastingTextColor = getContrastingTextColor(normalizedSecondary)

          originalBg = document.body.style.backgroundColor
          originalColor = document.body.style.color
          setBodyStyle({ backgroundColor: "var(--secondary)", color: contrastingTextColor })
        }
      } catch (error) {
        console.error("[ClientLayout] Failed to parse realtor profile from localStorage:", error)
      }
    }

    return () => {
      if (normalizedPrimary) {
        document.documentElement.style.removeProperty("--primary")
      }
      if (normalizedSecondary) {
        document.documentElement.style.removeProperty("--secondary")
      }
      if (originalBg || originalColor) {
        setBodyStyle({ backgroundColor: originalBg, color: originalColor })
      }
    }
  }, [])

  return (
    <html lang="en">
      <body style={bodyStyle}>{children}</body>
    </html>
  )
}

"use client"

import type React from "react"

import "./globals.css"
import { useEffect, useState } from "react"
import { getContrastingTextColor } from "@/lib/utils" // Assuming getContrastingTextColor is in lib/utils.ts

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
    console.log("[ClientLayout] useEffect triggered")
    const realtorProfileString = localStorage.getItem("realtorProfile")
    console.log("[ClientLayout] realtorProfileString from localStorage:", realtorProfileString)

    if (realtorProfileString) {
      try {
        const profile: RealtorProfile = JSON.parse(realtorProfileString)
        console.log("[ClientLayout] Parsed profile:", profile)

        if (profile && profile.secondary_color) {
          console.log("[ClientLayout] Found secondary_color:", profile.secondary_color)
          const contrastingTextColor = getContrastingTextColor(profile.secondary_color)
          console.log("[ClientLayout] Calculated contrastingTextColor:", contrastingTextColor)

          setBodyStyle({
            backgroundColor: profile.secondary_color,
            color: contrastingTextColor,
          })
          console.log("[ClientLayout] bodyStyle set to:", {
            backgroundColor: profile.secondary_color,
            color: contrastingTextColor,
          })
        } else {
          console.log("[ClientLayout] No secondary_color found in profile or profile is invalid.")
        }
      } catch (error) {
        console.error("[ClientLayout] Failed to parse realtor profile from localStorage:", error)
      }
    } else {
      console.log("[ClientLayout] No realtorProfile found in localStorage.")
    }
  }, [])

  return (
    <html lang="en">
      <body style={bodyStyle}>{children}</body>
    </html>
  )
}

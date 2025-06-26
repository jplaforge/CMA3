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
    const realtorProfileString = localStorage.getItem("realtorProfile")

    if (realtorProfileString) {
      try {
        const profile: RealtorProfile = JSON.parse(realtorProfileString)

        if (profile && profile.secondary_color) {
          const contrastingTextColor = getContrastingTextColor(profile.secondary_color)

          setBodyStyle({
            backgroundColor: profile.secondary_color,
            color: contrastingTextColor,
          })
        } else {
        }
      } catch (error) {
        console.error("[ClientLayout] Failed to parse realtor profile from localStorage:", error)
      }
    } else {
    }
  }, [])

  return (
    <html lang="en">
      <body style={bodyStyle}>{children}</body>
    </html>
  )
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value?: string | number | null, showNA = true, currencySymbol = "$") => {
  if (value === null || value === undefined || value === "") return showNA ? "N/A" : ""
  const num = Number(value)
  return isNaN(num)
    ? showNA
      ? String(value)
      : ""
    : `${currencySymbol}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` // No decimals for typical real estate prices
}

export const formatNumber = (value?: string | number | null, showNA = true) => {
  if (value === null || value === undefined || value === "") return showNA ? "N/A" : ""
  const num = Number(value)
  return isNaN(num) ? (showNA ? String(value) : "") : num.toLocaleString()
}

export const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) {
      // Try to parse common date formats if initial parsing fails or if it's just a year
      if (typeof dateString === "string" && dateString.match(/^\d{4}$/)) return dateString // Just a year
      return "N/A" // Or return original string: String(dateString)
    }
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch (e) {
    return String(dateString) // Fallback to original string if parsing fails
  }
}

export const formatSqFt = (value?: string | number | null, showNA = true) => {
  if (value === null || value === undefined || value === "") return showNA ? "N/A" : ""
  const num = Number(value)
  return isNaN(num) ? (showNA ? String(value) : "") : `${num.toLocaleString()} sq ft`
}

// Helper to determine text color based on background brightness
export function getContrastingTextColor(hexColor?: string): string {
  if (!hexColor) return "#000000" // Default to black if no color provided

  // Remove # if present
  hexColor = hexColor.replace("#", "")

  // Convert hex to RGB
  const r = Number.parseInt(hexColor.substring(0, 2), 16)
  const g = Number.parseInt(hexColor.substring(2, 4), 16)
  const b = Number.parseInt(hexColor.substring(4, 6), 16)

  // Calculate HSP (Highly Sensitive Poo)
  // http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using HSP value, determine whether black or white text is better
  return hsp > 127.5 ? "#000000" : "#FFFFFF" // Threshold can be adjusted
}

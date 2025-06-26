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
export function getContrastingTextColor(color?: string): string {
  const rgb = parseCssColor(color)
  if (!rgb) return "#000000" // Fallback to black if parsing fails

  const [r, g, b] = rgb

  // Calculate HSP (Highly Sensitive Poo)
  // http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using HSP value, determine whether black or white text is better
  return hsp > 127.5 ? "#000000" : "#FFFFFF" // Threshold can be adjusted
}

// Exported so API routes can validate and normalize colors returned by the LLM
export function parseCssColor(color?: string): [number, number, number] | null {
  if (!color) return null

  let hex = color.replace(/^#/, "")
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return [r, g, b]
  }
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return [r, g, b]
  }

  const rgbMatch = color
    .replace(/\s+/g, "")
    .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})/i)
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10),
    ]
  }

  if (typeof document !== "undefined") {
    const el = document.createElement("div")
    el.style.color = color
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const domMatch = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    if (domMatch) {
      return [
        parseInt(domMatch[1], 10),
        parseInt(domMatch[2], 10),
        parseInt(domMatch[3], 10),
      ]
    }
  }

  return null
}

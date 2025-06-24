import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const OPENAI_ENABLED = Boolean(process.env.OPENAI_API_KEY)

// Attempt to extract structured data from any JSON-LD scripts found in the page
const extractStructuredData = ($: cheerio.CheerioAPI): Record<string, string> => {
  const result: Record<string, string> = {}
  $("script[type='application/ld+json']").each((_, el) => {
    const jsonText = $(el).contents().text().trim()
    if (!jsonText) return
    try {
      const parsed = JSON.parse(jsonText)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (typeof item !== "object" || !item) continue
        const type = (item["@type"] || "") as string
        if (/House|Residence|Apartment|Condo/i.test(type)) {
          if (item.address) {
            if (typeof item.address === "string") {
              result.address = item.address
            } else if (typeof item.address === "object") {
              const parts: string[] = []
              if (item.address.streetAddress) parts.push(item.address.streetAddress)
              if (item.address.addressLocality) parts.push(item.address.addressLocality)
              if (item.address.addressRegion) parts.push(item.address.addressRegion)
              if (item.address.postalCode) parts.push(item.address.postalCode)
              result.address = parts.filter(Boolean).join(", ")
            }
          }
          if (item.geo) {
            if (item.geo.latitude) result.latitude = String(item.geo.latitude)
            if (item.geo.longitude) result.longitude = String(item.geo.longitude)
          }
          if (item.offers && item.offers.price) {
            result.askingPrice = String(item.offers.price)
          }
          if (item.name) result.title = item.name
          if (item.image) result.imageUrl = Array.isArray(item.image) ? item.image[0] : item.image
          if (item.description) result.description = item.description
          if (item.numberOfBedrooms) result.beds = String(item.numberOfBedrooms)
          if (item.numberOfBathroomsTotal) result.baths = String(item.numberOfBathroomsTotal)
          if (item.floorSize && item.floorSize.value) result.sqft = String(item.floorSize.value)
          if (item.yearBuilt) result.yearBuilt = String(item.yearBuilt)
          if (type) result.propertyType = type
          break
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  })
  return result
}

// Helper function to extract numeric values from text
const extractNumber = (text: string | undefined | null): string => {
  if (!text) return ""
  return text.replace(/[^0-9.]/g, "")
}

const parseCoordinate = (coord: string | undefined | null): number | undefined => {
  if (!coord) return undefined
  const num = Number.parseFloat(coord)
  return isNaN(num) ? undefined : num
}

// Zod schema for the dedicated price extraction
const priceSchema = z.object({
  askingPrice: z
    .string()
    .nullable()
    .describe("The asking price as a string of numbers, e.g., '2780000'. If no price is found, return null."),
})

// Zod schema for OpenAI's expected output for general details
const propertyDetailsSchema = z.object({
  address: z
    .string()
    .nullable()
    .describe("Full property address, including street, city, state, and zip if available."),
  askingPrice: z
    .string()
    .nullable()
    .describe(
      "Asking price as a string of numbers, e.g., '2780000'. This is a fallback if dedicated price extraction fails.",
    ),
  beds: z.string().nullable().describe("Number of bedrooms, e.g., '4'."),
  baths: z.string().nullable().describe("Number of bathrooms, e.g., '3' or '2.5'."),
  sqft: z.string().nullable().describe("Total square footage, e.g., '1750'."),
  propertyType: z.string().nullable().describe("Type of property, e.g., 'Townhouse', 'Single Family', 'Condo'."),
  yearBuilt: z.string().nullable().describe("Year the property was built, e.g., '1995'."),
  garageSpaces: z.string().nullable().describe("Number of garage spaces, e.g., '2'."),
  levels: z.string().nullable().describe("Number of levels or stories, e.g., '2' or 'Bi-level'."),
  lotSize: z.string().nullable().describe("Lot size, including units, e.g., '0.25 acres' or '6590 sqft'."),
  imageUrl: z.string().url().nullable().describe("Primary image URL for the property."),
  description: z.string().nullable().describe("A brief summary or description of the property."),
  latitude: z.string().nullable().describe("Latitude coordinate of the property, e.g., '40.7128'."),
  longitude: z.string().nullable().describe("Longitude coordinate of the property, e.g., '-74.0060'."),
})

// This API now accepts POST requests with a URL in the body
export async function POST(request: NextRequest) {
  let listingUrl: string | undefined
  try {
    const body = await request.json()
    listingUrl = body.url
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!listingUrl) {
    return NextResponse.json({ error: "URL parameter is required in the request body" }, { status: 400 })
  }

  let html = ""
  try {
    const response = await fetch(listingUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status })
    }
    html = await response.text()
  } catch (error) {
    console.error("Error fetching URL for scraping:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during fetch"
    return NextResponse.json({ error: "Failed to fetch URL content", details: errorMessage }, { status: 500 })
  }

  const $ = cheerio.load(html)
  const structuredData = extractStructuredData($)
  const MAX_HTML_LENGTH = 150000 // Limit HTML size for AI
  const truncatedHtml = html.length > MAX_HTML_LENGTH ? html.substring(0, MAX_HTML_LENGTH) : html

  let cheerioExtractedPrice: string | null = null
  const priceSelectors = [
    '[data-testid="price"]',
    ".price",
    "#price",
    '[itemprop="price"]',
    ".property-price",
    ".listing-price",
  ]
  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text()
    if (priceText) {
      const numericPrice = extractNumber(priceText)
      if (numericPrice) {
        cheerioExtractedPrice = numericPrice
        break
      }
    }
  }

  let dedicatedAiPrice: string | null = null
  if (OPENAI_ENABLED) {
    try {
      const pricePrompt = `Analyze the following HTML content from a property listing at ${listingUrl}.
Your SOLE AND CRITICAL task is to identify and extract the ASKING PRICE.
The price is usually a number, possibly with a dollar sign and commas (e.g., $1,250,000 or 499000).
Return the price as a numerical string. If no price is found, return null for the askingPrice field.

HTML Content:
\`\`\`html
${truncatedHtml}
\`\`\`
`
      const { object: priceData } = await generateObject({
        model: openai("gpt-4o"),
        schema: priceSchema,
        prompt: pricePrompt,
      })
      if (priceData.askingPrice) {
        dedicatedAiPrice = extractNumber(priceData.askingPrice)
      }
    } catch (error) {
      console.error("OpenAI price extraction failed:", error)
    }
  }

  let aiExtractedGeneralData: Partial<z.infer<typeof propertyDetailsSchema>> = {}
  if (OPENAI_ENABLED) {
    try {
      const generalPrompt = `You are an expert real estate data extraction model. From the HTML of ${listingUrl}, extract all property details.
${dedicatedAiPrice ? `The price has likely been identified as ${dedicatedAiPrice}. Please verify this or find it if it's different, along with all other details.` : "The asking price is a critical piece of information to find, along with all other details."}

Extract the following: Address, Asking Price, Beds, Baths, SqFt, Property Type, Year Built, Garage Spaces, Levels, Lot Size, Image URL, Description, Latitude, and Longitude.
If a detail is not present, use null for its field.

HTML Content:
\`\`\`html
${truncatedHtml}
\`\`\`
`
      const { object: aiData } = await generateObject({
        model: openai("gpt-4o"),
        schema: propertyDetailsSchema,
        prompt: generalPrompt,
      })
      aiExtractedGeneralData = aiData
    } catch (error) {
      console.error("OpenAI general detail extraction failed:", error)
    }
  }

  const finalPrice =
    extractNumber(structuredData.askingPrice) ||
    dedicatedAiPrice ||
    extractNumber(aiExtractedGeneralData.askingPrice) ||
    cheerioExtractedPrice

  const propertyAddress = structuredData.address || aiExtractedGeneralData.address

  let lat: number | undefined =
    parseCoordinate(structuredData.latitude) || parseCoordinate(aiExtractedGeneralData.latitude)
  let lng: number | undefined =
    parseCoordinate(structuredData.longitude) || parseCoordinate(aiExtractedGeneralData.longitude)

  // If address is available and lat/lng are not, geocode the address
  if (propertyAddress && (!lat || !lng) && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(propertyAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      const geocodeResponse = await fetch(geocodeUrl)
      if (!geocodeResponse.ok) {
        console.error(`Geocoding API error: ${geocodeResponse.statusText}`)
      } else {
        const geocodeData = await geocodeResponse.json()
        if (geocodeData.status === "OK" && geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location
          lat = location.lat
          lng = location.lng
        } else {
          console.error(
            `Geocoding failed for address "${propertyAddress}": ${geocodeData.status} - ${geocodeData.error_message || ""}`,
          )
        }
      }
    } catch (error) {
      console.error("Error during geocoding:", error)
    }
  }

  const cheerioTitle =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text() ||
    $('meta[name="title"]').attr("content") ||
    ""
  let cheerioImage = $('meta[property="og:image"]').attr("content") || ""
  if (cheerioImage && !cheerioImage.startsWith("http")) {
    try {
      cheerioImage = new URL(cheerioImage, new URL(listingUrl).origin).href
    } catch {
      cheerioImage = ""
    }
  }

  const finalData = {
    title: structuredData.title || propertyAddress || cheerioTitle || "",
    address: propertyAddress || cheerioTitle || "",
    description:
      structuredData.description ||
      aiExtractedGeneralData.description ||
      $('meta[name="description"]').attr("content") ||
      "",
    imageUrl: structuredData.imageUrl || aiExtractedGeneralData.imageUrl || cheerioImage,
    price: finalPrice || "", // Renamed from extractedPrice for clarity, CmaForm expects 'price'
    beds: structuredData.beds || aiExtractedGeneralData.beds,
    baths: structuredData.baths || aiExtractedGeneralData.baths,
    sqft: structuredData.sqft || aiExtractedGeneralData.sqft,
    propertyType: structuredData.propertyType || aiExtractedGeneralData.propertyType,
    yearBuilt: structuredData.yearBuilt || aiExtractedGeneralData.yearBuilt,
    garageSpaces: aiExtractedGeneralData.garageSpaces,
    levels: aiExtractedGeneralData.levels,
    lotSize: aiExtractedGeneralData.lotSize,
    lat: lat, // Use geocoded or extracted lat
    lng: lng, // Use geocoded or extracted lng
  }

  return NextResponse.json(finalData)
}

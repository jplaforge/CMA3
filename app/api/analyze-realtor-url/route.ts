import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import * as cheerio from "cheerio"
import { createAdminClient } from "@/lib/supabase/admin" // <-- use new helper
import { parseCssColor } from "@/lib/utils"

// Define the expected structure of the extracted data
const RealtorProfileSchema = z.object({
  realtorName: z
    .string()
    .optional()
    .describe("The full name of the realtor, if identifiable. Otherwise, the main contact person."),
  agencyName: z.string().optional().describe("The name of the real estate agency or company."),
  primaryColor: z
    .string()
    .optional()
    .describe(
      "The primary theme color of the website (e.g., 'dark blue', '#003366', 'rgb(0, 51, 102)'). Prioritize hex codes if available.",
    ),
  secondaryColor: z
    .string()
    .optional()
    .describe(
      "The secondary or accent theme color of the website (e.g., 'gold', '#FFD700', 'rgb(255, 215, 0)'). Prioritize hex codes if available.",
    ),
})

export async function POST(req: NextRequest) {
  let supabase
  try {
    supabase = createAdminClient()
  } catch (e: any) {
    return NextResponse.json({ error: `Supabase setup error: ${e.message}` }, { status: 500 })
  }

  try {
    const { realtorUrl } = await req.json()

    if (!realtorUrl || typeof realtorUrl !== "string") {
      return NextResponse.json({ error: "Realtor URL is required" }, { status: 400 })
    }

    let validatedUrl
    try {
      validatedUrl = new URL(realtorUrl).toString()
    } catch (error) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // 1. Fetch website content
    let htmlContent = ""
    try {
      const response = await fetch(validatedUrl, { headers: { "User-Agent": "RealtorProfileAnalyzer/1.0" } })
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
      }
      htmlContent = await response.text()
    } catch (error: any) {
      console.error("Error fetching URL:", error)
      return NextResponse.json({ error: `Failed to fetch content from URL: ${error.message}` }, { status: 500 })
    }

    // 2. Extract text using Cheerio (and some meta tags)
    const $ = cheerio.load(htmlContent)
    let textContent = ""

    // Extract title
    const title = $("title").text()
    if (title) textContent += `Page Title: ${title}\n\n`

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr("content")
    if (metaDescription) textContent += `Meta Description: ${metaDescription}\n\n`

    // Extract main body text (simplified)
    $("body").find("script, style, noscript, iframe, header, footer, nav").remove() // Remove less relevant tags
    textContent += $("body").text().replace(/\s\s+/g, " ").trim().substring(0, 15000) // Limit to ~15k chars

    if (textContent.length < 100) {
      // Basic check if content is too short
      return NextResponse.json({ error: "Could not extract sufficient text content from the URL." }, { status: 400 })
    }

    // 3. Call OpenAI API
    const { object: extractedProfile } = await generateObject({
      model: openai("gpt-4o"), // Or your preferred model
      schema: RealtorProfileSchema,
      prompt: `Analyze the following website content from ${validatedUrl} to identify key details about the realtor or real estate agency. Focus on information explicitly present on the page.
      Extracted Website Content:
      ---
      ${textContent}
      ---
      Based *only* on the provided text, extract the realtor's name, agency name, and the website's primary and secondary theme colors.
      For colors, if you see CSS variables or inline styles, try to get hex codes. Otherwise, descriptive names are fine (e.g., "deep blue", "bright orange").
      If a piece of information is not clearly available, omit it or leave the field empty. Do not guess.`,
    })

    // Normalize colors returned by the LLM. Use parseCssColor to check if the
    // value is already a valid CSS color string. If not, map a few common
    // descriptive names to standard CSS colors before saving.
    const colorMap: Record<string, string> = {
      "deep blue": "#00008b",
      "dark blue": "#00008b",
      "bright blue": "#00f",
      "light blue": "#add8e6",
      "dark green": "darkgreen",
      "light green": "lightgreen",
      "deep red": "darkred",
      "bright orange": "orange",
    }

    const normalizeColor = (color?: string): string | undefined => {
      if (!color) return undefined
      const trimmed = color.trim().toLowerCase()
      // If already a valid CSS color string, use the sanitized value
      if (parseCssColor(trimmed)) return trimmed
      // Otherwise fall back to a mapped name or keep the sanitized string
      return colorMap[trimmed] ?? trimmed
    }

    const normalizedPrimary = normalizeColor(extractedProfile.primaryColor)
    const normalizedSecondary = normalizeColor(extractedProfile.secondaryColor)
    // Store normalized colors so downstream consumers receive consistent CSS values

    // 4. Save to Supabase
    // Optional: Check if a user is authenticated if your table uses user_id
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    // }

    const { data: savedData, error: dbError } = await supabase
      .from("realtor_profiles")
      .upsert(
        {
          // user_id: user.id, // if using user authentication
          realtor_url: validatedUrl,
          realtor_name: extractedProfile.realtorName,
          agency_name: extractedProfile.agencyName,
          primary_color: normalizedPrimary,
          secondary_color: normalizedSecondary,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "realtor_url" },
      ) // Upsert based on URL
      .select()
      .single()

    if (dbError) {
      console.error("Supabase error:", dbError)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json(savedData, { status: 200 })
  } catch (error: any) {
    console.error("API Error:", error)
    // Check if it's an AI SDK error
    if (error.name === "AIError") {
      return NextResponse.json(
        { error: `AI processing error: ${error.message} (Type: ${error.type}, Code: ${error.code})` },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 })
  }
}

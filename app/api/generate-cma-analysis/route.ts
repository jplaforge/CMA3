import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { CmaReportDataState, PropertyInput } from "@/lib/cma-types"

// Zod schema for the structured analysis we want from the AI
const analysisSchema = z.object({
  priceAdjustmentNotes: z
    .string()
    .describe(
      "Detailed notes comparing the subject property to each comparable. Mention specific differences (e.g., beds, baths, sqft, condition) and suggest the direction of value adjustment (e.g., 'Comp #1 is superior in size, suggesting a downward adjustment for the subject.').",
    ),
  suggestedPriceRange: z.object({
    low: z.string().describe("The low end of the suggested market value range as a numerical string, e.g., '450000'."),
    high: z
      .string()
      .describe("The high end of the suggested market value range as a numerical string, e.g., '475000'."),
  }),
  generalNotes: z
    .string()
    .describe(
      "A final summary for the client. Include overall market observations, the subject property's position within the market based on the comps, and a concluding recommendation.",
    ),
  listingStrategy: z
    .object({
      priceNarrative: z.string().optional(),
      keySellingPoints: z.array(z.string()).optional(),
      marketingPlan: z
        .object({
          mls: z.boolean().optional(),
          socialMedia: z.boolean().optional(),
          openHouse: z.boolean().optional(),
          videoTour: z.boolean().optional(),
          other: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
})

// Helper to format a property object into a readable string for the prompt
const formatPropertyForPrompt = (property: PropertyInput, name: string): string => {
  return `
- ${name}:
  - Address: ${property.address || "N/A"}
  - Price: ${property.fetchedPrice || property.salePrice || "N/A"}
  - Details: ${property.beds || "?"} beds, ${property.baths || "?"} baths, ${property.sqft || "?"} sqft
  - Year Built: ${property.yearBuilt || "N/A"}
  - Garage: ${property.garageSpaces || "N/A"} spaces
  - Condition/Features: ${property.featuresOrCondition || "N/A"}
`
}

export async function POST(request: NextRequest) {
  try {
    const reportData: CmaReportDataState = await request.json()
    const { subjectProperty, comparableProperties } = reportData

    if (!subjectProperty.address || comparableProperties.filter((c) => c.address).length === 0) {
      return NextResponse.json(
        { error: "Subject property and at least one comparable property must have details to generate an analysis." },
        { status: 400 },
      )
    }

    const subjectPrompt = formatPropertyForPrompt(subjectProperty, "Subject Property")
    const compsPrompt = comparableProperties
      .filter((c) => c.address)
      .map((comp, index) => formatPropertyForPrompt(comp, `Comparable #${index + 1}`))
      .join("")

    const location = subjectProperty.address || subjectProperty.fullAddress || "the property's location"

    const prompt = `
You are an expert real estate analyst tasked with creating a Comparative Market Analysis (CMA) summary.
Based on the provided subject property and comparable properties, generate a complete analysis.

Here is the data:
${subjectPrompt}
${compsPrompt}

Your task is to generate the following four sections based on your analysis:

1.  **Price Adjustment Notes**: Write a detailed, paragraph-style analysis comparing the subject property to the comparables. Point out key differences (e.g., square footage, number of bathrooms, renovations, lot size) and explain how these differences would logically lead to price adjustments. For example, if a comparable is smaller, the subject property's value would be adjusted upwards in comparison.

2.  **Suggested Price Range**: Based on your analysis and the sale prices of the comparables, provide a realistic low and high market value for the subject property. The range should be logical and defensible.

3.  **General Notes & Summary**: Write a concluding summary for the client. Briefly touch on the current market conditions as suggested by the comps, summarize the subject property's standing, and provide a final recommendation.

4.  **Marketing Strategy**: Recommend a listing strategy tailored to the location (${location}). Include a short pricing narrative, three to five key selling points highlighting local advantages, and which marketing channels (MLS, social media, open houses, video tours, other) should be used.

Please provide the output in the structured format requested.
`

    const { object: analysis } = await generateObject({
      model: openai("gpt-4o"),
      schema: analysisSchema,
      prompt: prompt,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error generating CMA analysis:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to generate AI analysis.", details: errorMessage }, { status: 500 })
  }
}

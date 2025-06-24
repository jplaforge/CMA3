import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { BuyerReportState } from "@/lib/buyer-report-types"

// Helper to format currency
const formatCurrency = (value?: string) => {
  if (!value || value === "N/A") return "N/A"
  const num = Number.parseFloat(value)
  return isNaN(num) ? value : `$${num.toLocaleString()}`
}

// Helper to format numbers
const formatNumber = (value?: string) => {
  if (!value || value === "N/A") return "N/A"
  const num = Number.parseFloat(value)
  return isNaN(num) ? value : num.toLocaleString()
}

export async function POST(request: NextRequest) {
  try {
    const body: BuyerReportState = await request.json()
    const { clientName, buyerCriteria, listings } = body

    const validListings = listings.filter((l) => l.address)

    if (validListings.length === 0) {
      return NextResponse.json(
        { error: "Cannot generate recommendation without at least one valid listing." },
        { status: 400 },
      )
    }

    // Construct a detailed summary of the data for the prompt
    const criteriaSummary = `
- Price Range: ${formatCurrency(buyerCriteria.priceRange.min)} to ${formatCurrency(buyerCriteria.priceRange.max)}
- Beds: ${buyerCriteria.beds.min || "Any"}-${buyerCriteria.beds.max || "Any"}
- Baths: ${buyerCriteria.baths.min || "Any"}-${buyerCriteria.baths.max || "Any"}
- Square Feet: ${formatNumber(buyerCriteria.sqft.min) || "Any"} to ${formatNumber(buyerCriteria.sqft.max) || "Any"}
- Must-Have Features: ${buyerCriteria.mustHaveFeatures || "None specified"}
`

    const listingsSummary = validListings
      .map(
        (l, index) => `
Listing #${index + 1}:
- Address: ${l.address}
- Price: ${formatCurrency(l.askingPrice)}
- Specs: ${l.beds || "N/A"} beds, ${l.baths || "N/A"} baths, ${formatNumber(l.sqft) || "N/A"} sqft
- Key Notes: ${l.notes || "No specific notes."}
`,
      )
      .join("")

    const prompt = `
You are a professional, insightful, and friendly real estate agent writing a summary for your client after a property tour.

Your client's name is ${clientName || "Valued Client"}.

Here is their ideal property criteria:
${criteriaSummary}

Here are the properties we viewed:
${listingsSummary}

Based on all this information, please write a personalized recommendation and summary for the client.
- Start by addressing them by name.
- Analyze how each property stacks up against their criteria. Be specific.
- Highlight which properties seem to be the strongest contenders and explain why.
- If no properties are a perfect fit, explain the trade-offs.
- Conclude with clear, actionable next steps. For example, suggest scheduling a second viewing for the top choice(s), discussing an offer strategy, or exploring new listings if these weren't suitable.
- The tone should be encouraging, professional, and client-focused. Do not use markdown formatting in your response.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    return NextResponse.json({ recommendation: text })
  } catch (error) {
    console.error("Error generating recommendation:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to generate AI recommendation.", details: errorMessage }, { status: 500 })
  }
}

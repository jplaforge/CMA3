import { type NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { CmaReportDataState, PropertyInput } from "@/lib/cma-types";

const formatProperty = (p: PropertyInput, label: string) => `
- ${label}:
  - Address: ${p.address || "N/A"}
  - Price: ${p.fetchedPrice || p.salePrice || "N/A"}
  - Details: ${p.beds || "?"} beds, ${p.baths || "?"} baths, ${p.sqft || "?"} sqft
`;

export async function POST(request: NextRequest) {
  try {
    const data: CmaReportDataState = await request.json();
    const { subjectProperty, comparableProperties, suggestedPriceRange } = data;

    if (!subjectProperty.address) {
      return NextResponse.json(
        { error: "Subject property details are required." },
        { status: 400 },
      );
    }

    const comps = comparableProperties
      .filter((c) => c.address)
      .map((c, i) => formatProperty(c, `Comparable #${i + 1}`))
      .join("\n");

    const prompt = `You are a real estate professional creating a concise CMA report for a home seller.
Using the information below, write a multi-paragraph summary including an introduction, overview of the comparable properties, market outlook and the recommended price range. Do not use markdown formatting.

Subject Property:
${formatProperty(subjectProperty, "Subject Property")}

Comparables:
${comps}

Suggested price range: ${suggestedPriceRange.low || "N/A"} to ${suggestedPriceRange.high || "N/A"}.`;

    const { text } = await generateText({ model: openai("gpt-4o"), prompt });

    return NextResponse.json({ report: text });
  } catch (error) {
    console.error("Error generating CMA report:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate report.", details: message }, { status: 500 });
  }
}

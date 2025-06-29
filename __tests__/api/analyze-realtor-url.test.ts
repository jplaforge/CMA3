import { jest } from "@jest/globals"

// Mock modules before importing the route
jest.mock("@/lib/color-analysis", () => ({
  analyzeColorsFromUrl: jest.fn(),
}))
jest.mock("ai", () => ({ generateObject: jest.fn() }))
jest.mock("@ai-sdk/openai", () => ({ openai: jest.fn() }))
jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: jest.fn(() => {
    throw new Error("no env")
  }),
}))

import { analyzeColorsFromUrl } from "@/lib/color-analysis"
import { generateObject } from "ai"
import { POST } from "@/app/api/analyze-realtor-url/route"
import { NextRequest } from "next/server"

describe("/api/analyze-realtor-url", () => {
  it("returns error for missing URL", async () => {
    const request = new NextRequest("http://localhost:3000/api/analyze-realtor-url", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Realtor URL is required")
  })

  it("returns error for invalid URL", async () => {
    const request = new NextRequest("http://localhost:3000/api/analyze-realtor-url", {
      method: "POST",
      body: JSON.stringify({ realtorUrl: "invalid-url" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid URL format")
  })

  it("uses extracted colors when OpenAI omits them", async () => {
    ;(analyzeColorsFromUrl as jest.Mock).mockResolvedValue({
      primaryColor: "#111111",
      secondaryColor: "#222222",
    })
    ;(generateObject as jest.Mock).mockResolvedValue({
      object: { realtorName: "Jane", agencyName: "Acme" },
    })

    const html = "<html><head><title>Test</title><meta name=\"description\" content=\"desc\"></head><body>Some text</body></html>"
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => html,
    }) as any

    const request = new NextRequest("http://localhost:3000/api/analyze-realtor-url", {
      method: "POST",
      body: JSON.stringify({ realtorUrl: "https://example.com" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.primaryColor).toBe("#111111")
    expect(data.secondaryColor).toBe("#222222")
  })
})

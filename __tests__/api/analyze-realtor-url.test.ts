import { POST } from "@/app/api/analyze-realtor-url/route"
import { NextRequest } from "next/server"
import { jest } from "@jest/globals"

// Mock the external dependencies
jest.mock("cheerio")
jest.mock("@/lib/supabase/admin")

describe("/api/analyze-realtor-url", () => {
  it("returns error for missing URL", async () => {
    const request = new NextRequest("http://localhost:3000/api/analyze-realtor-url", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("URL is required")
  })

  it("returns error for invalid URL", async () => {
    const request = new NextRequest("http://localhost:3000/api/analyze-realtor-url", {
      method: "POST",
      body: JSON.stringify({ url: "invalid-url" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid URL format")
  })

  // Add more tests for successful cases when mocking is properly set up
})

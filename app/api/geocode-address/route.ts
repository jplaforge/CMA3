import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function POST(request: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key is not configured.")
    return NextResponse.json({ error: "Server configuration error: Missing API key." }, { status: 500 })
  }

  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return NextResponse.json({ lat: location.lat, lng: location.lng })
    } else {
      console.warn(`Geocoding failed for address "${address}": ${data.status}`, data.error_message || "")
      return NextResponse.json(
        { error: `Geocoding failed: ${data.status}`, details: data.error_message },
        { status: data.status === "ZERO_RESULTS" ? 404 : 500 },
      )
    }
  } catch (error) {
    console.error("Error during geocoding request:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to geocode address", details: errorMessage }, { status: 500 })
  }
}

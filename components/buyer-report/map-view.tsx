"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api"
import type { BuyerReportState, ListingProperty, PointOfInterest } from "@/lib/buyer-report-types"

const mapContainerStyle = {
  height: "600px",
  width: "100%",
  borderRadius: "0.5rem",
}

const defaultCenter = {
  lat: 40.7128, // Default to New York City
  lng: -74.006,
}

const libraries = ["places"] as const

const listingMarkerIconOptions = {
  path: 0, // google.maps.SymbolPath.CIRCLE,
  fillColor: "#DC2626", // Red (Tailwind red-600)
  fillOpacity: 1,
  strokeWeight: 1.5,
  strokeColor: "#FFFFFF",
  scale: 16, // Increased size (was 8)
}

const poiMarkerIconOptions = {
  path: 0, // google.maps.SymbolPath.CIRCLE,
  fillColor: "#FBBC05", // Yellow for POIs
  fillOpacity: 1,
  strokeWeight: 1.5,
  strokeColor: "#FFFFFF",
  scale: 8,
}

interface MapViewProps {
  data: BuyerReportState
  apiKey?: string
}

type SelectedItem = (ListingProperty & { type: "listing" }) | (PointOfInterest & { type: "poi" }) | null

export default function MapView({ data, apiKey }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey || "", libraries })
  const [map, setMap] = useState<any>(null) // google.maps.Map
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)

  const validListings = useMemo(
    () =>
      data.listings.filter(
        (l) => typeof l.lat === "number" && isFinite(l.lat) && typeof l.lng === "number" && isFinite(l.lng),
      ),
    [data.listings],
  )

  const validPois = useMemo(
    () =>
      data.buyerCriteria.pointsOfInterest.filter(
        (p) => typeof p.lat === "number" && isFinite(p.lat) && typeof p.lng === "number" && isFinite(p.lng),
      ),
    [data.buyerCriteria.pointsOfInterest],
  )

  const onMapLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance)
  }, [])

  useEffect(() => {
    if (!map) return

    const allPoints = [
      ...validListings.map((l) => ({ lat: l.lat!, lng: l.lng! })),
      ...validPois.map((p) => ({ lat: p.lat!, lng: p.lng! })),
    ]

    if (allPoints.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      allPoints.forEach((point) => {
        bounds.extend(point)
      })
      if (allPoints.length > 1) {
        map.fitBounds(bounds)
      } else {
        map.setCenter(bounds.getCenter())
        map.setZoom(14)
      }
    } else {
      map.setCenter(defaultCenter)
      map.setZoom(10)
    }
  }, [map, validListings, validPois])

  if (!apiKey) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-lg">
        Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[600px] w-full rounded-lg bg-muted">
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={10}
      onLoad={onMapLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
      }}
    >
        {validListings.map((listing, index) => (
          <Marker
            key={`listing-${listing.id}`}
            position={{ lat: listing.lat!, lng: listing.lng! }}
            icon={listingMarkerIconOptions}
            label={{ text: `L${index + 1}`, color: "white", fontSize: "10px", fontWeight: "bold" }}
            onClick={() => setSelectedItem({ ...listing, type: "listing" })}
          />
        ))}

        {validPois.map((poi, index) => (
          <Marker
            key={`poi-${poi.id}`}
            position={{ lat: poi.lat!, lng: poi.lng! }}
            icon={poiMarkerIconOptions}
            label={{ text: `P${index + 1}`, color: "white", fontSize: "10px", fontWeight: "bold" }}
            onClick={() => setSelectedItem({ ...poi, type: "poi" })}
          />
        ))}

        {selectedItem && selectedItem.lat && selectedItem.lng && (
          <InfoWindow
            position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
            onCloseClick={() => setSelectedItem(null)}
          >
            <div className="p-1 max-w-xs text-sm">
              {selectedItem.type === "listing" && (
                <>
                  <h3 className="font-semibold">{selectedItem.address || "Listing"}</h3>
                  {selectedItem.askingPrice && <p>Price: ${Number(selectedItem.askingPrice).toLocaleString()}</p>}
                  {(selectedItem.beds || selectedItem.baths) && (
                    <p>
                      {selectedItem.beds} bed, {selectedItem.baths} bath
                    </p>
                  )}
                </>
              )}
              {selectedItem.type === "poi" && (
                <>
                  <h3 className="font-semibold">{selectedItem.name || "Point of Interest"}</h3>
                  {selectedItem.address && <p>{selectedItem.address}</p>}
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
  )
}

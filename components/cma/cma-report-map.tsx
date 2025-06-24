"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import type { PropertyInput } from "@/lib/cma-types"

interface CmaReportMapProps {
  subjectProperty: PropertyInput
  comparableProperties: PropertyInput[]
  apiKey: string | undefined
}

const mapContainerStyle = {
  height: "400px",
  width: "100%",
  borderRadius: "0.5rem",
}

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
}

const libraries = ["places"] as const

// Define marker icons without relying on google.maps types
const subjectMarkerIcon = {
  path: 0, // CIRCLE
  fillColor: "#4285F4",
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#FFFFFF",
  scale: 10,
}

const compMarkerIcon = {
  path: 0, // CIRCLE
  fillColor: "#EA4335",
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#FFFFFF",
  scale: 10,
}

export default function CmaReportMap({ subjectProperty, comparableProperties, apiKey }: CmaReportMapProps) {
  const [map, setMap] = useState<any>(null)
  const [selectedProperty, setSelectedProperty] = useState<
    (PropertyInput & { isSubject?: boolean; index?: number }) | null
  >(null)

  const allProperties = useMemo(() => {
    const validProps = []
    if (subjectProperty.lat && subjectProperty.lng) {
      validProps.push({ ...subjectProperty, isSubject: true })
    }
    comparableProperties.forEach((comp, index) => {
      if (comp.lat && comp.lng) {
        validProps.push({ ...comp, isSubject: false, index })
      }
    })
    return validProps
  }, [subjectProperty, comparableProperties])

  const onMapLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance)
  }, [])

  useEffect(() => {
    if (!map) return

    // Adjust map bounds to fit all markers
    if (allProperties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      allProperties.forEach((prop) => {
        if (prop.lat && prop.lng) {
          bounds.extend({ lat: prop.lat, lng: prop.lng })
        }
      })

      if (allProperties.length > 1) {
        map.fitBounds(bounds)
      } else {
        map.setCenter(bounds.getCenter())
        map.setZoom(14)
      }
    } else {
      map.setCenter(defaultCenter)
      map.setZoom(5)
    }
  }, [map, allProperties])

  if (!apiKey) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-lg">
        Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    )
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
        }}
      >
        {allProperties.map((property, idx) => (
          <Marker
            key={property.id}
            position={{ lat: property.lat!, lng: property.lng! }}
            onClick={() => setSelectedProperty(property)}
            icon={property.isSubject ? subjectMarkerIcon : compMarkerIcon}
            label={{
              text: property.isSubject ? "S" : `${idx}`,
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          />
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{ lat: selectedProperty.lat!, lng: selectedProperty.lng! }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-sm">
                {selectedProperty.isSubject ? "Subject Property" : `Comparable #${selectedProperty.index || 0}`}
              </h3>
              <p className="text-xs">{selectedProperty.address}</p>
              {(selectedProperty.fetchedPrice || selectedProperty.salePrice) && (
                <p className="text-xs font-medium mt-1">
                  Price: ${Number(selectedProperty.fetchedPrice || selectedProperty.salePrice).toLocaleString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  )
}

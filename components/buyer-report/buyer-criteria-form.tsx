"use client"

import type React from "react"
import { type BuyerReportState, createEmptyPOI } from "@/lib/buyer-report-types"
import PlaceAutocompleteInput from "./place-autocomplete-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, PlusCircleIcon } from "lucide-react"

interface BuyerCriteriaFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
  googleMapsApiKey?: string
}

export default function BuyerCriteriaForm({ data, setData, googleMapsApiKey }: BuyerCriteriaFormProps) {
  const handleNestedCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      buyerCriteria: {
        ...prev.buyerCriteria,
        [field]: { ...prev.buyerCriteria[field as keyof typeof prev.buyerCriteria], [name]: value },
      },
    }))
  }

  const handleSimpleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      buyerCriteria: { ...prev.buyerCriteria, [name]: value },
    }))
  }

  const ensureEmptyPoiSlot = (
    current: typeof data.buyerCriteria.pointsOfInterest,
  ) => {
    const hasEmpty = current.some((p) => !p.address)
    return hasEmpty ? current : [...current, createEmptyPOI()]
  }

  const geocodePoi = async (
    address: string,
    id: string,
    place?: google.maps.places.PlaceResult,
  ) => {
    if (!address) return
    try {
      const res = await fetch("/api/geocode-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })
      if (res.ok) {
        const { lat, lng } = await res.json()
        const placeName = place?.name && place.formatted_address !== place.name
          ? place.name
          : undefined
        setData((prev) => {
          const updated = prev.buyerCriteria.pointsOfInterest.map((p) =>
            p.id === id
              ? {
                  ...p,
                  lat,
                  lng,
                  address,
                  name:
                    placeName !== undefined
                      ? placeName
                      : p.name,
                }
              : p,
          )
          return {
            ...prev,
            buyerCriteria: {
              ...prev.buyerCriteria,
              pointsOfInterest: ensureEmptyPoiSlot(updated),
            },
          }
        })
      }
    } catch (e) {
      console.error("Geocoding POI failed", e)
    }
  }

  const handlePoiChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, value } = e.target
    setData((prev) => {
      const updated = prev.buyerCriteria.pointsOfInterest.map((poi) =>
        poi.id === id ? { ...poi, [name]: name === "lat" || name === "lng" ? Number(value) : value } : poi,
      )
      return {
        ...prev,
        buyerCriteria: { ...prev.buyerCriteria, pointsOfInterest: ensureEmptyPoiSlot(updated) },
      }
    })
  }

  const addPoi = () => {
    setData((prev) => ({
      ...prev,
      buyerCriteria: {
        ...prev.buyerCriteria,
        pointsOfInterest: [...prev.buyerCriteria.pointsOfInterest, createEmptyPOI()],
      },
    }))
  }

  const removePoi = (id: string) => {
    setData((prev) => {
      let remaining = prev.buyerCriteria.pointsOfInterest.filter((poi) => poi.id !== id)
      if (remaining.length === 0) remaining = [createEmptyPOI()]
      else remaining = ensureEmptyPoiSlot(remaining)
      return { ...prev, buyerCriteria: { ...prev.buyerCriteria, pointsOfInterest: remaining } }
    })
  }

  const cardClassName = data.secondaryColor ? "bg-card/70 backdrop-blur-sm" : "bg-card"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="sm:col-span-2">
          <Label>Price Range</Label>
          <div className="flex gap-3">
            <Input
              name="min"
              placeholder="Minimum Price"
              value={data.buyerCriteria.priceRange.min}
              onChange={(e) => handleNestedCriteriaChange(e, "priceRange")}
              type="number"
            />
            <Input
              name="max"
              placeholder="Maximum Price"
              value={data.buyerCriteria.priceRange.max}
              onChange={(e) => handleNestedCriteriaChange(e, "priceRange")}
              type="number"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="beds">Minimum Beds</Label>
          <Input
            id="beds"
            name="beds"
            placeholder="e.g., 3"
            value={data.buyerCriteria.beds}
            onChange={handleSimpleCriteriaChange}
            type="number"
          />
        </div>
        <div>
          <Label htmlFor="baths">Minimum Baths</Label>
          <Input
            id="baths"
            name="baths"
            placeholder="e.g., 2"
            value={data.buyerCriteria.baths}
            onChange={handleSimpleCriteriaChange}
            type="number"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sqft">Minimum Square Feet</Label>
          <Input
            id="sqft"
            name="sqft"
            placeholder="e.g., 1800"
            value={data.buyerCriteria.sqft}
            onChange={handleSimpleCriteriaChange}
            type="number"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mustHaveFeatures">Must-Have Features</Label>
        <Textarea
          id="mustHaveFeatures"
          name="mustHaveFeatures"
          value={data.buyerCriteria.mustHaveFeatures}
          onChange={handleSimpleCriteriaChange}
          placeholder="e.g., Fenced yard, home office, open concept kitchen, specific school district..."
          rows={4}
        />
      </div>

      <Card className={cardClassName}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Points of Interest</CardTitle>
            <Button onClick={addPoi} variant="outline" size="sm">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add POI
            </Button>
          </div>
          <CardDescription>Locations important to the buyer (e.g., work, school, park).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.buyerCriteria.pointsOfInterest.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No points of interest added yet.</p>
          )}
          {data.buyerCriteria.pointsOfInterest.map((poi, index) => (
            <div key={poi.id} className={`p-4 border rounded-md space-y-3 ${cardClassName}`}>
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">POI #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePoi(poi.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove POI</span>
                </Button>
              </div>
              <PlaceAutocompleteInput
                value={poi.address}
                onChange={(val) =>
                  handlePoiChange({ target: { name: "address", value: val } } as any, poi.id)
                }
                onSelect={(addr, place) => geocodePoi(addr, poi.id, place)}
                onBlur={(val) => geocodePoi(val, poi.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") geocodePoi(poi.address, poi.id)
                }}
                placeholder="Address or place name"
                apiKey={googleMapsApiKey}
              />
              <Input
                name="name"
                value={poi.name}
                onChange={(e) => handlePoiChange(e as any, poi.id)}
                placeholder="Name (optional)"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { type BuyerReportState, createEmptyPOI } from "@/lib/buyer-report-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, PlusCircleIcon } from "lucide-react"

interface BuyerCriteriaFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
}

export default function BuyerCriteriaForm({ data, setData }: BuyerCriteriaFormProps) {
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

  const handlePoiChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      buyerCriteria: {
        ...prev.buyerCriteria,
        pointsOfInterest: prev.buyerCriteria.pointsOfInterest.map((poi) =>
          poi.id === id ? { ...poi, [name]: name === "lat" || name === "lng" ? Number(value) : value } : poi,
        ),
      },
    }))
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
    setData((prev) => ({
      ...prev,
      buyerCriteria: {
        ...prev.buyerCriteria,
        pointsOfInterest: prev.buyerCriteria.pointsOfInterest.filter((poi) => poi.id !== id),
      },
    }))
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
              <Input
                name="name"
                placeholder="Name (e.g., Work Office, Kid's School)"
                value={poi.name}
                onChange={(e) => handlePoiChange(e, poi.id)}
              />
              <Input
                name="address"
                placeholder="Address"
                value={poi.address}
                onChange={(e) => handlePoiChange(e, poi.id)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="lat"
                  placeholder="Latitude (Optional)"
                  value={poi.lat ?? ""}
                  onChange={(e) => handlePoiChange(e, poi.id)}
                  type="number"
                  step="any"
                />
                <Input
                  name="lng"
                  placeholder="Longitude (Optional)"
                  value={poi.lng ?? ""}
                  onChange={(e) => handlePoiChange(e, poi.id)}
                  type="number"
                  step="any"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { type BuyerReportState, createEmptyPOI } from "@/lib/buyer-report-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface BuyerCriteriaFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
}

export default function BuyerCriteriaForm({ data, setData }: BuyerCriteriaFormProps) {
  // Handles changes for nested objects like priceRange
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

  // Handles changes for simple top-level properties in buyerCriteria
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ideal Property Criteria</CardTitle>
        <CardDescription>Define the criteria for your client's ideal property.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price Range</Label>
            <div className="flex gap-2">
              <Input
                name="min"
                placeholder="Min"
                value={data.buyerCriteria.priceRange.min}
                onChange={(e) => handleNestedCriteriaChange(e, "priceRange")}
                type="number"
              />
              <Input
                name="max"
                placeholder="Max"
                value={data.buyerCriteria.priceRange.max}
                onChange={(e) => handleNestedCriteriaChange(e, "priceRange")}
                type="number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="beds">Beds</Label>
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
            <Label htmlFor="baths">Baths</Label>
            <Input
              id="baths"
              name="baths"
              placeholder="e.g., 2"
              value={data.buyerCriteria.baths}
              onChange={handleSimpleCriteriaChange}
              type="number"
            />
          </div>
          <div>
            <Label htmlFor="sqft">Square Feet</Label>
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
        <div>
          <Label htmlFor="mustHaveFeatures">Must-Have Features</Label>
          <Textarea
            id="mustHaveFeatures"
            name="mustHaveFeatures"
            value={data.buyerCriteria.mustHaveFeatures}
            onChange={handleSimpleCriteriaChange}
            placeholder="e.g., Fenced yard, home office, open concept"
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Points of Interest</h4>
            <Button onClick={addPoi} variant="outline" size="sm">
              Add POI
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {data.buyerCriteria.pointsOfInterest.map((poi) => (
              <div key={poi.id} className="p-2 border rounded-md space-y-2">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => removePoi(poi.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  name="name"
                  placeholder="Name (e.g., Work Office)"
                  value={poi.name}
                  onChange={(e) => handlePoiChange(e, poi.id)}
                />
                <Input
                  name="address"
                  placeholder="Address"
                  value={poi.address}
                  onChange={(e) => handlePoiChange(e, poi.id)}
                />
                <div className="flex gap-2">
                  <Input
                    name="lat"
                    placeholder="Latitude"
                    value={poi.lat ?? ""}
                    onChange={(e) => handlePoiChange(e, poi.id)}
                    type="number"
                    step="any"
                  />
                  <Input
                    name="lng"
                    placeholder="Longitude"
                    value={poi.lng ?? ""}
                    onChange={(e) => handlePoiChange(e, poi.id)}
                    type="number"
                    step="any"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

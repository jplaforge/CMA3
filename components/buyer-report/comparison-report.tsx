"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import type { BuyerReportState, ListingProperty } from "@/lib/buyer-report-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  BedDoubleIcon,
  BathIcon,
  CarIcon,
  SquareIcon,
  LayersIcon,
  LandPlotIcon,
} from "lucide-react"

interface ComparisonReportProps {
  data: BuyerReportState
  googleMapsApiKey?: string
}

const ComparisonIcon = ({ meets, className }: { meets: boolean | null; className?: string }) => {
  if (meets === null) return <AlertCircle className={`h-3 w-3 text-yellow-500 inline-block ml-0.5 ${className}`} />
  return meets ? (
    <CheckCircle2 className={`h-3 w-3 text-green-600 inline-block ml-0.5 ${className}`} />
  ) : (
    <XCircle className={`h-3 w-3 text-red-600 inline-block ml-0.5 ${className}`} />
  )
}

const formatCurrency = (value?: string) => {
  if (!value) return ""
  const num = Number.parseFloat(value)
  return isNaN(num) ? "" : `$${num.toLocaleString()}`
}

const formatNumber = (value?: string) => {
  if (!value) return ""
  const num = Number.parseFloat(value)
  return isNaN(num) ? "" : num.toLocaleString()
}

interface StatPillProps {
  icon: React.ReactNode
  value?: string
  label: string
  meets: boolean | null
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, meets }) => {
  const displayValue = value ? formatNumber(value) : "N/A"
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center text-muted-foreground mb-0.5">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="text-sm font-medium">
        {displayValue}
        <ComparisonIcon meets={meets} />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export default function ComparisonReport({ data, googleMapsApiKey }: ComparisonReportProps) {
  const { clientName, preparedDate, buyerCriteria, listings } = data

  // Updated checkCriteria: if max is empty or not provided, it's a "min" check (value >= min)
  // If min is empty or not provided, it's a "max" check (value <= max)
  const checkCriteria = (listingValueStr: string, criteriaMinStr: string, criteriaMaxStr?: string): boolean | null => {
    const numListingValue = Number.parseFloat(listingValueStr)
    const numCriteriaMin = Number.parseFloat(criteriaMinStr)
    const numCriteriaMax = criteriaMaxStr ? Number.parseFloat(criteriaMaxStr) : Number.NaN

    if (listingValueStr === "" || listingValueStr === undefined || listingValueStr === null) return null // No listing data
    if (isNaN(numListingValue)) return null // Listing data is not a number

    const hasMin = criteriaMinStr !== "" && !isNaN(numCriteriaMin)
    const hasMax = criteriaMaxStr !== "" && !isNaN(numCriteriaMax)

    if (!hasMin && !hasMax) return null // No criteria set

    if (hasMin && hasMax) {
      return numListingValue >= numCriteriaMin && numListingValue <= numCriteriaMax
    }
    if (hasMin) {
      return numListingValue >= numCriteriaMin
    }
    if (hasMax) {
      return numListingValue <= numCriteriaMax
    }
    return null
  }

  const calculateAge = (yearBuilt?: string): string | null => {
    if (!yearBuilt) return null
    const year = Number.parseInt(yearBuilt, 10)
    if (isNaN(year) || year <= 1800) return null
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    return age >= 0 ? `${age}Y OLD` : null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ideal Property Criteria</CardTitle>
          <CardDescription>
            Prepared for {clientName || "Client"} on {new Date(preparedDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold">Price Range</p>
            <p className="text-muted-foreground">
              {formatCurrency(buyerCriteria.priceRange.min) || "?"} -{" "}
              {formatCurrency(buyerCriteria.priceRange.max) || "?"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Beds</p>
            <p className="text-muted-foreground">{formatNumber(buyerCriteria.beds) || "Any"}</p>
          </div>
          <div>
            <p className="font-semibold">Baths</p>
            <p className="text-muted-foreground">{formatNumber(buyerCriteria.baths) || "Any"}</p>
          </div>
          <div>
            <p className="font-semibold">Square Feet</p>
            <p className="text-muted-foreground">{formatNumber(buyerCriteria.sqft) || "Any"}</p>
          </div>
          {buyerCriteria.mustHaveFeatures && (
            <div className="col-span-full">
              <p className="font-semibold">Must-Have Features</p>
              <p className="text-muted-foreground">{buyerCriteria.mustHaveFeatures}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Listings for Consideration</h2>
        {listings.filter((l) => l.address || l.listingUrl).length > 0 ? (
          <div
            className="
              flex flex-row gap-6 overflow-x-auto pb-2
              [&::-webkit-scrollbar]:h-2
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40
              scrollbar-thumb-rounded
            "
          >
            {listings
              .filter((l) => l.address || l.listingUrl)
              .map((listing: ListingProperty) => {
                const meetsPrice = checkCriteria(
                  listing.askingPrice,
                  buyerCriteria.priceRange.min,
                  buyerCriteria.priceRange.max,
                )
                // For single value criteria, we treat it as a minimum requirement.
                // So, we pass the criteria value as 'min' and an empty string or undefined as 'max'.
                const meetsBeds = checkCriteria(listing.beds, buyerCriteria.beds)
                const meetsBaths = checkCriteria(listing.baths, buyerCriteria.baths)
                const meetsSqft = checkCriteria(listing.sqft, buyerCriteria.sqft)

                const propertyAge = calculateAge(listing.yearBuilt)

                let streetViewImageUrl = null
                let clickableStreetViewUrl = null

                if (googleMapsApiKey) {
                  const locationParam =
                    listing.lat && listing.lng
                      ? `${listing.lat},${listing.lng}`
                      : listing.address
                        ? encodeURIComponent(listing.address)
                        : null

                  if (locationParam) {
                    streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x250&location=${locationParam}&key=${googleMapsApiKey}&fov=90&heading=235&pitch=10`
                  }

                  if (listing.lat && listing.lng) {
                    clickableStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${listing.lat},${listing.lng}`
                  } else if (listing.address) {
                    clickableStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(
                      listing.address,
                    )}`
                  }
                }

                return (
                  <div key={listing.id} className="shrink-0 w-[360px]">
                    <a
                      href={listing.listingUrl || "#"}
                      target={listing.listingUrl ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 group-hover:shadow-lg rounded-lg">
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={
                              listing.imageUrl ||
                              "/placeholder.svg?width=400&height=250&query=beautiful+house+exterior" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={`Property at ${listing.address || "Unknown Address"}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            width={400}
                            height={250}
                          />
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            1 OF 5 {/* Placeholder */}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 text-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              alert("3D Tour clicked (placeholder)")
                            }}
                          >
                            3D TOUR
                          </Button>
                        </div>

                        <div className="p-3 flex-grow flex flex-col">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="uppercase font-medium">
                              {listing.propertyType || "PROPERTY"}
                              {propertyAge && ` • ${propertyAge}`}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600 px-1.5 py-0.5 text-[10px]"
                            >
                              OPEN {/* Placeholder */}
                            </Badge>
                          </div>

                          <h3
                            className="text-lg font-semibold text-foreground leading-tight mb-0.5 truncate"
                            title={listing.address}
                          >
                            {listing.address || "Address Not Available"}
                          </h3>

                          <p className="text-2xl font-bold text-foreground flex items-center mb-2">
                            {formatCurrency(listing.askingPrice) || "Price N/A"}
                            <ComparisonIcon meets={meetsPrice} className="h-4 w-4 ml-1" />
                          </p>

                          <div className="grid grid-cols-4 gap-1 py-2 border-t border-b">
                            <StatPill icon={<BedDoubleIcon />} value={listing.beds} label="Beds" meets={meetsBeds} />
                            <StatPill icon={<BathIcon />} value={listing.baths} label="Baths" meets={meetsBaths} />
                            <StatPill icon={<SquareIcon />} value={listing.sqft} label="SqFt" meets={meetsSqft} />
                            <StatPill icon={<CarIcon />} value={listing.garageSpaces} label="Garage" meets={null} />
                          </div>

                          <div className="mt-2 pt-2 text-xs space-y-1 text-muted-foreground">
                            {listing.lotSize && (
                              <div className="flex items-center">
                                <LandPlotIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span className="font-medium">Lot Size:</span>
                                <span className="ml-1 font-semibold text-foreground">{listing.lotSize}</span>
                              </div>
                            )}
                            {listing.levels && (
                              <div className="flex items-center">
                                <LayersIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span className="font-medium">Levels:</span>
                                <span className="ml-1 font-semibold text-foreground">{listing.levels}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </a>
                    {streetViewImageUrl && clickableStreetViewUrl && (
                      <Button asChild variant="outline" className="w-full mt-2 text-xs sm:text-sm">
                        <a
                          href={clickableStreetViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2"
                        >
                          <img
                            src={streetViewImageUrl || "/placeholder.svg"}
                            alt={`Street View of ${listing.address || "property"}`}
                            className="w-5 h-5 sm:w-6 sm:h-6 object-cover rounded-full border"
                            loading="lazy"
                          />
                          <span>Streetview</span>
                        </a>
                      </Button>
                    )}
                  </div>
                )
              })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No listings have been fetched yet. Add a URL to see properties here.
          </p>
        )}
      </div>

      {data.realtorNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Realtor's Instructions & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{data.realtorNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

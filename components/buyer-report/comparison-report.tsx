"use client"

import { Label } from "@/components/ui/label"

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
  MapPin,
  BuildingIcon,
  CalendarDaysIcon,
  TagIcon,
  InfoIcon,
  MessageSquareIcon,
} from "lucide-react"
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils"
import { getContrastingTextColor } from "@/lib/utils"

interface ComparisonReportProps {
  data: BuyerReportState
  googleMapsApiKey?: string
  cardClassName?: string
}

const ComparisonIcon = ({ meets, className }: { meets: boolean | null; className?: string }) => {
  if (meets === null) return <AlertCircle className={`h-4 w-4 text-yellow-500 inline-block ml-1 ${className}`} />
  return meets ? (
    <CheckCircle2 className={`h-4 w-4 text-green-600 inline-block ml-1 ${className}`} />
  ) : (
    <XCircle className={`h-4 w-4 text-red-600 inline-block ml-1 ${className}`} />
  )
}

interface StatPillProps {
  icon: React.ReactNode
  value?: string | number | null
  label: string
  meets?: boolean | null
  formatter?: (value: any) => string
  primaryColor?: string
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, meets, formatter, primaryColor }) => {
  const displayValue = formatter ? formatter(value) : value ? formatNumber(String(value)) : "N/A"
  const iconColor = primaryColor || "hsl(var(--primary))"
  return (
    <div className="flex flex-col items-center text-center p-2.5 rounded-md bg-background/70 dark:bg-muted/30 flex-1 min-w-[75px] border">
      <div className="mb-1" style={{ color: iconColor }}>
        {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      </div>
      <div className="text-sm font-semibold text-foreground">
        {displayValue}
        {meets !== undefined && <ComparisonIcon meets={meets} />}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

export default function ComparisonReport({ data, googleMapsApiKey, cardClassName = "bg-card" }: ComparisonReportProps) {
  const { clientName, preparedDate, buyerCriteria, listings, primaryColor } = data
  const textColorForPrimary = primaryColor ? getContrastingTextColor(primaryColor) : "hsl(var(--primary-foreground))"

  const checkCriteria = (
    listingValueStr?: string,
    criteriaMinStr?: string,
    criteriaMaxStr?: string,
  ): boolean | null => {
    if (listingValueStr === "" || listingValueStr === undefined || listingValueStr === null) return null
    const numListingValue = Number.parseFloat(listingValueStr)
    if (isNaN(numListingValue)) return null

    const numCriteriaMin = criteriaMinStr ? Number.parseFloat(criteriaMinStr) : Number.NaN
    const numCriteriaMax = criteriaMaxStr ? Number.parseFloat(criteriaMaxStr) : Number.NaN

    const hasMin = criteriaMinStr !== "" && !isNaN(numCriteriaMin)
    const hasMax = criteriaMaxStr !== "" && !isNaN(numCriteriaMax)

    if (!hasMin && !hasMax) return null

    if (hasMin && hasMax) return numListingValue >= numCriteriaMin && numListingValue <= numCriteriaMax
    if (hasMin) return numListingValue >= numCriteriaMin
    if (hasMax) return numListingValue <= numCriteriaMax
    return null
  }

  const calculateAge = (yearBuilt?: string): string | null => {
    if (!yearBuilt) return null
    const year = Number.parseInt(yearBuilt, 10)
    if (isNaN(year) || year <= 1800 || year > new Date().getFullYear() + 10) return null
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    return age >= 0 ? `${age} yrs old` : `Built ${year}`
  }

  return (
    <div className="space-y-8 p-1">
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <InfoIcon className="h-5 w-5" style={{ color: primaryColor }} />
            Ideal Property Criteria
          </CardTitle>
          <CardDescription>
            Summary for {clientName || "Client"}, prepared on {formatDate(preparedDate)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Price Range</Label>
              <p className="font-semibold text-base">
                {formatCurrency(buyerCriteria.priceRange.min, false) || "Any"} -{" "}
                {formatCurrency(buyerCriteria.priceRange.max, false) || "Any"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Min. Beds</Label>
              <p className="font-semibold text-base">{formatNumber(buyerCriteria.beds) || "Any"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Min. Baths</Label>
              <p className="font-semibold text-base">{formatNumber(buyerCriteria.baths) || "Any"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Min. SqFt</Label>
              <p className="font-semibold text-base">{formatNumber(buyerCriteria.sqft) || "Any"}</p>
            </div>
          </div>
          {buyerCriteria.mustHaveFeatures && (
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Must-Have Features</Label>
              <p className="text-sm text-foreground whitespace-pre-line bg-muted/50 p-3 rounded-md">
                {buyerCriteria.mustHaveFeatures}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Listings for Consideration</h2>
        {listings.filter((l) => l.address || l.listingUrl).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {listings
              .filter((l) => l.address || l.listingUrl)
              .map((listing: ListingProperty, index) => {
                const meetsPrice = checkCriteria(
                  listing.askingPrice,
                  buyerCriteria.priceRange.min,
                  buyerCriteria.priceRange.max,
                )
                const meetsBeds = checkCriteria(listing.beds, buyerCriteria.beds)
                const meetsBaths = checkCriteria(listing.baths, buyerCriteria.baths)
                const meetsSqft = checkCriteria(listing.sqft, buyerCriteria.sqft)
                const propertyAge = calculateAge(listing.yearBuilt)

                let clickableStreetViewUrl = null
                if (googleMapsApiKey) {
                  if (listing.lat && listing.lng) {
                    clickableStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${listing.lat},${listing.lng}`
                  } else if (listing.address) {
                    clickableStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(listing.address)}`
                  }
                }

                return (
                  <Card
                    key={listing.id}
                    className={`overflow-hidden flex flex-col group shadow-lg hover:shadow-xl transition-all duration-300 ${cardClassName}`}
                  >
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl || "/placeholder.svg"}
                          alt={`Property at ${listing.address || "Unknown Address"}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          width={400}
                          height={225}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          <BuildingIcon className="w-20 h-20 text-slate-400 dark:text-slate-600 opacity-70" />
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 text-xs py-1 px-2.5"
                        style={{ backgroundColor: primaryColor, color: textColorForPrimary }}
                      >
                        Listing #{index + 1}
                      </Badge>
                    </div>

                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="mb-3">
                        <h3
                          className="text-xl font-semibold leading-tight truncate text-foreground"
                          title={listing.address}
                        >
                          {listing.address || "Address Not Available"}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          {listing.propertyType && (
                            <div className="flex items-center gap-1">
                              <TagIcon size={12} /> <span>{listing.propertyType}</span>
                            </div>
                          )}
                          {propertyAge && (
                            <>
                              {listing.propertyType && <span className="opacity-50">•</span>}
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon size={12} /> <span>{propertyAge}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-3xl font-bold flex items-center my-3 text-foreground">
                        {formatCurrency(listing.askingPrice) || "Price N/A"}
                        <ComparisonIcon meets={meetsPrice} className="h-5 w-5" />
                      </p>

                      <div className="flex gap-2.5 my-4">
                        <StatPill
                          icon={<BedDoubleIcon />}
                          value={listing.beds}
                          label="Beds"
                          meets={meetsBeds}
                          primaryColor={primaryColor}
                        />
                        <StatPill
                          icon={<BathIcon />}
                          value={listing.baths}
                          label="Baths"
                          meets={meetsBaths}
                          primaryColor={primaryColor}
                        />
                        <StatPill
                          icon={<SquareIcon />}
                          value={listing.sqft}
                          label="SqFt"
                          meets={meetsSqft}
                          formatter={(val) => formatNumber(String(val), false)}
                          primaryColor={primaryColor}
                        />
                      </div>

                      <div className="text-xs space-y-1.5 text-muted-foreground mt-auto pt-3 border-t">
                        {listing.garageSpaces && (
                          <div className="flex items-center gap-1.5">
                            <CarIcon size={14} className="text-primary/70" />
                            <span>Garage: {listing.garageSpaces} spaces</span>
                          </div>
                        )}
                        {listing.lotSize && (
                          <div className="flex items-center gap-1.5">
                            <LandPlotIcon size={14} className="text-primary/70" />
                            <span>Lot Size: {listing.lotSize}</span>
                          </div>
                        )}
                        {listing.levels && (
                          <div className="flex items-center gap-1.5">
                            <LayersIcon size={14} className="text-primary/70" />
                            <span>Levels: {listing.levels}</span>
                          </div>
                        )}
                      </div>

                      {clickableStreetViewUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                          style={{ borderColor: primaryColor ? `${primaryColor}66` : undefined, color: primaryColor }}
                        >
                          <a
                            href={clickableStreetViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            <MapPin className="w-4 h-4 mr-2" /> Street View
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        ) : (
          <Card className={`py-16 ${cardClassName}`}>
            <CardContent className="text-center text-muted-foreground">
              <BuildingIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
              <p className="text-lg font-medium mb-1">No Listings Added Yet</p>
              <p className="text-sm">
                Please use "Step 2: Comparable Listings" in the left panel to include properties for comparison.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {data.realtorNotes && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" style={{ color: primaryColor }} />
              Realtor's Notes & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-4 rounded-md">
              {data.realtorNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

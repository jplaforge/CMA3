"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"
import { type BuyerReportState, createEmptyListing, type ListingProperty } from "@/lib/buyer-report-types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, ChevronDown, PlusCircleIcon, ExternalLinkIcon } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ListingsFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
}

export default function ListingsForm({ data, setData }: ListingsFormProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [urlToFetch, setUrlToFetch] = useState<{ id: string; url: string } | null>(null)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toast } = useToast()

  const ensureTrulyEmptySlotAvailable = (currentListings: ListingProperty[]): ListingProperty[] => {
    const hasEmptySlot = currentListings.some((l) => !l.listingUrl || l.listingUrl.trim() === "")
    if (!hasEmptySlot) {
      return [...currentListings, createEmptyListing()]
    }
    return currentListings
  }

  const handleFetchDetails = useCallback(
    async (listingId: string, url?: string) => {
      if (!url || !url.startsWith("http") || loadingStates[listingId]) {
        return
      }
      setLoadingStates((prev) => ({ ...prev, [listingId]: true }))
      try {
        const response = await fetch("/api/fetch-listing-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch details")
        }
        const details: Partial<
          ListingProperty & {
            title?: string
            price?: string
            extractedPrice?: string
            extractedBeds?: string
            extractedBaths?: string
            extractedSqft?: string
          }
        > = await response.json()

        if (
          details.address &&
          (details.lat == null || details.lng == null) &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        ) {
          try {
            const geocodeResponse = await fetch("/api/geocode-address", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: details.address }),
            })
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json()
              if (geocodeData.lat != null && geocodeData.lng != null) {
                details.lat = geocodeData.lat
                details.lng = geocodeData.lng
              }
            }
          } catch (geocodeError) {
            console.error("Client-side geocoding error:", geocodeError)
          }
        }

        setData((prev) => {
          let updatedListings = prev.listings.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  listingUrl: url,
                  imageUrl: details.imageUrl || l.imageUrl,
                  address: details.title || details.address || l.address,
                  notes: details.description || l.notes,
                  askingPrice: details.price ?? details.extractedPrice ?? l.askingPrice,
                  beds: details.beds ?? details.extractedBeds ?? l.beds,
                  baths: details.baths ?? details.extractedBaths ?? l.baths,
                  sqft: details.sqft ?? details.extractedSqft ?? l.sqft,
                  yearBuilt: details.yearBuilt || l.yearBuilt,
                  propertyType: details.propertyType || l.propertyType,
                  garageSpaces: details.garageSpaces || l.garageSpaces,
                  levels: details.levels || l.levels,
                  lotSize: details.lotSize || l.lotSize,
                  lat: details.lat ?? l.lat,
                  lng: details.lng ?? l.lng,
                }
              : l,
          )
          updatedListings = ensureTrulyEmptySlotAvailable(updatedListings)
          return { ...prev, listings: updatedListings }
        })
      } catch (error) {
        console.error("Failed to fetch listing details:", error)
        toast({
          title: "Couldn’t retrieve listing details",
          description:
            (error as Error).message || "The site may be blocking requests. The URL is kept for manual entry.",
          variant: "destructive",
        })
        setData((prev) => {
          const updated = prev.listings.map((l) => (l.id === listingId ? { ...l, listingUrl: url } : l))
          return { ...prev, listings: ensureTrulyEmptySlotAvailable(updated) }
        })
      } finally {
        setLoadingStates((prev) => ({ ...prev, [listingId]: false }))
        setUrlToFetch(null)
      }
    },
    [setData, loadingStates, toast],
  )

  const scheduleFetch = useCallback((id: string, url: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    debounceTimeoutRef.current = setTimeout(() => {
      if (url && url.startsWith("http")) setUrlToFetch({ id, url })
      else setUrlToFetch(null)
    }, 1000)
  }, [])

  useEffect(() => {
    if (urlToFetch?.url) {
      const listing = data.listings.find((l) => l.id === urlToFetch.id)
      if (listing && (!listing.address || listing.listingUrl !== urlToFetch.url) && !loadingStates[urlToFetch.id]) {
        handleFetchDetails(urlToFetch.id, urlToFetch.url)
      }
    }
  }, [urlToFetch, handleFetchDetails, data.listings, loadingStates])

  const handleListingUrlChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { value } = e.target
    setData((prev) => {
      let newlistings = prev.listings.map((listing) =>
        listing.id === id ? { ...listing, listingUrl: value } : listing,
      )
      if (value.startsWith("http")) newlistings = ensureTrulyEmptySlotAvailable(newlistings)
      return { ...prev, listings: newlistings }
    })
    scheduleFetch(id, value)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, id: string) => {
    const pastedText = e.clipboardData.getData("text")
    if (pastedText?.startsWith("http")) {
      setData((prev) => {
        let newlistings = prev.listings.map((listing) =>
          listing.id === id ? { ...listing, listingUrl: pastedText } : listing,
        )
        newlistings = ensureTrulyEmptySlotAvailable(newlistings)
        return { ...prev, listings: newlistings }
      })
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      setUrlToFetch(null)
      setTimeout(() => handleFetchDetails(id, pastedText), 0)
    }
  }

  const removeListing = (id: string) => {
    setData((prev) => {
      let remainingListings = prev.listings.filter((l) => l.id !== id)
      if (remainingListings.length === 0) return { ...prev, listings: [createEmptyListing()] }
      remainingListings = ensureTrulyEmptySlotAvailable(remainingListings)
      return { ...prev, listings: remainingListings }
    })
    if (urlToFetch?.id === id) setUrlToFetch(null)
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
  }

  const activeListingForInput =
    data.listings.find((l) => !l.address && !l.listingUrl) ||
    (data.listings.every((l) => l.address || l.listingUrl) ? null : data.listings.find((l) => !l.address))

  const filledListings = data.listings.filter((l) => (l.address || l.listingUrl) && l !== activeListingForInput)
  const cardClassName = data.secondaryColor ? "bg-card/70 backdrop-blur-sm" : "bg-card"

  return (
    <div className="space-y-6">
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className="text-lg">Add New Listing</CardTitle>
          <CardDescription>Paste a URL (e.g., Zillow, Redfin) to automatically fetch listing details.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeListingForInput ? (
            <div key={activeListingForInput.id} className="space-y-2">
              <Label htmlFor={`listingUrl-${activeListingForInput.id}`} className="font-semibold text-md sr-only">
                Listing URL
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id={`listingUrl-${activeListingForInput.id}`}
                  name="listingUrl"
                  type="url"
                  value={activeListingForInput.listingUrl || ""}
                  onChange={(e) => handleListingUrlChange(e, activeListingForInput.id)}
                  onPaste={(e) => handlePaste(e, activeListingForInput.id)}
                  placeholder="Paste listing URL here (e.g., https://www.zillow.com/...)"
                  autoComplete="off"
                  className="text-sm flex-grow"
                />
                {loadingStates[activeListingForInput.id] && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {data.listings.length > 1 && !activeListingForInput.address && !activeListingForInput.listingUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListing(activeListingForInput.id)}
                    aria-label="Remove this input field"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setData((prev) => ({ ...prev, listings: [...prev.listings, createEmptyListing()] }))}
              variant="outline"
              className="w-full"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Another Listing
            </Button>
          )}
        </CardContent>
      </Card>

      {filledListings.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-3 mt-6">Added Listings ({filledListings.length})</h3>
          <Accordion type="multiple" className="w-full space-y-3">
            {filledListings.map((listing, index) => (
              <AccordionItem value={listing.id} key={listing.id} className={`border rounded-lg px-1 ${cardClassName}`}>
                <AccordionTrigger className="hover:no-underline text-sm py-3 px-3">
                  <div className="flex justify-between items-center w-full gap-2">
                    <span className="font-medium truncate text-left">
                      {index + 1}. {listing.address || listing.listingUrl}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {listing.askingPrice && (
                        <Badge variant="secondary">{formatCurrency(listing.askingPrice, false)}</Badge>
                      )}
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 px-3">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {listing.listingUrl && (
                      <p className="truncate flex items-center gap-1">
                        <ExternalLinkIcon className="h-3 w-3" />
                        <a
                          href={listing.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Original Listing
                        </a>
                      </p>
                    )}
                    <p>Price: {listing.askingPrice ? formatCurrency(listing.askingPrice) : "N/A"}</p>
                    <p>
                      Beds: {listing.beds || "N/A"}, Baths: {listing.baths || "N/A"}, SqFt: {listing.sqft || "N/A"}
                    </p>
                  </div>
                  <div className="text-right mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeListing(listing.id)}
                      className="text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive/80 h-7 px-2"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {!activeListingForInput && filledListings.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No listings added yet. Paste a URL above to begin.
        </p>
      )}
    </div>
  )
}

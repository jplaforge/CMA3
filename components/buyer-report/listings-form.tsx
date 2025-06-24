"use client"

import type React from "react"
import { type BuyerReportState, createEmptyListing, type ListingProperty } from "@/lib/buyer-report-types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, ChevronDown } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced as (...args: Parameters<F>) => ReturnType<F>
}

interface ListingsFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
}

export default function ListingsForm({ data, setData }: ListingsFormProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [urlToFetch, setUrlToFetch] = useState<{ id: string; url: string } | null>(null)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

        // Type casting for the details received from API
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

        // Attempt to geocode client-side if address is present but lat/lng are missing
        // This acts as a fallback if server-side geocoding in fetch-listing-details didn't yield coordinates
        if (
          details.address &&
          (details.lat == null || details.lng == null) &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        ) {
          console.log(`Coordinates missing for ${details.address}, attempting client-side geocoding.`)
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
                console.log(`Client-side geocoding successful for ${details.address}:`, details.lat, details.lng)
              } else {
                console.warn(
                  "Client-side geocoding successful but lat/lng missing in response for:",
                  details.address,
                  geocodeData,
                )
              }
            } else {
              const errorData = await geocodeResponse.json()
              console.error(
                "Client-side geocoding failed for address:",
                details.address,
                errorData.error,
                errorData.details,
              )
            }
          } catch (geocodeError) {
            console.error("Error during client-side geocoding call for address:", details.address, geocodeError)
          }
        }

        setData((prev) => {
          const updatedListings = prev.listings.map((l) => {
            if (l.id === listingId) {
              return {
                ...l,
                listingUrl: url, // Ensure listingUrl is also updated/set
                imageUrl: details.imageUrl || l.imageUrl,
                // Use 'details.title' (from og:title or page title) as primary, fallback to 'details.address'
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
                lat: details.lat ?? l.lat, // Update lat if fetched/geocoded
                lng: details.lng ?? l.lng, // Update lng if fetched/geocoded
              }
            }
            return l
          })

          const hasEmptySlotForInput = updatedListings.some((l) => !l.address && !l.listingUrl) // Check for truly empty slot
          if (!hasEmptySlotForInput) {
            return {
              ...prev,
              listings: [...updatedListings, createEmptyListing()],
            }
          }
          return { ...prev, listings: updatedListings }
        })
      } catch (error) {
        console.error("Failed to fetch listing details:", error)
      } finally {
        setLoadingStates((prev) => ({ ...prev, [listingId]: false }))
        setUrlToFetch(null)
      }
    },
    [setData, loadingStates],
  )

  const scheduleFetch = useCallback((id: string, url: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (url && url.startsWith("http")) {
        setUrlToFetch({ id, url })
      } else {
        setUrlToFetch(null)
      }
    }, 1000) // 1 second delay
  }, [])

  useEffect(() => {
    if (urlToFetch && urlToFetch.url) {
      const listing = data.listings.find((l) => l.id === urlToFetch.id)
      // Fetch if the slot is truly empty (no address) or if URL changed for an already filled slot (for re-fetch, though current logic focuses on empty)
      if (listing && (!listing.address || listing.listingUrl !== urlToFetch.url) && !loadingStates[urlToFetch.id]) {
        handleFetchDetails(urlToFetch.id, urlToFetch.url)
      }
    }
  }, [urlToFetch, handleFetchDetails, data.listings, loadingStates])

  const handleListingUrlChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { value } = e.target
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((listing) => (listing.id === id ? { ...listing, listingUrl: value } : listing)),
    }))
    scheduleFetch(id, value)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, id: string) => {
    const pastedText = e.clipboardData.getData("text")
    if (pastedText && pastedText.startsWith("http")) {
      setData((prev) => ({
        ...prev,
        listings: prev.listings.map((listing) =>
          listing.id === id ? { ...listing, listingUrl: pastedText } : listing,
        ),
      }))

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      setUrlToFetch(null)

      setTimeout(() => {
        handleFetchDetails(id, pastedText)
      }, 0)
    }
  }

  const removeListing = (id: string) => {
    setData((prev) => {
      const remainingListings = prev.listings.filter((l) => l.id !== id)
      if (remainingListings.length === 0) {
        return { ...prev, listings: [createEmptyListing()] }
      }
      // Ensure there's always one empty slot if all are filled
      const hasEmptySlotForInput = remainingListings.some((l) => !l.address && !l.listingUrl)
      if (!hasEmptySlotForInput) {
        return { ...prev, listings: [...remainingListings, createEmptyListing()] }
      }
      return { ...prev, listings: remainingListings }
    })
    if (urlToFetch && urlToFetch.id === id) {
      setUrlToFetch(null)
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }

  // Find the first listing that doesn't have an address OR a listing URL to mark it as the active input slot
  const activeListingForInputIndex = data.listings.findIndex((l) => !l.address && !l.listingUrl)
  const activeListingForInput =
    activeListingForInputIndex !== -1
      ? data.listings[activeListingForInputIndex]
      : data.listings.every((l) => l.address || l.listingUrl)
        ? null
        : data.listings.find((l) => !l.address)

  const filledListings = data.listings.filter((l) => (l.address || l.listingUrl) && l !== activeListingForInput)

  return (
    <div className="space-y-4">
      {activeListingForInput && (
        <div key={activeListingForInput.id} className="p-4 border rounded-lg bg-background shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor={`listingUrl-${activeListingForInput.id}`} className="font-semibold text-md">
              Add Listing #{data.listings.findIndex((l) => l.id === activeListingForInput.id) + 1}
            </Label>
            {/* Allow removing an empty slot only if it's not the last one and it's truly empty */}
            {data.listings.length > 1 && !activeListingForInput.address && !activeListingForInput.listingUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeListing(activeListingForInput.id)}
                aria-label="Remove this input field"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              id={`listingUrl-${activeListingForInput.id}`}
              name="listingUrl"
              type="url"
              value={activeListingForInput.listingUrl || ""}
              onChange={(e) => handleListingUrlChange(e, activeListingForInput.id)}
              onPaste={(e) => handlePaste(e, activeListingForInput.id)}
              placeholder="Paste listing URL (e.g., https://...)"
              autoComplete="off"
              className="text-sm"
            />
            {loadingStates[activeListingForInput.id] && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </div>
      )}

      {filledListings.length > 0 && (
        <Accordion type="multiple" className="w-full space-y-2">
          {filledListings.map((listing) => (
            <AccordionItem value={listing.id} key={listing.id} className="border rounded-lg px-4 bg-background/70">
              <AccordionTrigger className="hover:no-underline text-sm py-3">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium truncate text-left">
                    Listing #{data.listings.findIndex((l) => l.id === listing.id) + 1}:{" "}
                    {listing.address || listing.listingUrl}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-2">
                <div className="p-1 space-y-2 text-xs">
                  <div className="text-muted-foreground space-y-0.5">
                    {listing.listingUrl && (
                      <p className="truncate">
                        URL:{" "}
                        <a
                          href={listing.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {listing.listingUrl}
                        </a>
                      </p>
                    )}
                    {listing.address && !listing.title && <p>Address: {listing.address}</p>}
                    <p>Price: {listing.askingPrice ? `$${Number(listing.askingPrice).toLocaleString()}` : "N/A"}</p>
                    <p>
                      Beds: {listing.beds || "N/A"}, Baths: {listing.baths || "N/A"}, SqFt: {listing.sqft || "N/A"}
                    </p>
                  </div>
                  <div className="text-right mt-1">
                    <Button variant="ghost" size="sm" onClick={() => removeListing(listing.id)} className="text-xs">
                      <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                      Remove
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      {/* Show this message if there are no active input slots and no filled listings */}
      {!activeListingForInput &&
        filledListings.length === 0 &&
        (data.listings.length === 0 ||
          (data.listings.length === 1 && !data.listings[0].listingUrl && !data.listings[0].address)) && (
          <p className="text-center text-muted-foreground py-4">Enter a URL to begin adding listings.</p>
        )}
    </div>
  )
}

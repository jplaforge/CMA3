"use client"

import type React from "react"
import { type BuyerReportState, createEmptyListing } from "@/lib/buyer-report-types"
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
        const details = await response.json()

        setData((prev) => {
          const updatedListings = prev.listings.map((l) => {
            if (l.id === listingId) {
              return {
                ...l,
                imageUrl: details.imageUrl || l.imageUrl,
                address: details.title || l.address,
                notes: details.description || l.notes,
                askingPrice:
                  details.price ?? details.extractedPrice ?? l.askingPrice,
                beds: details.beds ?? details.extractedBeds ?? l.beds,
                baths: details.baths ?? details.extractedBaths ?? l.baths,
                sqft: details.sqft ?? details.extractedSqft ?? l.sqft,
                yearBuilt: details.yearBuilt || l.yearBuilt,
                propertyType: details.propertyType || l.propertyType,
                garageSpaces: details.garageSpaces || l.garageSpaces,
                levels: details.levels || l.levels,
                lotSize: details.lotSize || l.lotSize,
              }
            }
            return l
          })

          const hasEmptySlotForInput = updatedListings.some((l) => !l.address)
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

  const scheduleFetch = useCallback(
    (id: string, url: string) => {
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
    },
    [], // No dependencies, it's a stable function
  )

  useEffect(() => {
    if (urlToFetch && urlToFetch.url) {
      const listing = data.listings.find((l) => l.id === urlToFetch.id)
      if (listing && !listing.address && !loadingStates[urlToFetch.id]) {
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
      // Update the input value immediately
      setData((prev) => ({
        ...prev,
        listings: prev.listings.map((listing) =>
          listing.id === id ? { ...listing, listingUrl: pastedText } : listing,
        ),
      }))

      // Cancel any pending debounced fetch
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      setUrlToFetch(null) // Clear any scheduled fetch via typing

      // Trigger fetch immediately
      // Use a short timeout to allow React to update state before fetching
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
      const hasEmptySlotForInput = remainingListings.some((l) => !l.address)
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

  const activeListingForInputIndex = data.listings.findIndex((l) => !l.address)
  const activeListingForInput = activeListingForInputIndex !== -1 ? data.listings[activeListingForInputIndex] : null
  const filledListings = data.listings.filter((l) => l.address && l !== activeListingForInput)

  return (
    <div className="space-y-4">
      {activeListingForInput && (
        <div key={activeListingForInput.id} className="p-4 border rounded-lg bg-background shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor={`listingUrl-${activeListingForInput.id}`} className="font-semibold text-md">
              Add Listing #{activeListingForInputIndex + 1}
            </Label>
            {data.listings.length > 1 && !activeListingForInput.address && (
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
                    Listing #{data.listings.findIndex((l) => l.id === listing.id) + 1}: {listing.address}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-2">
                <div className="p-1 space-y-2 text-xs">
                  <div className="text-muted-foreground space-y-0.5">
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
      {!activeListingForInput && filledListings.length === 0 && (
        <p className="text-center text-muted-foreground py-4">Enter a URL to begin adding listings.</p>
      )}
    </div>
  )
}

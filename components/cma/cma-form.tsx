"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2, PlusCircle, Sparkles, Info, MapPin, Loader2 } from "lucide-react" // Added Loader2
import { useToast } from "@/components/ui/use-toast"
import {
  type CmaReportDataState,
  type PropertyInput,
  initialCmaReportData,
  createEmptyPropertyInput,
} from "@/lib/cma-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReportPreview from "@/components/cma/report-preview"

interface CmaFormProps {
  initialDataProp?: CmaReportDataState
  googleMapsApiKey?: string
}

export default function CmaForm({ initialDataProp, googleMapsApiKey }: CmaFormProps) {
  const [cmaReportData, setCmaReportData] = useState<CmaReportDataState>(initialDataProp || initialCmaReportData)
  const [isFetchingSubject, setIsFetchingSubject] = useState(false)
  const [fetchingCompId, setFetchingCompId] = useState<string | null>(null)
  const { toast } = useToast()
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState(false)
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(["subject-property", "comparables"])

  const prevSubjectUrlRef = useRef<string>(cmaReportData.subjectProperty.listingUrl || "")
  const prevCompUrlsRef = useRef<Record<string, string>>(
    Object.fromEntries(cmaReportData.comparableProperties.map((c) => [c.id, c.listingUrl || ""])),
  )

  const hasSubjectDetails = !!cmaReportData.subjectProperty.address && !!cmaReportData.subjectProperty.fetchedPrice
  const comparableDetailsCount = cmaReportData.comparableProperties.filter(
    (c) => !!c.address && !!c.fetchedPrice,
  ).length

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof CmaReportDataState | "subjectProperty" | "comparableProperty",
    id?: string,
    field?: keyof PropertyInput,
  ) => {
    const { name, value } = e.target
    setCmaReportData((prev) => {
      const newState = { ...prev }
      if (section === "subjectProperty" && field) {
        newState.subjectProperty = { ...newState.subjectProperty, [field]: value }
      } else if (section === "comparableProperty" && id && field) {
        newState.comparableProperties = newState.comparableProperties.map((comp) =>
          comp.id === id ? { ...comp, [field]: value } : comp,
        )
      } else if (section !== "subjectProperty" && section !== "comparableProperty") {
        const topLevelField = (field || name) as keyof CmaReportDataState
        if (topLevelField === "suggestedPriceRange") {
          newState.suggestedPriceRange = { ...newState.suggestedPriceRange, [name]: value }
        } else {
          ;(newState[topLevelField] as any) = value
        }
      }
      return newState
    })
  }

  const handleSubjectUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setCmaReportData((prev) => ({
      ...prev,
      subjectProperty: { ...prev.subjectProperty, listingUrl: newUrl },
    }))
  }

  const handleComparableUrlChange = (id: string, newUrl: string) => {
    setCmaReportData((prev) => ({
      ...prev,
      comparableProperties: prev.comparableProperties.map((comp) =>
        comp.id === id ? { ...comp, listingUrl: newUrl } : comp,
      ),
    }))
  }

  const fetchPropertyDetails = useCallback(
    async (url: string, propertyId?: string) => {
      if (!url || !url.trim().startsWith("http")) {
        return
      }

      if (propertyId) {
        if (fetchingCompId === propertyId) return
        setFetchingCompId(propertyId)
      } else {
        if (isFetchingSubject) return
        setIsFetchingSubject(true)
      }

      try {
        const response = await fetch("/api/fetch-listing-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch details: ${response.statusText}`)
        }
        const details = await response.json()
        toast({ title: "Details Fetched", description: `Successfully fetched data for ${details.address || url}` })
        setCmaReportData((prev) => {
          const newState = { ...prev }
          const updateData: Partial<PropertyInput> = {
            address: details.address || "",
            fetchedTitle: details.title || "",
            fetchedPrice: details.price || "",
            beds: details.beds || "",
            baths: details.baths || "",
            sqft: details.sqft || "",
            lotSize: details.lotSize || "",
            yearBuilt: details.yearBuilt || "",
            propertyType: details.propertyType || "",
            garageSpaces: details.garageSpaces || "",
            fetchedImageUrl: details.imageUrl || "",
            lat: details.lat,
            lng: details.lng,
            listingUrl: url,
          }
          if (propertyId) {
            newState.comparableProperties = newState.comparableProperties.map((comp) =>
              comp.id === propertyId ? { ...comp, ...updateData } : comp,
            )
          } else {
            newState.subjectProperty = { ...newState.subjectProperty, ...updateData }
          }
          return newState
        })
      } catch (error) {
        console.error("Error fetching property details:", error)
        toast({
          title: "Fetch Error",
          description: error instanceof Error ? error.message : "Could not fetch property details.",
          variant: "destructive",
        })
      } finally {
        if (propertyId) setFetchingCompId(null)
        else setIsFetchingSubject(false)
      }
    },
    [toast, fetchingCompId, isFetchingSubject],
  )

  const addComparableProperty = useCallback(() => {
    setCmaReportData((prev) => {
      if (prev.comparableProperties.length > 0) {
        const lastComp = prev.comparableProperties[prev.comparableProperties.length - 1]
        if (!lastComp.listingUrl?.trim()) {
          return prev
        }
      }
      const newEmptyComp = createEmptyPropertyInput()
      const newState = {
        ...prev,
        comparableProperties: [...prev.comparableProperties, newEmptyComp],
      }
      prevCompUrlsRef.current[newEmptyComp.id] = ""
      return newState
    })
    if (!activeAccordionItems.includes("comparables")) {
      setActiveAccordionItems((prevItems) => [...prevItems, "comparables"])
    }
  }, [activeAccordionItems])

  useEffect(() => {
    const currentUrl = cmaReportData.subjectProperty.listingUrl?.trim() ?? ""
    if (currentUrl && currentUrl.startsWith("http") && currentUrl !== prevSubjectUrlRef.current) {
      fetchPropertyDetails(currentUrl)
      prevSubjectUrlRef.current = currentUrl
    }
  }, [cmaReportData.subjectProperty.listingUrl, fetchPropertyDetails])

  useEffect(() => {
    let shouldAddNewRow = false
    cmaReportData.comparableProperties.forEach((comp, index) => {
      const currentUrl = (comp.listingUrl ?? "").trim()
      const prevUrl = (prevCompUrlsRef.current[comp.id] ?? "").trim()

      if (currentUrl && currentUrl.startsWith("http") && currentUrl !== prevUrl) {
        fetchPropertyDetails(currentUrl, comp.id)

        const isLast = index === cmaReportData.comparableProperties.length - 1
        if (isLast && !prevUrl) {
          shouldAddNewRow = true
        }
      }
      prevCompUrlsRef.current[comp.id] = currentUrl
    })

    if (shouldAddNewRow) addComparableProperty()
  }, [cmaReportData.comparableProperties, fetchPropertyDetails, addComparableProperty])

  const removeComparableProperty = (id: string) => {
    setCmaReportData((prev) => ({
      ...prev,
      comparableProperties: prev.comparableProperties.filter((comp) => comp.id !== id),
    }))
    delete prevCompUrlsRef.current[id]
  }

  const handleGenerateAiAnalysis = async () => {
    if (!hasSubjectDetails || comparableDetailsCount === 0) {
      toast({
        title: "Missing details",
        description: "Enter details for the subject property and at least one comparable before generating analysis.",
        variant: "destructive",
      })
      return
    }
    setIsAiAnalysisLoading(true)
    try {
      const response = await fetch("/api/generate-cma-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmaReportData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate AI analysis")
      }
      const analysis = await response.json()
      setCmaReportData((prev) => ({
        ...prev,
        suggestedPriceRange: {
          low: analysis.suggestedPriceRange?.low?.toString() || "",
          high: analysis.suggestedPriceRange?.high?.toString() || "",
        },
        priceAdjustmentNotes: analysis.priceAdjustmentNotes || "",
        generalNotes: analysis.generalNotes || "",
      }))
      toast({ title: "AI Analysis Generated", description: "Pricing and notes have been updated." })
      if (!activeAccordionItems.includes("analysis-conclusion")) {
        setActiveAccordionItems((prevItems) => [...prevItems, "analysis-conclusion"])
      }
    } catch (error) {
      console.error("Error generating AI analysis:", error)
      toast({
        title: "AI Analysis Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsAiAnalysisLoading(false)
    }
  }

  const geocodeAddress = async (address: string, propertyType: "subject" | "comparable", id?: string) => {
    if (!address) {
      toast({ title: "Error", description: "Address is empty.", variant: "destructive" })
      return
    }
    try {
      const response = await fetch("/api/geocode-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Geocoding failed: ${response.statusText}`)
      }
      const { lat, lng } = await response.json()
      setCmaReportData((prev) => {
        const newState = { ...prev }
        if (propertyType === "subject") {
          newState.subjectProperty = { ...newState.subjectProperty, lat, lng, address }
        } else if (propertyType === "comparable" && id) {
          newState.comparableProperties = newState.comparableProperties.map((comp) =>
            comp.id === id ? { ...comp, lat, lng, address } : comp,
          )
        }
        return newState
      })
      toast({ title: "Geocoded", description: `Coordinates found for ${address}` })
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast({ title: "Geocoding Error", description: (error as Error).message, variant: "destructive" })
    }
  }

  const renderPropertyFields = (property: PropertyInput, type: "subjectProperty" | "comparableProperty") => {
    const isCurrentlyFetching = type === "subjectProperty" ? isFetchingSubject : fetchingCompId === property.id

    return (
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${type}-${property.id}-listingUrl`}>Property Listing URL</Label>
            <div className="relative">
              <Input
                id={`${type}-${property.id}-listingUrl`}
                name="listingUrl"
                placeholder="e.g., https://www.zillow.com/homedetails/..."
                value={property.listingUrl || ""}
                onChange={(e) =>
                  type === "subjectProperty"
                    ? handleSubjectUrlChange(e)
                    : handleComparableUrlChange(property.id, e.target.value)
                }
                className={isCurrentlyFetching ? "pr-8" : ""}
              />
              {isCurrentlyFetching && (
                <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-address`}>Address</Label>
            <div className="flex space-x-2">
              <Input
                id={`${type}-${property.id}-address`}
                name="address"
                placeholder="e.g., 123 Main St, Anytown, USA"
                value={property.address || ""}
                onChange={(e) => handleInputChange(e, type, property.id, "address")}
              />
              <Button
                onClick={() =>
                  geocodeAddress(
                    property.address || "",
                    type === "subjectProperty" ? "subject" : "comparable",
                    property.id,
                  )
                }
                disabled={!property.address}
                size="sm"
                variant="outline"
              >
                <MapPin className="h-4 w-4 mr-1" /> Geocode
              </Button>
            </div>
          </div>
        </div>

        {property.fetchedImageUrl && (
          <div className="my-4">
            <img
              src={property.fetchedImageUrl || "/placeholder.svg"}
              alt={property.fetchedTitle || "Property Image"}
              className="rounded-md max-h-48 w-auto object-contain border"
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${type}-${property.id}-fetchedPrice`}>Price</Label>
            <Input
              id={`${type}-${property.id}-fetchedPrice`}
              name="fetchedPrice"
              placeholder="e.g., 500000"
              value={property.fetchedPrice || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "fetchedPrice")}
              type="number"
            />
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-beds`}>Beds</Label>
            <Input
              id={`${type}-${property.id}-beds`}
              name="beds"
              placeholder="e.g., 3"
              value={property.beds || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "beds")}
              type="number"
            />
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-baths`}>Baths</Label>
            <Input
              id={`${type}-${property.id}-baths`}
              name="baths"
              placeholder="e.g., 2.5"
              value={property.baths || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "baths")}
              type="number"
              step="0.1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${type}-${property.id}-sqft`}>SqFt</Label>
            <Input
              id={`${type}-${property.id}-sqft`}
              name="sqft"
              placeholder="e.g., 1800"
              value={property.sqft || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "sqft")}
              type="number"
            />
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-lotSize`}>Lot Size</Label>
            <Input
              id={`${type}-${property.id}-lotSize`}
              name="lotSize"
              placeholder="e.g., 0.25 acres or 10000 sqft"
              value={property.lotSize || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "lotSize")}
            />
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-yearBuilt`}>Year Built</Label>
            <Input
              id={`${type}-${property.id}-yearBuilt`}
              name="yearBuilt"
              placeholder="e.g., 1995"
              value={property.yearBuilt || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "yearBuilt")}
              type="number"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${type}-${property.id}-propertyType`}>Property Type</Label>
            <Input
              id={`${type}-${property.id}-propertyType`}
              name="propertyType"
              placeholder="e.g., Single Family, Condo"
              value={property.propertyType || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "propertyType")}
            />
          </div>
          <div>
            <Label htmlFor={`${type}-${property.id}-garageSpaces`}>Garage Spaces</Label>
            <Input
              id={`${type}-${property.id}-garageSpaces`}
              name="garageSpaces"
              placeholder="e.g., 2"
              value={property.garageSpaces || ""}
              onChange={(e) => handleInputChange(e, type, property.id, "garageSpaces")}
              type="number"
            />
          </div>
        </div>
        {type === "subjectProperty" && (
          <div>
            <Label htmlFor="subjectProperty-featuresOrCondition">Key Features / Condition</Label>
            <Textarea
              id="subjectProperty-featuresOrCondition"
              name="featuresOrCondition"
              placeholder="e.g., Recently renovated kitchen, new roof..."
              value={cmaReportData.subjectProperty.featuresOrCondition || ""}
              onChange={(e) => handleInputChange(e, "subjectProperty", undefined, "featuresOrCondition")}
              rows={3}
            />
          </div>
        )}
      </CardContent>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Report Setup</CardTitle>
            <CardDescription>Basic information for your CMA report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reportTitle">Report Title</Label>
                <Input
                  id="reportTitle"
                  name="reportTitle"
                  value={cmaReportData.reportTitle}
                  onChange={(e) => handleInputChange(e, "reportTitle")}
                  placeholder="e.g., CMA for 123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={cmaReportData.clientName}
                  onChange={(e) => handleInputChange(e, "clientName")}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="preparedDate">Date Prepared</Label>
                <Input
                  id="preparedDate"
                  name="preparedDate"
                  type="date"
                  value={cmaReportData.preparedDate}
                  onChange={(e) => handleInputChange(e, "preparedDate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion
          type="multiple"
          value={activeAccordionItems}
          onValueChange={setActiveAccordionItems}
          className="w-full space-y-4"
        >
          <AccordionItem value="subject-property" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline data-[state=open]:border-b">
              Subject Property Details
            </AccordionTrigger>
            {renderPropertyFields(cmaReportData.subjectProperty, "subjectProperty")}
          </AccordionItem>

          <AccordionItem value="comparables" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline data-[state=open]:border-b">
              Comparable Properties ({cmaReportData.comparableProperties.length})
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-0 pb-6">
              <div className="space-y-6">
                {cmaReportData.comparableProperties.map((comp, index) => (
                  <Card key={comp.id} className="relative shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-md">Comparable Property #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComparableProperty(comp.id)}
                        className="text-destructive hover:bg-destructive/10 absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </CardHeader>
                    {renderPropertyFields(comp, "comparableProperty")}
                  </Card>
                ))}
              </div>
              <Button onClick={addComparableProperty} variant="outline" className="mt-6 w-full">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Comparable Property
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="analysis-conclusion" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline data-[state=open]:border-b">
              AI-Powered Analysis & Conclusion
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Use AI to analyze properties and suggest pricing. You can edit the results.
                  </p>
                </TooltipContent>
              </Tooltip>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6 space-y-4">
              <Button
                onClick={handleGenerateAiAnalysis}
                disabled={isAiAnalysisLoading || !hasSubjectDetails || comparableDetailsCount === 0}
                className="w-full mb-4"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAiAnalysisLoading ? "Generating Analysis..." : "Generate AI Analysis & Pricing"}
              </Button>
              <div>
                <Label htmlFor="suggestedPriceRangeLow">Suggested Price Range (Low)</Label>
                <Input
                  id="suggestedPriceRangeLow"
                  name="low"
                  type="number"
                  value={cmaReportData.suggestedPriceRange.low}
                  onChange={(e) => handleInputChange(e, "suggestedPriceRange")}
                  placeholder="e.g., 480000"
                />
              </div>
              <div>
                <Label htmlFor="suggestedPriceRangeHigh">Suggested Price Range (High)</Label>
                <Input
                  id="suggestedPriceRangeHigh"
                  name="high"
                  type="number"
                  value={cmaReportData.suggestedPriceRange.high}
                  onChange={(e) => handleInputChange(e, "suggestedPriceRange")}
                  placeholder="e.g., 520000"
                />
              </div>
              <div>
                <Label htmlFor="priceAdjustmentNotes">Price Adjustment Notes</Label>
                <Textarea
                  id="priceAdjustmentNotes"
                  name="priceAdjustmentNotes"
                  value={cmaReportData.priceAdjustmentNotes}
                  onChange={(e) => handleInputChange(e, "priceAdjustmentNotes")}
                  placeholder="Notes on comparable adjustments..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="generalNotes">General Notes & Summary</Label>
                <Textarea
                  id="generalNotes"
                  name="generalNotes"
                  value={cmaReportData.generalNotes}
                  onChange={(e) => handleInputChange(e, "generalNotes")}
                  placeholder="Overall market conditions, recommendations..."
                  rows={4}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <section className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Report Preview</h2>
            <Button variant="outline" onClick={() => typeof window !== "undefined" && window.print()}>
              Print Report
            </Button>
          </div>
          <div className="border rounded-lg shadow-sm overflow-hidden bg-background">
            {ReportPreview && <ReportPreview data={cmaReportData} apiKey={googleMapsApiKey} />}
          </div>
        </section>
      </div>
    </TooltipProvider>
  )
}

"use client"

import type { CmaReportDataState, PropertyInput } from "@/lib/cma-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BedDoubleIcon, BathIcon, RulerIcon, CalendarDaysIcon, CarIcon, HomeIcon } from "lucide-react"
import React from "react"
import CmaReportMap from "./cma-report-map" // Import the map component

interface ReportPreviewProps {
  data: CmaReportDataState
  apiKey?: string
}

const formatCurrency = (value?: string, showNA = true) => {
  if (!value) return showNA ? "N/A" : ""
  const num = Number.parseFloat(value)
  return isNaN(num) ? (showNA ? value : "") : `$${num.toLocaleString()}`
}

const formatNumber = (value?: string, showNA = true) => {
  if (!value) return showNA ? "N/A" : ""
  const num = Number.parseFloat(value)
  return isNaN(num) ? (showNA ? value : "") : num.toLocaleString()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A"
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/) || dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch (e) {
      return dateString
    }
  }
  return dateString
}

const PropertyDetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <span className="font-semibold">{label}:</span> {value || "N/A"}
  </div>
)

export default function ReportPreview({ data, apiKey }: ReportPreviewProps) {
  const {
    reportTitle,
    clientName,
    preparedDate,
    subjectProperty,
    comparableProperties,
    generalNotes,
    priceAdjustmentNotes,
    suggestedPriceRange,
    generatedReport,
  } = data

  // Add this line to determine if the subject property is valid for comparison
  const hasValidSubjectProperty = !!subjectProperty?.address

  const displaySubjectPropertyField = (property: PropertyInput, field: keyof PropertyInput) => {
    const value = property[field]
    if (field === "listingUrl" && value) {
      return (
        <div className="md:col-span-2">
          <span className="font-semibold">Listing URL:</span>{" "}
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        </div>
      )
    }
    return (
      <PropertyDetailItem
        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
        value={value as string}
      />
    )
  }

  const Characteristic: React.FC<{ icon: React.ReactNode; value?: string; label: string }> = ({
    icon,
    value,
    label,
  }) => {
    if (!value) return null
    return (
      <span className="inline-flex items-center mr-3 last:mr-0">
        {React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5 mr-1 text-muted-foreground" })}
        {value} {label}
      </span>
    )
  }

  const validComparables = comparableProperties.filter((c) => c.listingUrl || c.address)

  const comparisonMetrics: Array<{
    label: string
    field: keyof PropertyInput
    formatter?: (value?: string, showNA?: boolean) => string
    icon?: React.ReactNode
  }> = [
    { label: "Price", field: "fetchedPrice", formatter: formatCurrency, icon: <HomeIcon className="h-4 w-4 mr-2" /> },
    { label: "Beds", field: "beds", formatter: formatNumber, icon: <BedDoubleIcon className="h-4 w-4 mr-2" /> },
    { label: "Baths", field: "baths", formatter: formatNumber, icon: <BathIcon className="h-4 w-4 mr-2" /> },
    { label: "Sq Ft", field: "sqft", formatter: formatNumber, icon: <RulerIcon className="h-4 w-4 mr-2" /> },
    {
      label: "Year Built",
      field: "yearBuilt",
      formatter: formatNumber,
      icon: <CalendarDaysIcon className="h-4 w-4 mr-2" />,
    },
    {
      label: "Garage",
      field: "garageSpaces",
      formatter: formatNumber,
      icon: <CarIcon className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/50 p-6">
        <CardTitle className="text-2xl">{reportTitle || "Comparative Market Analysis"}</CardTitle>
        {clientName && <CardDescription>Prepared for: {clientName}</CardDescription>}
        <CardDescription>
          Date Prepared:{" "}
          {formatDate(preparedDate) ||
            new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Property Locations</h2>
          <CmaReportMap subjectProperty={subjectProperty} comparableProperties={validComparables} apiKey={apiKey} />
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-semibold mb-3">Subject Property</h2>
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {displaySubjectPropertyField(subjectProperty, "address")}
              {displaySubjectPropertyField(subjectProperty, "propertyType")}
              {displaySubjectPropertyField(subjectProperty, "beds")}
              {displaySubjectPropertyField(subjectProperty, "baths")}
              {displaySubjectPropertyField(subjectProperty, "sqft")}
              {displaySubjectPropertyField(subjectProperty, "lotSize")}
              {displaySubjectPropertyField(subjectProperty, "yearBuilt")}
              {displaySubjectPropertyField(subjectProperty, "garageSpaces")}
              {displaySubjectPropertyField(subjectProperty, "listingUrl")}
            </CardContent>
            {subjectProperty.fetchedImageUrl && (
              <CardContent className="p-4 pt-0">
                <img
                  src={subjectProperty.fetchedImageUrl || "/placeholder.svg?height=200&width=300&query=house+exterior"}
                  alt="Subject Property"
                  className="rounded-md max-h-64 w-auto object-contain"
                />
              </CardContent>
            )}
            {subjectProperty.featuresOrCondition && (
              <CardContent className="p-4 pt-0">
                <PropertyDetailItem label="Key Features & Condition" value={subjectProperty.featuresOrCondition} />
              </CardContent>
            )}
          </Card>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-semibold mb-3">Comparable Properties</h2>
          {validComparables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {validComparables.map((comp) => (
                <a
                  key={comp.id}
                  href={comp.listingUrl || "#"}
                  target={comp.listingUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
                    <div className="aspect-[16/10] bg-muted overflow-hidden rounded-t-lg">
                      <img
                        src={
                          comp.fetchedImageUrl ||
                          "/placeholder.svg?width=400&height=250&query=modern+house+exterior" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={comp.fetchedTitle || comp.address || "Comparable Property"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = "/placeholder.svg?width=400&height=250"
                        }}
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-medium text-base text-foreground leading-tight mb-1 truncate">
                        {comp.address || comp.fetchedTitle || "Address Not Available"}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        <Characteristic icon={<BedDoubleIcon />} value={comp.beds} label="Beds" />
                        <Characteristic icon={<BathIcon />} value={comp.baths} label="Baths" />
                        <Characteristic icon={<RulerIcon />} value={comp.sqft} label="sq ft" />
                      </div>
                      {comp.fetchedPrice && (
                        <p className="text-sm font-semibold text-foreground mt-auto pt-2">
                          {formatCurrency(comp.fetchedPrice)}
                        </p>
                      )}
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No comparable properties added yet or URLs provided.</p>
          )}
        </section>

        {validComparables.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-xl font-semibold mb-3">Metrics Comparison</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] min-w-[120px]">Metric</TableHead>
                      {/* Conditionally render Subject Property header */}
                      {hasValidSubjectProperty && (
                        <TableHead className="min-w-[150px] text-center font-semibold">Subject Property</TableHead>
                      )}
                      {validComparables.map((comp, index) => (
                        <TableHead key={comp.id} className="min-w-[150px] text-center">
                          Comp #{index + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonMetrics.map((metric) => (
                      <TableRow key={metric.label}>
                        <TableCell className="font-medium flex items-center">
                          {metric.icon}
                          {metric.label}
                        </TableCell>
                        {/* Conditionally render Subject Property data cell */}
                        {hasValidSubjectProperty && (
                          <TableCell className="text-center">
                            {metric.formatter
                              ? metric.formatter(subjectProperty[metric.field] as string | undefined)
                              : (subjectProperty[metric.field] as string | undefined) || "N/A"}
                          </TableCell>
                        )}
                        {validComparables.map((comp) => (
                          <TableCell key={`${comp.id}-${metric.field}`} className="text-center">
                            {metric.formatter
                              ? metric.formatter(comp[metric.field] as string | undefined)
                              : (comp[metric.field] as string | undefined) || "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}

        <Separator />

        <section>
          <h2 className="text-xl font-semibold mb-3">Analysis & Conclusion</h2>
          {priceAdjustmentNotes && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-1">Price Adjustment Notes:</h3>
              <p className="whitespace-pre-wrap text-sm">{priceAdjustmentNotes}</p>
            </div>
          )}
          {(suggestedPriceRange.low || suggestedPriceRange.high) && (
            <p className="text-lg font-medium mb-2">
              Suggested Market Value Range: {formatCurrency(suggestedPriceRange.low)} -{" "}
              {formatCurrency(suggestedPriceRange.high)}
            </p>
          )}
          {generalNotes && (
            <div>
              <h3 className="text-md font-semibold mb-1">General Notes & Summary:</h3>
              <p className="whitespace-pre-wrap text-sm">{generalNotes}</p>
            </div>
          )}
          {!(suggestedPriceRange.low || suggestedPriceRange.high) && !generalNotes && !priceAdjustmentNotes && (
            <p className="text-muted-foreground">No pricing summary or notes provided yet.</p>
          )}
        </section>

        {generatedReport && (
          <>
            <Separator />
            <section>
              <h2 className="text-xl font-semibold mb-3">AI Generated Summary</h2>
              <p className="whitespace-pre-wrap text-sm">{generatedReport}</p>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  HomeIcon,
  PrinterIcon,
  MapPinIcon,
  BedIcon,
  BathIcon,
  SquareIcon,
  ListChecksIcon,
  Edit3Icon,
  DollarSignIcon,
} from "lucide-react"
import { cn } from "@/lib/utils" // Assuming formatCurrency is in utils
import { initialBuyerReportState, type BuyerReportState } from "@/lib/buyer-report-types" // Ensure types are imported

// Import new section components (placeholders for now)
import TitlePageSection from "@/components/cma/report-sections/title-page-section"

// Helper to display N/A for empty fields
const displayValue = (value: string | number | undefined, prefix = "", suffix = "") => {
  if (value === null || value === undefined || value === "") return "N/A"
  return `${prefix}${value}${suffix}`
}

export default function CmaToolRoutePage() {
  const [reportData, setReportData] = useState<BuyerReportState>(initialBuyerReportState)
  const [isLoading, setIsLoading] = useState(true)
  const [realtorProfile, setRealtorProfile] = useState<{
    primary_color?: string
    secondary_color?: string
    realtor_name?: string
    agency_name?: string
  } | null>(null)

  useEffect(() => {
    let originalBodyBackgroundColor = ""
    if (typeof window !== "undefined") {
      originalBodyBackgroundColor = document.body.style.backgroundColor || ""

      const storedCmaReport = localStorage.getItem("buyerReportDataForFinalCMA") // Key for CMA report data
      const storedProfile = localStorage.getItem("realtorProfile")

      if (storedCmaReport) {
        try {
          const parsedReport = JSON.parse(storedCmaReport)
          setReportData(parsedReport)
        } catch (e) {
          console.error("Failed to parse CMA report data from local storage", e)
          // Potentially set an error state here
        }
      }

      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)
          setRealtorProfile(profile)
          if (profile.secondary_color) {
            document.body.style.backgroundColor = profile.secondary_color
          }
        } catch (e) {
          console.error("Failed to parse realtor profile from local storage", e)
        }
      }
      setIsLoading(false)
    }

    return () => {
      if (typeof window !== "undefined") {
        document.body.style.backgroundColor = originalBodyBackgroundColor
      }
    }
  }, [])

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const primaryColorStyle = realtorProfile?.primary_color
    ? { backgroundColor: realtorProfile.primary_color, color: "#fff" }
    : {}

  const cardClassName = realtorProfile?.secondary_color ? "bg-card" : "" // Ensure cards have a background if body has color

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p>Loading report data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6 print:space-y-4 pb-16">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/home" passHref>
          <Button variant="outline">
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
        <Button variant="outline" onClick={handlePrint} style={primaryColorStyle}>
          <PrinterIcon className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div className="cma-report-content space-y-6">
        <Card className={cn("shadow-lg", cardClassName)}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold" style={{ color: realtorProfile?.primary_color || "inherit" }}>
              Buyer Property Analysis
            </CardTitle>
            <CardDescription>Prepared for: {displayValue(reportData.clientName)}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Date Prepared:</strong> {displayValue(new Date(reportData.preparedDate).toLocaleDateString())}
            </p>
            <p>
              <strong>Prepared By:</strong> {displayValue(reportData.preparedBy || realtorProfile?.realtor_name)}
            </p>
            <p>
              <strong>Agency:</strong> {displayValue(reportData.realtorAgency || realtorProfile?.agency_name)}
            </p>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={["criteria", "listings", "notes"]} className="w-full space-y-4">
          <AccordionItem value="criteria" className={cn("border rounded-lg shadow-sm", cardClassName)}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Buyer's Ideal Property Criteria
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <p>
                  <DollarSignIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  <strong>Price Range:</strong> {displayValue(reportData.buyerCriteria?.priceRange?.min, "$")} -{" "}
                  {displayValue(reportData.buyerCriteria?.priceRange?.max, "$")}
                </p>
                <p>
                  <BedIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  <strong>Bedrooms:</strong> {reportData.buyerCriteria?.beds ?? "N/A"}
                </p>
                <p>
                  <BathIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  <strong>Bathrooms:</strong> {reportData.buyerCriteria?.baths ?? "N/A"}
                </p>
                <p>
                  <SquareIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  <strong>Square Footage:</strong> {displayValue(reportData.buyerCriteria?.sqft, "", " sq ft")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mt-3 mb-1">
                  <ListChecksIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  Must-Have Features:
                </h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {displayValue(reportData.buyerCriteria?.mustHaveFeatures)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mt-3 mb-1">
                  <MapPinIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
                  Points of Interest:
                </h4>
                {reportData.buyerCriteria?.pointsOfInterest.length > 0 ? (
                  <ul className="list-disc list-inside pl-2 text-sm text-muted-foreground">
                    {reportData.buyerCriteria?.pointsOfInterest.map((poi) => (
                      <li key={poi.id}>
                        {poi.name} ({poi.address})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="listings" className={cn("border rounded-lg shadow-sm", cardClassName)}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Properties Considered
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {" "}
              {/* Remove padding for full-width table */}
              {(reportData.listings?.filter((l) => l.address) ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Beds</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Baths</TableHead>
                      <TableHead className="hidden lg:table-cell text-right">Sq.Ft.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.listings
                      ?.filter((l) => l.address)
                      .map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.address}</TableCell>
                          <TableCell className="text-right">{displayValue(listing.askingPrice, "$")}</TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            {displayValue(listing.beds)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            {displayValue(listing.baths)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right">
                            {displayValue(listing.sqft)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-muted-foreground">No listings added to the report.</p>
              )}
            </AccordionContent>
            {reportData.listings?.filter((l) => l.address && l.notes).length > 0 && (
              <AccordionContent className="p-4 border-t">
                <h4 className="font-semibold mb-2">Listing Notes:</h4>
                {reportData.listings
                  ?.filter((l) => l.address && l.notes)
                  .map((listing) => (
                    <div key={listing.id} className="mb-2 text-sm">
                      <p className="font-medium">{listing.address}:</p>
                      <p className="whitespace-pre-wrap text-muted-foreground pl-2">{listing.notes}</p>
                    </div>
                  ))}
              </AccordionContent>
            )}
          </AccordionItem>

          <AccordionItem value="notes" className={cn("border rounded-lg shadow-sm", cardClassName)}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Realtor's Notes & Recommendations
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <p className="whitespace-pre-wrap text-sm">{reportData.realtorNotes || "N/A"}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card className={cn("print:hidden", cardClassName)}>
          <CardFooter className="flex justify-center p-6">
            <Button asChild variant="outline" style={primaryColorStyle}>
              <Link href="/cma-ai-gen">
                <Edit3Icon className="mr-2 h-4 w-4" /> Edit Buyer Report
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <TitlePageSection
          propertyAddress={reportData.subjectProperty?.address ?? ""}
          agentName={reportData.preparedBy ?? ""}
          agencyName={reportData.realtorAgency ?? ""}
          date={reportData.preparedDate}
        />
      </div>
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important; /* Ensure white background for printing */
          }
          body * {
            visibility: hidden;
            color-adjust: exact; /* Attempt to force exact colors for printing */
            -webkit-print-color-adjust: exact; /* For Chrome/Safari */
          }
          .cma-report-content, .cma-report-content * {
            visibility: visible;
          }
          .cma-report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0.5in; /* Add some padding for print margins */
            font-size: 10pt; /* Adjust base font size for print */
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:space-y-4 > :not([hidden]) ~ :not([hidden]) {
             --tw-space-y-reverse: 0;
             margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
             margin-bottom: calc(1rem * var(--tw-space-y-reverse));
          }
          .card, .accordion-item { 
            page-break-inside: avoid;
            border: 1px solid #e2e8f0 !important; /* Add border for cards in print */
            box-shadow: none !important;
            background-color: #fff !important; /* Ensure card backgrounds are white */
          }
          .accordion-trigger {
            border-bottom: 1px solid #e2e8f0 !important;
          }
          h1, h2, h3, h4, h5, h6, .card-title, .accordion-trigger {
            page-break-after: avoid;
            page-break-inside: avoid;
            color: #000 !important; /* Ensure text is black for print */
          }
          p, li, td, th, span {
             color: #000 !important; /* Ensure text is black for print */
          }
          table {
            page-break-inside: auto;
            width: 100%;
          }
          thead {
            display: table-header-group; /* Ensure table headers repeat on each page */
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          img {
            max-width: 100% !important;
            page-break-inside: avoid;
          }
          a {
            text-decoration: none;
            color: #000 !important;
          }
          .text-muted-foreground {
            color: #555 !important; /* Slightly lighter black for muted text */
          }
        }
      `}</style>
    </div>
  )
}

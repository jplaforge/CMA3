"use client"

import type React from "react" // Keep if other specific React types are used, else optional
import { useState } from "react"
import dynamic from "next/dynamic"
import { type BuyerReportState, initialBuyerReportState } from "@/lib/buyer-report-types"
import BuyerCriteriaForm from "@/components/buyer-report/buyer-criteria-form"
import ListingsForm from "@/components/buyer-report/listings-form"
import RealtorNotesForm from "@/components/buyer-report/realtor-notes-form"
import ComparisonReport from "@/components/buyer-report/comparison-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Dynamically import the MapView component to ensure it's only rendered on the client side.
const MapView = dynamic(() => import("@/components/buyer-report/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[600px] w-full rounded-lg bg-muted">
      <p>Loading map...</p>
    </div>
  ),
})

interface BuyerReportClientPageProps {
  googleMapsApiKey?: string
}

export default function BuyerReportClientPage({ googleMapsApiKey }: BuyerReportClientPageProps) {
  const [reportData, setReportData] = useState<BuyerReportState>(initialBuyerReportState)

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setReportData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Buyer Tour & Analysis Tool</h1>
        <p className="text-muted-foreground">
          Compare listings against your buyer's needs and visualize them on a map.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={reportData.clientName}
                  onChange={handleInfoChange}
                  placeholder="e.g., Jane Buyer"
                />
              </div>
              <div>
                <Label htmlFor="preparedDate">Date Prepared</Label>
                <Input
                  id="preparedDate"
                  name="preparedDate"
                  type="date"
                  value={reportData.preparedDate}
                  onChange={handleInfoChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion
          type="multiple"
          defaultValue={["ideal-property-criteria", "listings-management"]}
          className="w-full space-y-4"
        >
          <AccordionItem value="ideal-property-criteria" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Step 1: Define Ideal Property
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <BuyerCriteriaForm data={reportData} setData={setReportData} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="listings-management" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Step 2: Add & Manage Listings
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <ListingsForm data={reportData} setData={setReportData} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="realtor-notes" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline data-[state=open]:border-b">
              Step 3: Add Instructions & Recommendations
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <RealtorNotesForm data={reportData} setData={setReportData} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-4">Analysis & Comparison</h2>
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Comparison View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="comparison" className="mt-4">
            <ComparisonReport data={reportData} googleMapsApiKey={googleMapsApiKey} />
          </TabsContent>
          <TabsContent value="map" className="mt-4">
            <MapView data={reportData} apiKey={googleMapsApiKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

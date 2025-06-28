"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { type BuyerReportState, initialBuyerReportState } from "@/lib/buyer-report-types"
import BuyerCriteriaForm from "@/components/buyer-report/buyer-criteria-form"
import ListingsForm from "@/components/buyer-report/listings-form"
import RealtorNotesForm from "@/components/buyer-report/realtor-notes-form"
import ComparisonReport from "@/components/buyer-report/comparison-report"
import RealtorHeader from "@/components/buyer-report/realtor-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  ArrowLeftIcon,
  FileTextIcon,
  HomeIcon,
  ClipboardListIcon,
  DollarSignIcon,
  Edit3Icon,
  ListChecksIcon,
  MessageSquareIcon,
  Settings2Icon,
  EyeIcon,
} from "lucide-react"
import { getContrastingTextColor, lightenColor } from "@/lib/utils"

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
  const [activeTab, setActiveTab] = useState("comparison")
  const [textColorForPrimary, setTextColorForPrimary] = useState("#ffffff")
  const [textColorForSecondary, setTextColorForSecondary] = useState("#000000")

  useEffect(() => {
    let originalBodyBackgroundColor = ""
    if (typeof window !== "undefined") {
      originalBodyBackgroundColor = document.body.style.backgroundColor || ""
      const storedProfile = localStorage.getItem("realtorProfile")
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)
          setReportData((prev) => ({
            ...prev,
            preparedBy: profile.realtor_name || "",
            realtorAgency: profile.agency_name || "",
            realtorPhoto: profile.realtor_photo_url || prev.realtorPhoto,
            primaryColor: profile.primary_color,
            secondaryColor: profile.secondary_color,
          }))

          if (profile.primary_color) {
            setTextColorForPrimary(getContrastingTextColor(profile.primary_color))
          }
          if (profile.secondary_color) {
            setTextColorForSecondary(getContrastingTextColor(profile.secondary_color))
            document.body.style.backgroundColor = profile.secondary_color
          }
        } catch (e) {
          console.error("Failed to parse realtor profile from local storage", e)
        }
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.backgroundColor = originalBodyBackgroundColor
      }
    }
  }, [])

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setReportData((prev) => ({ ...prev, [name]: value }))
  }

  const activeTabStyle = { backgroundColor: "var(--primary)", color: textColorForPrimary }

  const inactiveTabStyle = reportData.secondaryColor ? { color: textColorForSecondary } : {}

  const generateReportButtonStyle = { backgroundColor: "#64CC7D", color: "#1E404B" }

  const cardClassName = reportData.secondaryColor ? "bg-card/80 backdrop-blur-sm" : "bg-card"

  return (
    <div
      className="flex flex-col min-h-screen font-sans text-[#1E404B] p-4 sm:p-6 md:p-8"
      style={{
        background: "linear-gradient(to bottom, #F1F8FD, #EFF7FC)",
        "--primary": reportData.primaryColor || "#1E404B",
      } as React.CSSProperties}
    >
      <header
        className="sticky top-0 z-50 w-full border-b mb-6 shrink-0"
        style={{
          backgroundColor: lightenColor(reportData.primaryColor || "#1E404B", 0.2),
          borderColor: reportData.primaryColor || "#1E404B",
        }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <HomeIcon className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Buyer Tour & Analysis Tool</h1>
              <p className="text-sm">
                Streamline your client's property search and decision-making process.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0" style={{ backgroundColor: "#64CC7D", color: "#1E404B" }}>
            <Link href="/home">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border overflow-hidden">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2 text-xl font-semibold mb-2">
              <Settings2Icon className="h-6 w-6" style={{ color: "var(--primary)" }} />
              Report Configuration
            </div>
            <Card className={cardClassName}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardListIcon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                  Report Details (Buyer)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name (Buyer)</Label>
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
                  <div>
                    <Label htmlFor="preparedBy">Prepared By (Realtor)</Label>
                    <Input
                      id="preparedBy"
                      name="preparedBy"
                      value={reportData.preparedBy ?? ""}
                      onChange={handleInfoChange}
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="realtorAgency">Realtor Agency</Label>
                    <Input
                      id="realtorAgency"
                      name="realtorAgency"
                      value={reportData.realtorAgency ?? ""}
                      onChange={handleInfoChange}
                      placeholder="Your Agency Name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={[]} className="w-full space-y-4">
              <AccordionItem value="ideal-property-criteria" className={`border rounded-lg shadow-sm ${cardClassName}`}>
                <AccordionTrigger className="text-lg font-semibold p-3 hover:no-underline data-[state=open]:border-b">
                  <div className="flex items-center gap-2">
                    <DollarSignIcon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    Step 1: Ideal Property
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 pt-1">
                  <BuyerCriteriaForm
                    data={reportData}
                    setData={setReportData}
                    googleMapsApiKey={googleMapsApiKey}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="listings-management" className={`border rounded-lg shadow-sm ${cardClassName}`}>
                <AccordionTrigger className="text-lg font-semibold p-3 hover:no-underline data-[state=open]:border-b">
                  <div className="flex items-center gap-2">
                    <ListChecksIcon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    Step 2: Manage Listings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 pt-1">
                  <ListingsForm data={reportData} setData={setReportData} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="realtor-notes" className={`border rounded-lg shadow-sm ${cardClassName}`}>
                <AccordionTrigger className="text-lg font-semibold p-3 hover:no-underline data-[state=open]:border-b">
                  <div className="flex items-center gap-2">
                    <MessageSquareIcon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    Step 3: Notes & Recs
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 pt-1">
                  <RealtorNotesForm data={reportData} setData={setReportData} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <EyeIcon className="h-6 w-6" style={{ color: "var(--primary)" }} />
              Report Preview & Analysis
            </div>
            <Card className={`${cardClassName} flex-grow flex flex-col`}>
              <CardHeader className="shrink-0">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Edit3Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                  Analysis & Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col overflow-hidden">
                <RealtorHeader reportData={reportData} />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                    <TabsTrigger
                      value="comparison"
                      style={activeTab === "comparison" ? activeTabStyle : inactiveTabStyle}
                    >
                      Comparison View
                    </TabsTrigger>
                    <TabsTrigger value="map" style={activeTab === "map" ? activeTabStyle : inactiveTabStyle}>
                      Map View
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="comparison" className="mt-0 flex-grow overflow-y-auto">
                    <ComparisonReport
                      data={reportData}
                      googleMapsApiKey={googleMapsApiKey}
                      cardClassName={cardClassName}
                    />
                  </TabsContent>
                  <TabsContent value="map" className="mt-0 flex-grow overflow-y-auto">
                    <MapView data={reportData} apiKey={googleMapsApiKey} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-auto pt-6 shrink-0">
              <Button
                asChild
                size="lg"
                style={generateReportButtonStyle}
                className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href="/cma-report">
                  <FileTextIcon className="mr-2 h-5 w-5" />
                  Generate Report
                </Link>
              </Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

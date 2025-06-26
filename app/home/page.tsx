"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  ArrowRightIcon,
  UsersIcon,
  BarChartIcon,
  LinkIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  UserCheck2,
  FileText,
} from "lucide-react"
import { useState } from "react"

// Define a type for the profile data we expect
interface RealtorProfile {
  realtor_url: string
  realtor_name?: string
  agency_name?: string
  primary_color?: string
  secondary_color?: string
}

export default function HomePage() {
  const [realtorUrl, setRealtorUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<RealtorProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzeAndSaveUrl = async () => {
    if (!realtorUrl) {
      setError("Please enter a URL.")
      return
    }

    // ---------- NORMALISE URL ----------
    // If the user forgot to include a protocol, assume HTTPS
    let preparedUrl = realtorUrl.trim()
    if (!/^https?:\/\//i.test(preparedUrl)) {
      preparedUrl = `https://${preparedUrl}`
    }

    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const response = await fetch("/api/analyze-realtor-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realtorUrl: preparedUrl }),
      })

      const raw = await response.text()
      let data: any = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        data = { error: raw }
      }

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`)
      }

      const profileData = data as RealtorProfile
      setAnalysisResult(profileData)
      if (typeof window !== "undefined") {
        localStorage.setItem("realtorProfile", JSON.stringify(profileData))
      }
      setRealtorUrl(preparedUrl)
    } catch (err: any) {
      console.error("Failed to analyze URL:", err)
      setError(err.message || "An unknown error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = !!analysisResult && !isLoading && !error

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-200 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-20 items-center justify-center py-4 px-4 md:px-6">
          <Link href="/home" className="flex items-center" prefetch={false}>
            <Image
              src="/logos/welcomespaces-logo-light.png"
              alt="WelcomeSpaces Logo"
              width={500}
              height={100}
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/30 to-sky-900/20"></div>
          </div>
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 leading-tight">
              Unlock Powerful Real Estate Insights
            </h1>
            <p className="max-w-3xl mx-auto text-md md:text-lg text-gray-400 mb-10">
              Our suite provides comprehensive tools for Comparative Market Analysis (CMA) and detailed Buyer Reports,
              empowering you to make data-driven decisions with clarity and precision.
            </p>

            {/* Realtor URL Input Section */}
            <div className="mb-10 max-w-xl mx-auto">
              <p className="text-gray-400 mb-3 text-sm">
                Personalize your reports by adding your official realtor website. We&apos;ll try to extract key branding
                info.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-grow">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="url"
                    value={realtorUrl}
                    onChange={(e) => setRealtorUrl(e.target.value)}
                    placeholder="e.g., https://www.yourrealtysite.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-500"
                    aria-label="Realtor official URL"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleAnalyzeAndSaveUrl}
                  type="button"
                  className="bg-sky-700 hover:bg-sky-600 text-gray-100 px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Analyze & Save
                </Button>
              </div>
              {error && (
                <p className="text-red-400 text-xs flex items-center justify-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  {error}
                </p>
              )}
              {analysisResult && !error && (
                <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-md text-left text-xs">
                  <p className="text-green-400 font-semibold mb-2 flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Profile Analysis Complete & Saved:
                  </p>
                  {analysisResult.realtor_name && (
                    <p>
                      <strong>Realtor:</strong> {analysisResult.realtor_name}
                    </p>
                  )}
                  {analysisResult.agency_name && (
                    <p>
                      <strong>Agency:</strong> {analysisResult.agency_name}
                    </p>
                  )}
                  {analysisResult.primary_color && (
                    <p>
                      <strong>Primary Color:</strong>{" "}
                      <span
                        style={{
                          color: analysisResult.primary_color,
                          backgroundColor:
                            analysisResult.primary_color.startsWith("#") ||
                            analysisResult.primary_color.startsWith("rgb")
                              ? "transparent"
                              : "gray",
                        }}
                      >
                        {analysisResult.primary_color}
                      </span>
                    </p>
                  )}
                  {analysisResult.secondary_color && (
                    <p>
                      <strong>Secondary Color:</strong>{" "}
                      <span
                        style={{
                          color: analysisResult.secondary_color,
                          backgroundColor:
                            analysisResult.secondary_color.startsWith("#") ||
                            analysisResult.secondary_color.startsWith("rgb")
                              ? "transparent"
                              : "gray",
                        }}
                      >
                        {analysisResult.secondary_color}
                      </span>
                    </p>
                  )}
                  <p className="mt-1">
                    <strong>URL:</strong> {analysisResult.realtor_url}
                  </p>
                </div>
              )}
            </div>

            {/* Proceed Buttons Section */}
            {canProceed && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-sky-600 hover:bg-sky-500 text-white shadow-lg hover:shadow-sky-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 px-8 py-3 rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <Link href="/buyer-report">
                    For my Buyer
                    <UsersIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-sky-500 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 shadow-md hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:scale-105 px-8 py-3 rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <Link href="/cma-report">
                    For my Seller
                    <FileText className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 md:py-24 bg-gray-900/70">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-4xl font-bold text-center text-white mb-16 tracking-tight">
              Why Choose <span className="text-sky-400">WelcomeSpaces</span>?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <UserCheck2 className="h-10 w-10 text-sky-400 mb-4" />,
                  title: "Personalized Reports",
                  description: "Automatically brand reports with your name, agency, and colors after URL analysis.",
                  link: "#", // Link to section explaining this or keep as is
                },
                {
                  icon: <UsersIcon className="h-10 w-10 text-sky-400 mb-4" />,
                  title: "Buyer Report Generation",
                  description:
                    "Craft detailed, client-ready reports comparing listings to buyer criteria with map views and notes.",
                  link: "/buyer-report",
                },
                {
                  icon: <BarChartIcon className="h-10 w-10 text-sky-400 mb-4" />,
                  title: "In-Depth CMA",
                  description:
                    "Perform comprehensive market analysis with subject properties vs. comparables, visualized on maps.",
                  link: "/cma-report",
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-gray-800/80 border-gray-700/60 shadow-xl hover:shadow-sky-700/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-xl overflow-hidden group"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="text-2xl font-semibold text-gray-100 mb-3 group-hover:text-sky-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mb-6 text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button
                      variant="link"
                      asChild
                      className="text-sky-400 group-hover:text-sky-300 transition-colors mt-auto"
                    >
                      <Link href={feature.link}>
                        Learn More <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-gray-500 border-t border-gray-800 bg-black">
        <p>&copy; {new Date().getFullYear()} WelcomeSpaces. All rights reserved.</p>
        <p className="text-xs mt-1">Empowering Real Estate Professionals</p>
      </footer>
    </div>
  )
}

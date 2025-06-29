"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, BarChart3, Users, CheckCircle, ArrowRight, Globe } from "lucide-react"

interface RealtorProfile {
  realtorName?: string
  agencyName?: string
  primaryColor?: string
  secondaryColor?: string
  realtorPhotoUrl?: string
}

export default function HomePage() {
  const [realtorUrl, setRealtorUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [realtorProfile, setRealtorProfile] = useState<RealtorProfile | null>(null)
  const [error, setError] = useState("")

  // Apply realtor's secondary color to body background
  useEffect(() => {
    const savedProfile = localStorage.getItem("realtorProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setRealtorProfile(profile)

        // Apply secondary color as background if available
        if (profile.secondaryColor) {
          document.body.style.backgroundColor = profile.secondaryColor
          // Set contrasting text color
          const isLightColor = isColorLight(profile.secondaryColor)
          document.body.style.color = isLightColor ? "#1E404B" : "#FFFFFF"
        }
      } catch (e) {
        console.error("Error parsing saved realtor profile:", e)
      }
    }
  }, [])

  // Helper function to determine if a color is light
  const isColorLight = (color: string): boolean => {
    // Convert hex to RGB
    let r, g, b
    if (color.startsWith("#")) {
      const hex = color.slice(1)
      r = Number.parseInt(hex.substr(0, 2), 16)
      g = Number.parseInt(hex.substr(2, 2), 16)
      b = Number.parseInt(hex.substr(4, 2), 16)
    } else if (color.startsWith("rgb")) {
      const matches = color.match(/\d+/g)
      if (matches) {
        r = Number.parseInt(matches[0])
        g = Number.parseInt(matches[1])
        b = Number.parseInt(matches[2])
      } else {
        return true // Default to light if can't parse
      }
    } else {
      return true // Default to light for named colors
    }

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }

  const handleAnalyzeAndSaveUrl = async () => {
    if (!realtorUrl.trim()) {
      setError("Please enter a realtor URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/analyze-realtor-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ realtorUrl: realtorUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze URL")
      }

      setRealtorProfile(data)
      localStorage.setItem("realtorProfile", JSON.stringify(data))

      // Apply secondary color as background if available
      if (data.secondaryColor) {
        document.body.style.backgroundColor = data.secondaryColor
        // Set contrasting text color
        const isLightColor = isColorLight(data.secondaryColor)
        document.body.style.color = isLightColor ? "#1E404B" : "#FFFFFF"
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div
      className="flex flex-col min-h-screen font-sans text-[#1E404B]"
      style={{ background: "linear-gradient(to bottom, #F1F8FD, #EFF7FC)" }}
    >
      <header className="sticky top-0 z-50 w-full border-b border-[#1E404B] bg-[#1E404B]">
        <div className="container mx-auto flex h-24 items-center justify-center py-4 px-4 md:px-6">
          <Link href="/home" className="flex items-center" prefetch={false}>
            <img src="/logos/welcomespaces-logo-light.png" alt="WelcomeSpaces" className="h-12 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  AI-Powered Real Estate Reports
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Generate professional buyer reports and CMA analyses in minutes. Powered by advanced AI to help you
                  serve your clients better.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Realtor URL Input Section */}
        <section className="w-full py-12 bg-white/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <Card className="border-2 border-[#1E404B]/20 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-[#1E404B]">Get Started</CardTitle>
                  <CardDescription>
                    Enter your realtor website URL to personalize your reports with your branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        type="url"
                        placeholder="https://your-realtor-website.com"
                        value={realtorUrl}
                        onChange={(e) => setRealtorUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAnalyzeAndSaveUrl()
                          }
                        }}
                        className="flex-1"
                        disabled={isAnalyzing}
                      />
                      <Button
                        onClick={handleAnalyzeAndSaveUrl}
                        disabled={isAnalyzing || !realtorUrl.trim()}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>

                  {realtorProfile && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Profile Analyzed Successfully!</span>
                      </div>
                      <div className="space-y-1 text-sm text-green-700">
                        {realtorProfile.realtorName && (
                          <p>
                            <strong>Realtor:</strong> {realtorProfile.realtorName}
                          </p>
                        )}
                        {realtorProfile.agencyName && (
                          <p>
                            <strong>Agency:</strong> {realtorProfile.agencyName}
                          </p>
                        )}
                        {realtorProfile.primaryColor && (
                          <p>
                            <strong>Primary Color:</strong>{" "}
                            <span
                              className="inline-block w-4 h-4 rounded border ml-1"
                              style={{ backgroundColor: realtorProfile.primaryColor }}
                            ></span>{" "}
                            {realtorProfile.primaryColor}
                          </p>
                        )}
                        {realtorProfile.secondaryColor && (
                          <p>
                            <strong>Secondary Color:</strong>{" "}
                            <span
                              className="inline-block w-4 h-4 rounded border ml-1"
                              style={{ backgroundColor: realtorProfile.secondaryColor }}
                            ></span>{" "}
                            {realtorProfile.secondaryColor}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link href="/cma-ai-gen?type=buyer">
                          <Button>
                            <FileText className="mr-2 h-4 w-4" />
                            Buyer
                          </Button>
                        </Link>
                        <Link href="/cma-ai-gen?type=seller">
                          <Button variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Seller
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1E404B]">
                Why Choose WelcomeSpaces?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl mt-4">
                Streamline your real estate business with our comprehensive AI-powered tools
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="border-2 border-[#1E404B]/10 hover:border-[#64CC7D]/50 transition-colors hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#64CC7D]/10">
                    <FileText className="h-6 w-6 text-[#64CC7D]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#1E404B]">Buyer Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Generate comprehensive buyer reports with property comparisons, market analysis, and personalized
                    recommendations.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#1E404B]/10 hover:border-[#64CC7D]/50 transition-colors hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#64CC7D]/10">
                    <BarChart3 className="h-6 w-6 text-[#64CC7D]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#1E404B]">CMA Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Create detailed Comparative Market Analysis reports with automated property valuations and market
                    insights.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#1E404B]/10 hover:border-[#64CC7D]/50 transition-colors hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#64CC7D]/10">
                    <Users className="h-6 w-6 text-[#64CC7D]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#1E404B]">Client-Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Professional, branded reports ready to share with clients. Customize with your agency's colors and
                    branding.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#1E404B]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl">
                  Join thousands of real estate professionals who trust WelcomeSpaces for their reporting needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cma-ai-gen">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Your First Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <img src="/logos/welcomespaces-logo-light.png" alt="WelcomeSpaces" className="h-8 w-auto" />
              <span className="text-sm text-gray-600">© 2024 WelcomeSpaces. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-[#64CC7D]/10 text-[#64CC7D]">
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-[#1E404B]/10 text-[#1E404B]">
                Professional Reports
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

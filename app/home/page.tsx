import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowRightIcon, UsersIcon, BarChartIcon, MapIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-200 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-20 items-center justify-center py-4 px-4 md:px-6">
          <Link href="/home" className="flex items-center" prefetch={false}>
            <Image
              src="/logos/welcomespaces-logo-light.png"
              alt="WelcomeSpaces Logo"
              width={500} // Slightly reduced from 600 for better proportion
              height={100} // Slightly reduced from 120
              priority // Prioritize loading the logo
            />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24 lg:pb-32 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/30 to-sky-900/20"></div>
          </div>
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-8 leading-tight">
              Unlock Powerful Real Estate Insights
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-12">
              Our suite provides comprehensive tools for Comparative Market Analysis (CMA) and detailed Buyer Reports,
              empowering you to make data-driven decisions with clarity and precision.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button
                asChild
                size="lg"
                className="bg-sky-600 hover:bg-sky-500 text-white shadow-lg hover:shadow-sky-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 px-8 py-3 rounded-lg text-base font-semibold"
              >
                <Link href="/buyer-report">
                  Buyer Report Tool
                  <UsersIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-sky-500 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 shadow-md hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:scale-105 px-8 py-3 rounded-lg text-base font-semibold"
              >
                <Link href="/cma-tool">
                  CMA Tool
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
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
                  link: "/cma-tool",
                },
                {
                  icon: <MapIcon className="h-10 w-10 text-sky-400 mb-4" />,
                  title: "Geospatial Analysis",
                  description:
                    "Leverage precise geocoding and map-based visualizations for enhanced property insights.",
                  link: "/cma-tool", // Or a more specific link if available
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

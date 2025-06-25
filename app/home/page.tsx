import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowRightIcon, BuildingIcon, UsersIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-800">
      <header className="py-6 px-4 md:px-6 border-b dark:border-slate-700">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2" prefetch={false}>
            <BuildingIcon className="h-8 w-8 text-sky-600 dark:text-sky-500" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">Real Estate Analytics Suite</span>
          </Link>
          {/* Add navigation if needed in the future */}
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
              Unlock Powerful Real Estate Insights
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
              Our suite provides comprehensive tools for Comparative Market Analysis (CMA) and detailed Buyer Reports,
              empowering you to make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600"
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
                className="border-sky-600 text-sky-600 hover:bg-sky-50 dark:border-sky-500 dark:text-sky-400 dark:hover:bg-slate-800"
              >
                <Link href="/cma-tool">
                  CMA Tool
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white dark:bg-slate-800/50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-sky-700 dark:text-sky-400">
                    <UsersIcon className="h-6 w-6" />
                    Buyer Report Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Create detailed reports for buyers, comparing multiple listings against their ideal criteria.
                    Includes map views, property details, and personalized notes.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-sky-700 dark:text-sky-400">
                    <BuildingIcon className="h-6 w-6" />
                    Comparative Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Perform in-depth CMA by analyzing a subject property against comparable sales. Visualize data on
                    maps and generate comprehensive reports.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 border-t dark:border-slate-700">
        <p>&copy; {new Date().getFullYear()} Real Estate Analytics Suite. All rights reserved.</p>
      </footer>
    </div>
  )
}

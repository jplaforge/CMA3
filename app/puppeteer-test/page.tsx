"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from "lucide-react"

export default function PuppeteerTestPage() {
  const [url, setUrl] = useState("https://example.com")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiUrl, setApiUrl] = useState("")

  useEffect(() => {
    // Ensure window is defined before using it
    if (typeof window !== "undefined") {
      setApiUrl(`${window.location.origin}/api/analyze-realtor-url?url=`)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/analyze-realtor-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl + url)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">openPuppeteer</h1>
          <p className="text-gray-600 mt-2">Free Puppeteer as a Service | Set up easily on Vercel.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Enter a URL to check its status or use our API.</p>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Checking..." : "Check Status"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
              <code className="text-sm truncate">
                <span className="text-green-600 font-semibold">GET</span> {apiUrl}
                {url}
              </code>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-4 bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

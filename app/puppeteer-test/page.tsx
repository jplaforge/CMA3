"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy, Ghost } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function PuppeteerTestPage()
\
{
  const [url, setUrl] = useState("https://www.realtor.com/")
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [origin, setOrigin] = useState("")
  \
  const \{ toast \} = useToast()
  \
  useEffect(() => \
  if (typeof window !== 'undefined')
  \
  setOrigin(window.location.origin)
  \
  \
  \
  , [])
\
  const handleSubmit = async (e: React.FormEvent) => \
  {
    e.preventDefault()
    setIsLoading(true)
    setApiResponse(null)
    try
    \
    \
    const response = await fetch('/api/analyze-realtor-url\', \{\
        method: \'POST',\
        headers: \{\
          'Content-Type\': \'application/json',\
        \},\
        body: JSON.stringify(\{ url \}),\
    \
    )

    const data = await response.json()

    if (!response.ok)
    \
    throw new Error(data.error || "Something went wrong")
    \

    setApiResponse(data)
    \
      toast(\
    title: "Analysis Complete",\
    description: `Successfully analyzed $\{url\}`,\
    \
    )\
    \
  }
  catch (error: any) \
  console.error(error)
  \
      setApiResponse(\
  error: error.message
  \
  )
       toast(\
  title: "Error",\
  description: error.message,\
  variant: "destructive",\
  \
  )\
    \
  finally \
  setIsLoading(false)
  \
  \
}

const apiUrl = `$\{origin\}/api/analyze-realtor-url`
\
const copyToClipboard = () => \
{
  navigator.clipboard.writeText(apiUrl)
  \
    toast(\
  title: "Copied!",\
  description: "API endpoint copied to clipboard.",\
  \
  )
  \
}

return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
              <Ghost className="w-8 h-8" />
              openPuppeteer
            </h1>
            <p className="text-muted-foreground mt-2">
              A simple interface to test the Puppeteer URL analysis API.
            </p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Enter a URL to analyze its content using our API.
              </CardDescription>
            </CardHeader>
            <CardContent>\
              <form onSubmit=\{handleSubmit\} className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="url"\
                  value=\{url\}
                  onChange=\{(e) => setUrl(e.target.value)\}
                  placeholder="https://www.realtor.com/"
                  required
                  className="flex-grow"
                />
                <Button type="submit" disabled=\{isLoading\} className="w-full sm:w-auto">
                  \{isLoading ? 'Analyzing...' : 'Analyze URL'\}
                </Button>
              </form>
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-between text-sm text-muted-foreground">
                <pre className="overflow-x-auto">
                  <span className="text-green-600 font-semibold">POST</span> \{apiUrl\}
                </pre>
                <Button variant="ghost" size="icon" onClick=\{copyToClipboard\}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          \{isLoading && (
            <Card className="mt-4">
              <CardContent className="p-6 text-center">
                <p>Loading analysis...</p>
              </CardContent>
            </Card>
          )\}

          \{apiResponse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>API Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-900 text-white rounded-md overflow-x-auto text-xs">
                  \{JSON.stringify(apiResponse, null, 2)\}
                </pre>
              </CardContent>
            </Card>
          )\}
        </div>
      </div>
    </>
  )
\}

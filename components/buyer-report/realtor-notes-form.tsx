"use client"

import type React from "react"
import { useState } from "react"
import type { BuyerReportState } from "@/lib/buyer-report-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface RealtorNotesFormProps {
  data: BuyerReportState
  setData: React.Dispatch<React.SetStateAction<BuyerReportState>>
}

export default function RealtorNotesForm({ data, setData }: RealtorNotesFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setData((prev) => ({
      ...prev,
      realtorNotes: value,
    }))
  }

  const handleGenerateRecommendation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate recommendation.")
      }

      const result = await response.json()
      setData((prev) => ({
        ...prev,
        realtorNotes: result.recommendation,
      }))
    } catch (error) {
      console.error(error)
      // You could add a user-facing error message here (e.g., using a toast)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realtor Instructions & Recommendations</CardTitle>
        <CardDescription>
          Add your final thoughts, next steps, or specific instructions for your client here. This will appear at the
          end of the report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="realtorNotes">Your Notes</Label>
            <Button onClick={handleGenerateRecommendation} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              )}
              Generate with AI
            </Button>
          </div>
          <Textarea
            id="realtorNotes"
            name="realtorNotes"
            placeholder="Click 'Generate with AI' or manually type your notes here. e.g., 'Based on our tour, Listing #1 and #3 seem to be the best fit...'"
            value={data.realtorNotes}
            onChange={handleNotesChange}
            rows={10}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}

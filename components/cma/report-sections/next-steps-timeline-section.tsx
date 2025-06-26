import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { NextStepItem } from "@/lib/cma-types"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarClockIcon } from "lucide-react"

interface NextStepsTimelineSectionProps {
  steps?: NextStepItem[]
}

export default function NextStepsTimelineSection({ steps }: NextStepsTimelineSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Next Steps & Proposed Timeline</CardTitle>
        <CardDescription>A clear roadmap for the listing and sale process.</CardDescription>
      </CardHeader>
      <CardContent>
        {steps && steps.length > 0 ? (
          <ul className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start p-3 bg-muted/30 rounded-md">
                <Checkbox id={`step-${index}`} checked={step.completed} className="mr-3 mt-1" disabled />
                <div className="flex-1">
                  <label
                    htmlFor={`step-${index}`}
                    className={`font-medium ${step.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {step.task}
                  </label>
                  {step.deadline && <p className="text-xs text-muted-foreground">Target: {step.deadline}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground flex items-center">
            <CalendarClockIcon className="h-5 w-5 mr-2" />
            Next steps and timeline to be discussed.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

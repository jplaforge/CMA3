import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IntroductionLetterSectionProps {
  overview?: string
  benefits?: string
  agentName?: string
  agencyName?: string
  agentContactInfo?: string
}

export default function IntroductionLetterSection({
  overview,
  benefits,
  agentName,
  agencyName,
  agentContactInfo,
}: IntroductionLetterSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Introduction Letter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Dear Valued Client,</p>
        <p>
          {overview ||
            "This report provides an analysis of current market conditions and comparable properties to help determine an appropriate market value for your property."}
        </p>
        <p>
          {benefits ||
            "Understanding your property's market position is key to a successful sale. This CMA offers insights to guide your pricing strategy."}
        </p>
        <p>
          I am committed to providing you with the highest level of service and expertise. Please don't hesitate to
          reach out if you have any questions or wish to discuss this report further.
        </p>
        <p>{agentContactInfo || "You can reach me at [Agent Phone] or [Agent Email]."}</p>
        <p className="mt-6">Sincerely,</p>
        <p className="font-semibold">{agentName || "Agent Name"}</p>
        <p>{agencyName || "Agency Name"}</p>
      </CardContent>
    </Card>
  )
}

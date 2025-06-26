import { Card, CardContent } from "@/components/ui/card"

interface TitlePageSectionProps {
  propertyAddress?: string
  agentName?: string
  agencyName?: string
  date?: string
}

export default function TitlePageSection({ propertyAddress, agentName, agencyName, date }: TitlePageSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardContent className="pt-6 text-center min-h-[80vh] flex flex-col justify-center items-center">
        <img src="/placeholder-logo.png" alt={agencyName || "Realty Agency"} className="h-20 w-auto mb-8" />
        <h1 className="text-4xl font-bold mb-4">Comparative Market Analysis</h1>
        <p className="text-2xl text-muted-foreground mb-12">{propertyAddress || "Property Address Not Specified"}</p>
        <p className="text-lg">Prepared For: Valued Client</p> {/* Client name is in main state, could be passed */}
        <p className="text-lg mt-2">Prepared By: {agentName || "Agent Name"}</p>
        <p className="text-md text-muted-foreground">{agencyName || "Agency Name"}</p>
        <p className="text-md text-muted-foreground mt-8">Date: {new Date(date || Date.now()).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}

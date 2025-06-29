import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ListingStrategy } from "@/lib/cma-types"
import { LightbulbIcon, MegaphoneIcon, CheckSquareIcon } from "lucide-react"

interface ListingStrategySectionProps {
  strategy?: ListingStrategy
}

export default function ListingStrategySection({ strategy }: ListingStrategySectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Recommended Listing Strategy</CardTitle>
        <CardDescription>How to position and market your property for optimal results.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategy?.pricingStrategy && (
          <p className="text-sm">
            <strong>Pricing Strategy:</strong> {strategy.pricingStrategy}
          </p>
        )}
        {strategy?.goToMarketStrategy && (
          <p className="text-sm">
            <strong>Go to Market:</strong> {strategy.goToMarketStrategy}
          </p>
        )}
        {strategy?.marketingStrategy && (
          <p className="text-sm">
            <strong>Marketing Strategy:</strong> {strategy.marketingStrategy}
          </p>
        )}
        <div>
          <h4 className="font-semibold text-md mb-1 flex items-center">
            <LightbulbIcon className="h-4 w-4 mr-2 text-primary" />
            Positioning & Price Narrative:
          </h4>
          <p className="text-sm text-muted-foreground">{strategy?.priceNarrative || "To be defined."}</p>
        </div>
        {strategy?.keySellingPoints && strategy.keySellingPoints.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center">
              <CheckSquareIcon className="h-4 w-4 mr-2 text-primary" />
              Key Selling Points:
            </h4>
            <ul className="list-disc list-inside pl-2 text-sm space-y-0.5">
              {strategy.keySellingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-md mb-2 flex items-center">
            <MegaphoneIcon className="h-4 w-4 mr-2 text-primary" />
            Marketing Plan Highlights:
          </h4>
          <ul className="list-disc list-inside pl-2 text-sm space-y-1">
            {strategy?.marketingPlan?.mls && (
              <li>Professional MLS Listing with high-quality photos and description.</li>
            )}
            {strategy?.marketingPlan?.socialMedia && <li>Targeted social media campaigns and posts.</li>}
            {strategy?.marketingPlan?.videoTour && <li>Virtual video tour available online.</li>}
            {strategy?.marketingPlan?.openHouse && <li>Scheduled open house events (if applicable).</li>}
            {strategy?.marketingPlan?.other && strategy.marketingPlan.other.map((item) => <li key={item}>{item}</li>)}
            {!strategy?.marketingPlan && (
              <li className="text-muted-foreground">Marketing plan details to be discussed.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PriceScenario } from "@/lib/cma-types"
import { formatCurrency } from "@/lib/utils"
import { TargetIcon, TrendingDownIcon, TrendingUpIcon, RatioIcon as BalanceIcon } from "lucide-react"

interface AnalysisPriceRangeSectionProps {
  suggestedPriceRange?: { low: string; high: string }
  priceScenarios?: PriceScenario[]
  generalNotes?: string
}

const ScenarioIcon = ({ name }: { name: PriceScenario["name"] }) => {
  if (name === "Aggressive") return <TrendingDownIcon className="h-5 w-5 mr-2 text-red-500" />
  if (name === "Top of Market") return <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
  return <BalanceIcon className="h-5 w-5 mr-2 text-blue-500" />
}

export default function AnalysisPriceRangeSection({
  suggestedPriceRange,
  priceScenarios,
  generalNotes,
}: AnalysisPriceRangeSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Analysis & Recommended Price Range</CardTitle>
        <CardDescription>Synthesizing data to arrive at a strategic list price.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {suggestedPriceRange && (suggestedPriceRange.low || suggestedPriceRange.high) && (
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <TargetIcon className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-primary mb-1">Suggested Market Value Range</h3>
            <p className="text-3xl font-bold">
              {formatCurrency(suggestedPriceRange.low)} - {formatCurrency(suggestedPriceRange.high)}
            </p>
          </div>
        )}

        {priceScenarios && priceScenarios.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">Pricing Scenarios:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priceScenarios.map((scenario) => (
                <Card key={scenario.name} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <ScenarioIcon name={scenario.name} /> {scenario.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-xl mb-1">{formatCurrency(scenario.price)}</p>
                    <p className="text-xs text-muted-foreground">{scenario.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {generalNotes && (
          <div className="pt-4 mt-4 border-t">
            <h4 className="font-semibold text-md mb-1">Overall Analysis & Summary:</h4>
            <p className="text-sm whitespace-pre-wrap">{generalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

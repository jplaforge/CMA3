import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { MarketTrendData } from "@/lib/cma-types"
import { TrendingUpIcon, ClockIcon, PercentIcon, BriefcaseIcon, BarChartIcon, CheckCircleIcon } from "lucide-react"

interface MarketContextSectionProps {
  marketData?: MarketTrendData
}

const DataPoint: React.FC<{ icon: React.ElementType; label: string; value?: string }> = ({
  icon: Icon,
  label,
  value,
}) => {
  if (!value) return null
  return (
    <div className="flex items-center p-3 bg-muted/50 rounded-lg">
      <Icon className="h-6 w-6 mr-3 text-primary" />
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  )
}

export default function MarketContextSection({ marketData }: MarketContextSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Market Context</CardTitle>
        <CardDescription>Understanding current regional and local economic factors.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataPoint icon={TrendingUpIcon} label="Median Price (Regional)" value={marketData?.medianPrice} />
        <DataPoint icon={ClockIcon} label="Avg. Days on Market (Regional)" value={marketData?.daysOnMarket} />
        <DataPoint icon={PercentIcon} label="Current Interest Rates" value={marketData?.interestRates} />
        <DataPoint icon={BriefcaseIcon} label="Local Employment Rate" value={marketData?.employmentRate} />
        <DataPoint icon={BarChartIcon} label="Absorption Rate" value={marketData?.absorptionRate} />
        <DataPoint icon={CheckCircleIcon} label="List-to-Sale Ratio" value={marketData?.listToSaleRatio} />
        <DataPoint icon={TrendingUpIcon} label="Competition Level" value={marketData?.competitionLevel} />
      </CardContent>
    </Card>
  )
}

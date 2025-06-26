import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PropertyInput, ComparableProperty, AdjustmentItem } from "@/lib/cma-types"
import { formatCurrency } from "@/lib/utils"

interface AdjustmentsSectionProps {
  subjectProperty: PropertyInput
  comparables: ComparableProperty[] // Sold comparables
  adjustmentsGrid?: AdjustmentItem[][] // Array per comparable
  adjustedPrices?: Array<{ compId: string; adjustedPrice: string }>
  priceAdjustmentNotes?: string
}

export default function AdjustmentsSection({
  subjectProperty,
  comparables,
  adjustmentsGrid,
  adjustedPrices,
  priceAdjustmentNotes,
}: AdjustmentsSectionProps) {
  // This is a simplified representation. A real adjustments grid is complex.
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Valuation Adjustments</CardTitle>
        <CardDescription>Fine-tuning comparable values based on differences with the subject property.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The following table illustrates adjustments made to comparable properties to account for differences in
          features, condition, size, etc., relative to the subject property at {subjectProperty.address}.
        </p>

        {/* Placeholder for a detailed adjustments grid. This would be a complex table. */}
        {comparables.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Subject Property</TableHead>
                  {comparables.map((comp) => (
                    <TableHead key={comp.id} className="text-center">
                      Comp: {comp.address.split(",")[0]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example Adjustment Row - this would be dynamic based on AdjustmentItem[] */}
                <TableRow>
                  <TableCell>Condition</TableCell>
                  <TableCell>Good</TableCell>
                  {comparables.map((comp) => (
                    <TableCell key={comp.id} className="text-center">
                      Fair (+{formatCurrency("5000")})
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Sq Footage</TableCell>
                  <TableCell>{subjectProperty.sqft} sqft</TableCell>
                  {comparables.map((comp) => (
                    <TableCell key={comp.id} className="text-center">
                      {comp.sqft} sqft (-{formatCurrency("10000")})
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell>Original Sale Price</TableCell>
                  <TableCell>-</TableCell>
                  {comparables.map((comp) => (
                    <TableCell key={comp.id} className="text-center">
                      {formatCurrency(comp.fetchedPrice)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-bold text-lg border-t-2 border-primary">
                  <TableCell>Adjusted Price</TableCell>
                  <TableCell>-</TableCell>
                  {comparables.map((comp, index) => (
                    <TableCell key={comp.id} className="text-center">
                      {formatCurrency(
                        adjustedPrices?.find((ap) => ap.compId === comp.id)?.adjustedPrice ||
                          (Number(comp.fetchedPrice || 0) - 5000).toString(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">No comparable properties available for adjustment.</p>
        )}

        {priceAdjustmentNotes && (
          <div className="pt-4 mt-4 border-t">
            <h4 className="font-semibold text-md mb-1">Price Adjustment Notes:</h4>
            <p className="text-sm whitespace-pre-wrap">{priceAdjustmentNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

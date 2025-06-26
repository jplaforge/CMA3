import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ComparableProperty, PropertyInput } from "@/lib/cma-types"
import CmaReportMap from "@/components/cma/cma-report-map"
import { formatCurrency, formatDate, formatSqFt } from "@/lib/utils" // Assuming these are in utils

interface SoldComparablesSectionProps {
  comparables: ComparableProperty[]
  subjectProperty: PropertyInput
  apiKey?: string
}

export default function SoldComparablesSection({ comparables, subjectProperty, apiKey }: SoldComparablesSectionProps) {
  const soldComps = comparables.filter((c) => c.status === "Sold")

  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Sold Comparable Properties</CardTitle>
        <CardDescription>Recently sold properties similar to the subject property.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {soldComps.length > 0 && apiKey && (
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2">Comparables Map</h4>
            <CmaReportMap subjectProperty={subjectProperty} comparableProperties={soldComps} apiKey={apiKey} />
          </div>
        )}
        {soldComps.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Sale Date</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="text-right">$/SqFt</TableHead>
                <TableHead>Details (B/B/SqFt)</TableHead>
                <TableHead>Differences</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soldComps.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>
                    {comp.listingUrl ? (
                      <a
                        href={comp.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {comp.address}
                      </a>
                    ) : (
                      comp.address
                    )}
                    {comp.fetchedImageUrl && (
                      <img
                        src={comp.fetchedImageUrl || "/placeholder.svg"}
                        alt={comp.address}
                        className="mt-1 rounded-md w-24 h-16 object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatDate(comp.saleDate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(comp.fetchedPrice)}</TableCell>
                  <TableCell className="text-right">
                    {comp.pricePerSqFt ? formatCurrency(comp.pricePerSqFt) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {comp.beds}bd / {comp.baths}ba / {formatSqFt(comp.sqft)}
                  </TableCell>
                  <TableCell className="text-xs">{comp.differencesToSubject || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No sold comparable properties data available.</p>
        )}
      </CardContent>
    </Card>
  )
}

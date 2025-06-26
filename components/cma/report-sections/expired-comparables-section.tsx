import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ComparableProperty } from "@/lib/cma-types"
import { formatCurrency, formatSqFt } from "@/lib/utils"

interface ExpiredComparablesSectionProps {
  comparables: ComparableProperty[]
}

export default function ExpiredComparablesSection({ comparables }: ExpiredComparablesSectionProps) {
  const expiredComps = comparables.filter((c) => c.status === "Expired/Withdrawn")
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Expired/Withdrawn Comparables</CardTitle>
        <CardDescription>Listings that did not sell, offering insights into market resistance.</CardDescription>
      </CardHeader>
      <CardContent>
        {expiredComps.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Last List Price</TableHead>
                <TableHead>Details (B/B/SqFt)</TableHead>
                <TableHead>Reason for Withdrawal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiredComps.map((comp) => (
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
                  <TableCell className="text-right">{formatCurrency(comp.fetchedPrice)}</TableCell>
                  <TableCell>
                    {comp.beds}bd / {comp.baths}ba / {formatSqFt(comp.sqft)}
                  </TableCell>
                  <TableCell className="text-xs">{comp.reasonForWithdrawal || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No expired/withdrawn comparable properties data available.</p>
        )}
      </CardContent>
    </Card>
  )
}

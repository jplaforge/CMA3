import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { NetProceedsProjection } from "@/lib/cma-types"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { PiggyBankIcon } from "lucide-react"

interface NetProceedsSectionProps {
  projection?: NetProceedsProjection
}

export default function NetProceedsSection({ projection }: NetProceedsSectionProps) {
  const totalIncome = projection?.items.filter((i) => i.type === "income").reduce((sum, i) => sum + i.amount, 0) || 0
  const totalExpenses = projection?.items.filter((i) => i.type === "expense").reduce((sum, i) => sum + i.amount, 0) || 0
  const estimatedNet = projection?.estimatedNetToSeller ?? totalIncome + totalExpenses // Expenses are negative

  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Estimated Net Proceeds</CardTitle>
        <CardDescription>A projection of your financial outcome from the sale.</CardDescription>
      </CardHeader>
      <CardContent>
        {projection && projection.items.length > 0 ? (
          <>
            {projection.estimatedSalePrice && (
              <p className="text-sm mb-2">
                Based on an estimated sale price of:{" "}
                <span className="font-semibold">{formatCurrency(projection.estimatedSalePrice.toString())}</span>
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projection.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className={`text-right ${item.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(item.amount.toString())}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-primary/10">
                  <TableCell className="font-bold text-lg">Estimated Net to Seller</TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(estimatedNet.toString())}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <p className="text-xs text-muted-foreground mt-4">
              Note: This is an estimate for discussion purposes only. Actual costs and proceeds may vary. Consult with
              financial and legal professionals for precise figures.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground flex items-center">
            <PiggyBankIcon className="h-5 w-5 mr-2" />
            Net proceeds projection not yet available.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

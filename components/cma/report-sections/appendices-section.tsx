import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { AppendixItem } from "@/lib/cma-types"
import { FileTextIcon, LinkIcon } from "lucide-react"

interface AppendicesSectionProps {
  appendices?: AppendixItem[]
}

export default function AppendicesSection({ appendices }: AppendicesSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Appendices</CardTitle>
        <CardDescription>Supporting documentation and additional information.</CardDescription>
      </CardHeader>
      <CardContent>
        {appendices && appendices.length > 0 ? (
          <ul className="space-y-2">
            {appendices.map((item, index) => (
              <li key={index} className="text-sm">
                {item.urlOrContent.startsWith("http") || item.urlOrContent.startsWith("/") ? (
                  <a
                    href={item.urlOrContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" /> {item.name}
                  </a>
                ) : (
                  <span className="flex items-center">
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    <strong>{item.name}:</strong> {item.urlOrContent}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground flex items-center">
            <FileTextIcon className="h-5 w-5 mr-2" />
            No appendices attached.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

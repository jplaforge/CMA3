import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PropertyInput } from "@/lib/cma-types"
import {
  BedDoubleIcon,
  BathIcon,
  RulerIcon,
  CalendarDaysIcon,
  CarIcon,
  HomeIcon,
  ListChecksIcon,
  WrenchIcon,
  AwardIcon,
  ImageIcon,
  MapIcon,
} from "lucide-react"
import CmaReportMap from "@/components/cma/cma-report-map" // Re-use map

interface PropertyProfileSectionProps {
  property: PropertyInput
  apiKey?: string
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null }> = ({
  icon: Icon,
  label,
  value,
}) => {
  if (!value) return null
  return (
    <div className="flex items-center text-sm">
      <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="font-medium">{label}:</span>&nbsp;{value}
    </div>
  )
}

export default function PropertyProfileSection({ property, apiKey }: PropertyProfileSectionProps) {
  return (
    <Card className="w-full card-container-print">
      <CardHeader>
        <CardTitle>Subject Property Profile</CardTitle>
        <CardDescription>{property.address || "Address not specified"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <DetailItem icon={HomeIcon} label="Property Type" value={property.propertyType} />
            <DetailItem icon={BedDoubleIcon} label="Bedrooms" value={property.beds} />
            <DetailItem icon={BathIcon} label="Bathrooms" value={property.baths} />
            <DetailItem
              icon={RulerIcon}
              label="Square Footage"
              value={property.sqft ? `${property.sqft} sq ft` : null}
            />
            <DetailItem icon={MapIcon} label="Lot Size" value={property.lotSize} />
            <DetailItem icon={CalendarDaysIcon} label="Year Built" value={property.yearBuilt} />
            <DetailItem icon={CarIcon} label="Garage Spaces" value={property.garageSpaces} />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-md mb-1">Key Features & Condition:</h4>
            <p className="text-sm text-muted-foreground">{property.featuresOrCondition || "N/A"}</p>

            {property.roomDimensions && property.roomDimensions.length > 0 && (
              <div>
                <h4 className="font-semibold text-md mt-3 mb-1">
                  <ListChecksIcon className="inline h-4 w-4 mr-1" />
                  Room Dimensions:
                </h4>
                <ul className="list-disc list-inside pl-1 text-sm space-y-0.5">
                  {property.roomDimensions.map((room) => (
                    <li key={room.name}>
                      {room.name}: {room.dimensions}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {((property.renovations && property.renovations.length > 0) ||
          (property.certificates && property.certificates.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {property.renovations && property.renovations.length > 0 && (
              <div>
                <h4 className="font-semibold text-md mb-1">
                  <WrenchIcon className="inline h-4 w-4 mr-1" />
                  Recent Renovations:
                </h4>
                <ul className="list-disc list-inside pl-1 text-sm space-y-0.5">
                  {property.renovations.map((reno) => (
                    <li key={reno}>{reno}</li>
                  ))}
                </ul>
              </div>
            )}
            {property.certificates && property.certificates.length > 0 && (
              <div>
                <h4 className="font-semibold text-md mb-1">
                  <AwardIcon className="inline h-4 w-4 mr-1" />
                  Certificates:
                </h4>
                <ul className="list-disc list-inside pl-1 text-sm space-y-0.5">
                  {property.certificates.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {property.keyPhotos && property.keyPhotos.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-md mb-2">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Key Photos:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.keyPhotos.map((photoUrl, index) => (
                <img
                  key={index}
                  src={photoUrl || "/placeholder.svg"}
                  alt={`Property photo ${index + 1}`}
                  className="rounded-md object-cover aspect-video"
                />
              ))}
            </div>
          </div>
        )}

        {property.floorPlanUrl && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-md mb-2">
              <HomeIcon className="inline h-4 w-4 mr-1" />
              Floor Plan:
            </h4>
            <img
              src={property.floorPlanUrl || "/placeholder.svg"}
              alt="Floor Plan"
              className="rounded-md border max-w-full h-auto"
            />
          </div>
        )}

        {property.lat && property.lng && apiKey && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-md mb-2">
              <MapIcon className="inline h-4 w-4 mr-1" />
              Location:
            </h4>
            <CmaReportMap subjectProperty={property} comparableProperties={[]} apiKey={apiKey} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

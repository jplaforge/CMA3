export interface PointOfInterest {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
}

export interface BuyerCriteria {
  priceRange: { min: string; max: string }
  beds: string
  baths: string
  sqft: string
  mustHaveFeatures: string
  pointsOfInterest: PointOfInterest[]
}

export interface ListingProperty {
  id: string
  address: string
  listingUrl?: string
  imageUrl?: string
  askingPrice: string
  propertyType: string
  beds: string
  baths: string
  sqft: string
  yearBuilt: string
  notes: string
  lat?: number
  lng?: number
  garageSpaces?: string
  levels?: string
  lotSize?: string
}

export interface BuyerReportState {
  clientName: string
  preparedDate: string
  preparedBy: string
  realtorAgency: string
  realtorPhoto?: string
  realtorLat?: number
  realtorLng?: number
  primaryColor?: string
  secondaryColor?: string
  buyerCriteria: BuyerCriteria
  listings: ListingProperty[]
  realtorNotes: string
}

export const createEmptyListing = (): ListingProperty => ({
  id: Date.now().toString(),
  listingUrl: "",
  address: "",
  imageUrl: "",
  askingPrice: "",
  propertyType: "",
  beds: "",
  baths: "",
  sqft: "",
  yearBuilt: "",
  notes: "",
  lat: undefined,
  lng: undefined,
  garageSpaces: "",
  levels: "",
  lotSize: "",
})

export const createEmptyPOI = (): PointOfInterest => ({
  id: Date.now().toString(),
  name: "",
  address: "",
  lat: undefined,
  lng: undefined,
})

export const initialBuyerReportState: BuyerReportState = {
  clientName: "",
  preparedDate: new Date().toLocaleDateString("en-CA"),
  preparedBy: "",
  realtorAgency: "",
  realtorPhoto: "",
  realtorLat: undefined,
  realtorLng: undefined,
  buyerCriteria: {
    priceRange: { min: "", max: "" },
    beds: "",
    baths: "",
    sqft: "",
    mustHaveFeatures: "",
    pointsOfInterest: [],
  },
  listings: [createEmptyListing()],
  realtorNotes: "",
}

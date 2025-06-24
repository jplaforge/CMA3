export interface PointOfInterest {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
}

export interface BuyerCriteria {
  priceRange: { min: string; max: string }
  beds: { min: string; max: string }
  baths: { min: string; max: string }
  sqft: { min: string; max: string }
  mustHaveFeatures: string
  pointsOfInterest: PointOfInterest[]
}

export interface ListingProperty {
  id: string
  address: string // This will be prioritized by AI if available, or og:title
  listingUrl?: string
  imageUrl?: string // Primary image from og:image or AI
  askingPrice: string
  propertyType: string // e.g., Townhouse, Single Family
  beds: string
  baths: string
  sqft: string
  yearBuilt: string
  notes: string // General description or AI extracted summary
  lat?: number
  lng?: number
  garageSpaces?: string // e.g., "2"
  levels?: string // e.g., "2" or "Split-level"
  lotSize?: string // e.g., "0.25 acres" or "10,000 sqft"
  // Potentially add: imageCount, threeDTourUrl, openHouseStatus
}

export interface BuyerReportState {
  clientName: string
  preparedDate: string
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
  buyerCriteria: {
    priceRange: { min: "", max: "" },
    beds: { min: "", max: "" },
    baths: { min: "", max: "" },
    sqft: { min: "", max: "" },
    mustHaveFeatures: "",
    pointsOfInterest: [],
  },
  listings: [createEmptyListing()],
  realtorNotes: "",
}

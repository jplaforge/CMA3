export interface PropertyInput {
  id: string
  address: string
  fullAddress?: string
  propertyType: string
  beds: string
  baths: string
  sqft: string
  lotSize: string
  yearBuilt: string
  garageSpaces: string
  featuresOrCondition: string
  listingUrl?: string

  // Fetched / computed
  fetchedTitle?: string
  fetchedImageUrl?: string
  fetchedPrice?: string
  lat?: number
  lng?: number
}

export const createEmptyPropertyInput = (): PropertyInput => ({
  id: Date.now().toString(),
  address: "",
  fullAddress: undefined,
  propertyType: "",
  beds: "",
  baths: "",
  sqft: "",
  lotSize: "",
  yearBuilt: "",
  garageSpaces: "",
  featuresOrCondition: "",
  listingUrl: "",
  fetchedTitle: "",
  fetchedImageUrl: "",
  fetchedPrice: "",
  lat: undefined,
  lng: undefined,
})

/*  Back-compat helper for any existing imports  */
export const createEmptyComparable = createEmptyPropertyInput

export interface CmaReportDataState {
  reportTitle: string
  clientName: string
  preparedDate: string
  subjectProperty: PropertyInput
  comparableProperties: PropertyInput[]
  generalNotes: string
  priceAdjustmentNotes: string
  suggestedPriceRange: {
    low: string
    high: string
  }
}

export const initialCmaReportData: CmaReportDataState = {
  reportTitle: "Comparative Market Analysis",
  clientName: "",
  preparedDate: new Date().toISOString().split("T")[0],
  subjectProperty: { ...createEmptyPropertyInput(), propertyType: "Single Family" },
  comparableProperties: [createEmptyPropertyInput()],
  generalNotes: "",
  priceAdjustmentNotes: "",
  suggestedPriceRange: { low: "", high: "" },
}

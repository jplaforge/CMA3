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
  fetchedTitle?: string
  fetchedImageUrl?: string
  fetchedPrice?: string // For subject property, this could be current list price or estimate; for comps, it's sale price
  salePrice?: string // Explicitly for sold comparables if different from fetchedPrice
  lat?: number
  lng?: number
  roomDimensions?: Array<{ name: string; dimensions: string }>
  renovations?: string[]
  certificates?: string[] // e.g., energy efficiency
  keyPhotos?: string[] // URLs
  floorPlanUrl?: string
}

export const createEmptyPropertyInput = (): PropertyInput => ({
  id: Date.now().toString(),
  address: "",
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
  roomDimensions: [],
  renovations: [],
  certificates: [],
  keyPhotos: [],
  floorPlanUrl: "",
})

export interface MarketTrendData {
  medianPrice?: string
  daysOnMarket?: string
  interestRates?: string
  employmentRate?: string
  absorptionRate?: string
  listToSaleRatio?: string
  competitionLevel?: string // e.g., "High", "Medium", "Low"
}

export interface ComparableProperty extends PropertyInput {
  status: "Sold" | "Active" | "Expired/Withdrawn"
  saleDate?: string // For sold comps
  reasonForWithdrawal?: string // For expired/withdrawn
  pricePerSqFt?: string
  differencesToSubject?: string // Summary of key differences
}

export interface AdjustmentItem {
  feature: string // e.g., "Size (sqft)", "Condition", "Garage"
  subjectValue: string | number
  compValue: string | number
  adjustment: number // Monetary adjustment
}

export interface PriceScenario {
  name: "Aggressive" | "Balanced" | "Top of Market"
  price: string
  notes: string
}

export interface ListingStrategy {
  priceNarrative?: string
  keySellingPoints?: string[]
  marketingPlan?: {
    mls?: boolean
    socialMedia?: boolean
    openHouse?: boolean
    videoTour?: boolean
    other?: string[]
  }
}

export interface NetProceedsItem {
  description: string
  amount: number
  type: "income" | "expense"
}

export interface NextStepItem {
  task: string
  completed: boolean
  deadline?: string
}

export interface AppendixItem {
  name: string
  urlOrContent: string // URL to document or brief text content
}

export interface CmaReportDataState {
  // Existing fields
  reportTitle: string
  clientName: string
  preparedDate: string
  preparedBy: string
  realtorAgency: string
  subjectProperty: PropertyInput
  comparableProperties: ComparableProperty[] // Updated to include status and more details
  generalNotes: string // Can be part of Analysis & Recommended Price Range
  priceAdjustmentNotes: string // Can be part of Adjustments section
  suggestedPriceRange: {
    // Can be part of Analysis & Recommended Price Range
    low: string
    high: string
  }

  // New fields for Seller's CMA
  introductionLetter?: {
    overview?: string
    benefits?: string
    agentContactInfo?: string // Could also use preparedBy/realtorAgency
  }
  marketContext?: MarketTrendData
  // comparableProperties will store sold, active, expired based on their 'status' field
  adjustmentsGrid?: AdjustmentItem[][] // Array per comparable
  adjustedPrices?: Array<{ compId: string; adjustedPrice: string }>
  priceScenarios?: PriceScenario[]
  listingStrategy?: ListingStrategy
  netProceedsProjection?: {
    estimatedSalePrice?: number
    items: NetProceedsItem[]
    estimatedNetToSeller?: number
  }
  nextStepsTimeline?: NextStepItem[]
  appendices?: AppendixItem[]
}

export const initialCmaReportData: CmaReportDataState = {
  reportTitle: "Comparative Market Analysis",
  clientName: "",
  preparedDate: new Date().toISOString().split("T")[0],
  preparedBy: "",
  realtorAgency: "",
  subjectProperty: createEmptyPropertyInput(),
  comparableProperties: [],
  generalNotes: "",
  priceAdjustmentNotes: "",
  suggestedPriceRange: { low: "", high: "" },

  introductionLetter: {
    overview:
      "This Comparative Market Analysis (CMA) has been prepared to help you understand the current market value of your property. It includes an analysis of recently sold properties, current listings, and market trends.",
    benefits:
      "A CMA is a crucial tool for pricing your property competitively to attract qualified buyers and achieve a timely sale at the best possible price.",
    agentContactInfo: "Please feel free to contact me with any questions.",
  },
  marketContext: {
    medianPrice: "N/A",
    daysOnMarket: "N/A",
    interestRates: "N/A",
    employmentRate: "N/A",
  },
  adjustmentsGrid: [],
  adjustedPrices: [],
  priceScenarios: [{ name: "Balanced", price: "N/A", notes: "A balanced approach to attract a wide range of buyers." }],
  listingStrategy: {
    priceNarrative: "Positioned competitively based on recent sales and current market conditions.",
    keySellingPoints: [],
    marketingPlan: { mls: true, socialMedia: true, openHouse: false, videoTour: false },
  },
  netProceedsProjection: { items: [] },
  nextStepsTimeline: [
    { task: "Sign listing agreement", completed: false },
    { task: "Prepare home for photos/showings", completed: false },
    { task: "Professional photography & videography", completed: false },
    { task: "Go-live on MLS and marketing channels", completed: false },
  ],
  appendices: [],
}

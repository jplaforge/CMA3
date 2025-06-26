import BuyerReportClientPage from "@/components/buyer-report/buyer-report-client-page"

export default function CmaAiGenRoutePage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return <BuyerReportClientPage googleMapsApiKey={googleMapsApiKey} />
}

import BuyerReportClientPage from "@/components/buyer-report/buyer-report-client-page"
import CmaForm from "@/components/cma/cma-form"

interface PageProps {
  searchParams?: { type?: string }
}

export default function CmaAiGenRoutePage({ searchParams }: PageProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const reportType = searchParams?.type === "seller" ? "seller" : "buyer"

  return reportType === "seller" ? (
    <CmaForm googleMapsApiKey={googleMapsApiKey} />
  ) : (
    <BuyerReportClientPage googleMapsApiKey={googleMapsApiKey} />
  )
}

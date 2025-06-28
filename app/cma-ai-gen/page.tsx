import BuyerReportClientPage from "@/components/buyer-report/buyer-report-client-page"
import CmaForm from "@/components/cma/cma-form"

interface PageProps {
  searchParams?: { type?: string }
}

export default function CmaAiGenRoutePage({ searchParams }: PageProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const reportType = searchParams?.type === "seller" ? "seller" : "buyer"

  const ReportComponent =
    reportType === "seller" ? CmaForm : BuyerReportClientPage

  return (
    <div
      className="flex min-h-screen flex-col font-sans text-[#1E404B]"
      style={{ background: "linear-gradient(to bottom, #F1F8FD, #EFF7FC)" }}
    >
      <ReportComponent googleMapsApiKey={googleMapsApiKey} />
    </div>
  )
}

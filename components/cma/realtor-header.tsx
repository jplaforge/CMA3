import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getContrastingTextColor } from "@/lib/utils"
import type { CmaReportDataState } from "@/lib/cma-types"

interface RealtorHeaderProps {
  reportData: CmaReportDataState
}

export default function RealtorHeader({ reportData }: RealtorHeaderProps) {
  const { preparedBy, realtorAgency, realtorPhoto, primaryColor, secondaryColor } = reportData

  const bgColor = primaryColor || "transparent"
  const textColor = secondaryColor || getContrastingTextColor(primaryColor)

  return (
    <div className="flex items-center gap-4 rounded-md mb-4 p-4" style={{ backgroundColor: bgColor, color: textColor }}>
      <Avatar className="h-16 w-16">
        <AvatarImage src={realtorPhoto || "/placeholder-user.jpg"} alt={preparedBy || "Realtor"} />
        <AvatarFallback>{preparedBy ? preparedBy.charAt(0) : "R"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{preparedBy || "Realtor Name"}</span>
        <span className="text-sm">{realtorAgency || "Agency"}</span>
      </div>
    </div>
  )
}

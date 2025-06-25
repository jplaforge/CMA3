import { redirect } from "next/navigation"

export default function RootPage() {
  // send visitors automatically to /home
  redirect("/home")
}

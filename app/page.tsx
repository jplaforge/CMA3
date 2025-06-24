import { redirect } from 'next/navigation'

export default function Home() {
  // send visitors automatically to /buyer-report
  redirect('/buyer-report')
}

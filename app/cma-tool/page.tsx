import CmaForm from "@/components/cma/cma-form"

export default async function CmaToolRoutePage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Comparative Market Analysis (CMA) Tool</h1>
        <p className="text-muted-foreground">
          Generate professional CMA reports by inputting property details and comparables.
        </p>
      </header>
      {googleMapsApiKey ? (
        <CmaForm
          googleMapsApiKey={googleMapsApiKey}
          // If CmaForm needs initialData, it would be passed here:
          // initialData={someFetchedOrInitialData}
        />
      ) : (
        <p className="text-red-500">Google Maps API Key is missing.</p>
      )}
    </div>
  )
}

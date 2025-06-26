"use client"

import { useRef } from "react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"

interface PlaceAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: string, place: google.maps.places.PlaceResult) => void
  onBlur?: (value: string) => void
  placeholder?: string
  apiKey?: string
}

export default function PlaceAutocompleteInput({ value, onChange, onSelect, onBlur, placeholder, apiKey }: PlaceAutocompleteInputProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey || "", libraries: ["places"] })
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (place && place.formatted_address) {
      onSelect(place.formatted_address, place)
    }
  }

  if (!isLoaded) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => onBlur?.(value)} placeholder={placeholder} />
  }

  return (
    <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => onBlur?.(value)} placeholder={placeholder} />
    </Autocomplete>
  )
}

import { createContext, useContext } from 'react'
import type { Listing } from '../types/listing'

interface SavedListingsContextValue {
  savedListings: Listing[]
  savedCount: number
  saveListing: (listing: Listing) => void
  removeListing: (listing: Listing) => void
  isSaved: (listing: Listing) => boolean
}

export const SavedListingsContext =
  createContext<SavedListingsContextValue | undefined>(undefined)

export function useSavedListings() {
  const context = useContext(SavedListingsContext)

  if (context === undefined) {
    throw new Error(
      'useSavedListings must be used inside SavedListingsProvider'
    )
  }

  return context
}
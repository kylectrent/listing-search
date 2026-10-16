import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Listing } from '../types/listing'
import { SavedListingsContext } from './SavedListingsContext'

const SAVED_LISTINGS_KEY = 'listing-search:saved-listings'

export function SavedListingsProvider({
  children
}: {
  children: ReactNode
}) {
  const [savedListings, setSavedListings] = useState<Listing[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_LISTINGS_KEY)

      if (stored === null) {
        return []
      }

      const parsed: unknown = JSON.parse(stored)

      return Array.isArray(parsed) ? (parsed as Listing[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        SAVED_LISTINGS_KEY,
        JSON.stringify(savedListings)
      )
    } catch {
      console.error('Could not persist saved properties')
    }
  }, [savedListings])

  function isSaved(listing: Listing) {
    return savedListings.some(
      (saved) =>
        saved.source === listing.source &&
        saved.id === listing.id
    )
  }

  function saveListing(listing: Listing) {
    setSavedListings((previous) => {
      const alreadySaved = previous.some(
        (saved) =>
          saved.source === listing.source &&
          saved.id === listing.id
      )

      return alreadySaved ? previous : [...previous, listing]
    })
  }

  function removeListing(listing: Listing) {
    setSavedListings((previous) =>
      previous.filter(
        (saved) =>
          !(saved.source === listing.source && saved.id === listing.id)
      )
    )
  }

  return (
    <SavedListingsContext.Provider
      value={{
        savedListings,
        savedCount: savedListings.length,
        saveListing,
        removeListing,
        isSaved
      }}
    >
      {children}
    </SavedListingsContext.Provider>
  )
}
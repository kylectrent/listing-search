import { useEffect, useState } from 'react'
import './App.css'
import type { Listing, ListingSearchParams } from './types/listing'
import { useListingSearch } from './hooks/useListingSearch'

const SAVED_LISTINGS_KEY = 'listing-search:saved-listings'

function App() {
  const [searchParams, setSearchParams] = useState<ListingSearchParams>({
    page: 0,
    pageSize: 3
  })

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

  const { data, isPending, isFetching, isError, error } = useListingSearch(searchParams);

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

  return (
    <>
      <h1>Listing Search</h1>

      {isPending && <p role='status'>Loading listings...</p>}

      {isError && <p role='alert'>{error.message}</p>}

      {data && (
        <>
          {isFetching && (
            <p role='status'> Updating listings...</p>
          )}

          <p>{data.totalElements} listings found</p>

          <ul>
            {data.items.map(({ listing, relevanceScore }) => (
              <li key={JSON.stringify([listing.source, listing.id])}>
                {listing.address}
                {'--$'}
                {listing.price}
                {'--'}
                {listing.bedrooms} bedrooms
                {'--'}
                {listing.bathrooms} bathrooms
                {'-- Score: '}
                {relevanceScore.toFixed(2)}
                <button
                  type='button'
                  disabled={isSaved(listing)}
                  onClick={() => saveListing(listing)}
                >
                  {isSaved(listing) ? 'Saved' : 'Save'}
                </button>
              </li>
            )
            )}
          </ul>

          <button
            type='button'
            disabled={data.page === 0}
            onClick={() => setSearchParams((previous) => ({
              ...previous,
              page: previous.page - 1
            }))}
          >
            Previous
          </button>

          <button
            type='button'
            disabled={data.page + 1 >= data.totalPages}
            onClick={() => setSearchParams((previous) => ({
              ...previous,
              page: previous.page + 1
            }))}
          >
            Next
          </button>


        </>
      )

      }

      <section aria-labelledby='saved-properties-heading'>
        <h2 id='saved-properties-heading'>Saved properties</h2>

        {savedListings.length === 0 ? (
          <p>No saved properties yet.</p>
        ) : (
          <ul>
            {savedListings.map((listing) => (
              <li key={JSON.stringify([listing.source, listing.id])}>
                {listing.address}
                {' — $'}
                {listing.price.toLocaleString()}

                <button
                  type='button'
                  onClick={() => removeListing(listing)}
                  aria-label={`Remove ${listing.address} from saved properties`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default App

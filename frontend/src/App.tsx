import { useState } from 'react'
import './App.css'
import type { ListingSearchParams } from './types/listing'
import { useListingSearch } from './hooks/useListingSearch'
import { useSavedListings } from './context/SavedListingsContext'
import { ListingResults } from './components/ListingResults'
import SearchForm from './components/SearchForm'

function App() {
  const [searchParams, setSearchParams] = useState<ListingSearchParams>({
    page: 0,
    pageSize: 3
  })

  const {
    savedListings,
    removeListing,
  } = useSavedListings()

  const { data, isPending, isFetching, isError, error } = useListingSearch(searchParams);

  const onSearch = (params: ListingSearchParams): void => {
    setSearchParams(params);
  }


  return (
    <>
      <h1>Listing Search</h1>

      <SearchForm onSearch={onSearch} />

      {isPending && <p role='status'>Loading listings...</p>}

      {isError && <p role='alert'>{error.message}</p>}

      {data && (
        <>
          {isFetching && (
            <p role='status'> Updating listings...</p>
          )}

          <p>{data.totalElements} listings found</p>

          <ListingResults items={data.items} />

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

import { useState } from 'react'
import './App.css'
import type { ListingSearchParams } from './types/listing'
import { useListingSearch } from './hooks/useListingSearch'

function App() {
  const [searchParams, setSearchParams] = useState<ListingSearchParams>({
    page: 0,
    pageSize: 3
  })

  const { data, isPending, isFetching, isError, error } = useListingSearch(searchParams);

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
    </>
  )
}

export default App

import { useSavedListings } from '../context/SavedListingsContext'
import type { ScoredListing } from '../types/listing'

interface ListingResultsProps {
  items: ScoredListing[]
}

export function ListingResults({
  items,
}: ListingResultsProps) {

  const { 
      saveListing,
      isSaved
    } = useSavedListings()

  return (
    <ul className="listing-results">
      {items.map(({ listing, relevanceScore }) => (
        <li key={JSON.stringify([listing.source, listing.id])}>
          <strong>{listing.address}</strong>
          {' — '}{listing.city}
          {' — $'}
          {listing.price.toLocaleString()}
          {' — '}
          {listing.bedrooms} bedrooms
          {' — '}
          {listing.bathrooms} bathrooms
          {' — Score: '}
          {relevanceScore.toFixed(2)}

          <p>{listing.description}</p>
          <p>Listed {listing.listedDate}</p>

          <button
            type='button'
            disabled={isSaved(listing)}
            onClick={() => saveListing(listing)}
          >
            {isSaved(listing) ? 'Saved' : 'Save'}
          </button>
        </li>
      ))}
    </ul>
  )
}
import type { Listing, ScoredListing } from '../types/listing'

interface ListingResultsProps {
  items: ScoredListing[]
  onSave: (listing: Listing) => void
  isSaved: (listing: Listing) => boolean
}

export function ListingResults({
  items,
  onSave,
  isSaved
}: ListingResultsProps) {
  return (
    <ul>
      {items.map(({ listing, relevanceScore }) => (
        <li key={JSON.stringify([listing.source, listing.id])}>
          {listing.address}
          {' — $'}
          {listing.price.toLocaleString()}
          {' — '}
          {listing.bedrooms} bedrooms
          {' — '}
          {listing.bathrooms} bathrooms
          {' — Score: '}
          {relevanceScore.toFixed(2)}

          <button
            type='button'
            disabled={isSaved(listing)}
            onClick={() => onSave(listing)}
          >
            {isSaved(listing) ? 'Saved' : 'Save'}
          </button>
        </li>
      ))}
    </ul>
  )
}
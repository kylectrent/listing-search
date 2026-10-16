export interface Listing {
    id: string
    source: string
    address: string
    city: string
    state: string
    zip: string
    price: number
    bedrooms: number
    bathrooms: number
    sqft: number
    latitude: number
    longitude: number
    listedDate: string
    status: 'active' | 'pending' | 'sold'
    description: string
}

export interface ScoredListing {
    listing: Listing
    relevanceScore: number
}

export interface ListingSearchResponse {
    items: ScoredListing[]
    page: number
    pageSize: number
    totalElements: number
    totalPages: number
}

export interface ListingSearchParams {
    minPrice?: number
    maxPrice?: number
    minBedrooms?: number
    city?: string
    keyword?: string
    targetBudget?: number
    page: number
    pageSize: number
}
import type { ListingSearchParams, ListingSearchResponse } from "../types/listing";


export async function fetchListings(
    params: ListingSearchParams,
    signal: AbortSignal
): Promise<ListingSearchResponse> {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
            query.set(key, String(value));
        }
    }

    const response = await fetch(`api/listings?${query.toString()}`, {signal});

    if (!response.ok) {
        throw new Error(`Unable to load listings (${response.status})`);
    }

    return response.json();
}
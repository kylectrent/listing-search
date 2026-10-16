import { useQuery } from "@tanstack/react-query";
import type { ListingSearchParams } from "../types/listing";
import { fetchListings } from "../api/listings";


export function useListingSearch(params: ListingSearchParams) {
    return useQuery({
        queryKey: ['listings', params],
        queryFn: ({signal}) => fetchListings(params, signal),
        staleTime: 0,
        retry: false
    })
}
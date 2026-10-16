import { useEffect, useState } from "react";
import type { ListingSearchParams, ListingSearchResponse } from "../types/listing";
import { fetchListings } from "../api/listings";


export async function useListingSearchPractice(params: ListingSearchParams, signal: AbortSignal) {
    const [data, setData] = useState<ListingSearchResponse | null>(null);
    const [loading, setLoading] = useState<boolean | null>(false);
    const [error, setError] = useState<string | null>(null);

   // const {minPrice, maxPrice, minBedrooms, city, keyword, targetBudget, page, pageSize} = params;

    useEffect(() => {
        const controller = new AbortController();

        let active = true;

        async function load() {
            setLoading(true);
            setData(null);
            setError(null);

            try {
                const result = await fetchListings(params, controller.signal)

                if (active) {
                    setData(result);
                }
            } catch (error) {
                if(active) {
                    setError(error instanceof Error ? error.message : 'error')
                }
            } finally {
                if(active) {
                    setLoading(false);
                }
            }
        }

        void load()

        return () => {
            active = false;
            controller.abort;
        }
    })

    return {data, loading, error}
}
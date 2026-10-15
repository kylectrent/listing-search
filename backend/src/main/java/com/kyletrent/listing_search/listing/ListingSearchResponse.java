package com.kyletrent.listing_search.listing;

import java.util.List;

public record ListingSearchResponse(
    List<ScoredListing> items,
    int page,
    int pageSize,
    long totalElements,
    int totalPages
) {
    
}

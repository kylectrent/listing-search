package com.kyletrent.listing_search.listing;

public record ScoredListing(
    Listing listing,
    double relevanceScore
) {
    
}

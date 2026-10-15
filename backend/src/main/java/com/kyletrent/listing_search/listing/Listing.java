package com.kyletrent.listing_search.listing;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Listing(
        String id,
        String source,
        String address,
        String city,
        String state,
        String zip,
        BigDecimal price,
        int bedrooms,
        double bathrooms,
        int sqft,
        double latitude,
        double longitude,
        LocalDate listedDate,
        String status,
        String description

) {

}

package com.kyletrent.listing_search.listing;

import java.math.BigDecimal;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ListingSearchRequest(
        @DecimalMin("0") BigDecimal minPrice,
        @DecimalMin("0") BigDecimal maxPrice,
        @Min(0) Integer minBedrooms,
        String city,
        String keyword,
        @DecimalMin(value = "0", inclusive = false) BigDecimal targetBudget,
        @Min(0) Integer page,
        @Min(1) @Max(100) Integer pageSize) {
    
    public ListingSearchRequest {
        page = page == null ? 0 : page;
        pageSize = pageSize == null ? 10 : pageSize;

        city = normalize(city);
        keyword = normalize(keyword);
    }

    @AssertTrue(message = "minPrice must not exceed maxPrice")
    public boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <=0;
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

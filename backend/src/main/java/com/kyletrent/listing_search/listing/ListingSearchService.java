package com.kyletrent.listing_search.listing;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

@Service
public class ListingSearchService {

    private final ListingDataLoader dataLoader;
    private final Clock clock;

    public ListingSearchService(ListingDataLoader dataLoader, Clock clock) {
        this.dataLoader = dataLoader;
        this.clock = clock;
    }

    public ListingSearchResponse search(ListingSearchRequest request) {
        // 1. Get the loaded listings.
        // 2. Apply all supplied filters.
        // 3. Calculate a relevance score for each match.
        // 4. Sort by score, with deterministic tie breakers.
        // 5. Take the requested page.
        // 6. Return the results and pagination totals.

        LocalDate today = LocalDate.now(clock);

        Comparator<ScoredListing> ranking = Comparator.comparingDouble(ScoredListing::relevanceScore)
                .reversed()
                .thenComparing(
                        item -> item.listing().listedDate(),
                        Comparator.reverseOrder())
                .thenComparing(item -> item.listing().source())
                .thenComparing(item -> item.listing().id());

        List<ScoredListing> ranked = dataLoader.getListings()
                .stream()
                .filter(listing -> matches(listing, request))
                .map(listing -> new ScoredListing(
                        listing,
                        calculateScore(
                                listing,
                                request.targetBudget(),
                                today)))
                .sorted(ranking)
                .toList();

        int page = request.page();
        int pageSize = request.pageSize();
        long totalElements = ranked.size();

        int totalPages = (int) ((totalElements + pageSize - 1) / pageSize);

        List<ScoredListing> items = ranked.stream()
                .skip((long) page * pageSize)
                .limit(pageSize)
                .toList();

        return new ListingSearchResponse(
                items,
                page,
                pageSize,
                totalElements,
                totalPages);

    }

    private boolean matches(
            Listing listing,
            ListingSearchRequest request) {

        if (request.minPrice() != null
                && listing.price().compareTo(request.minPrice()) < 0) {
            return false;
        }

        if (request.maxPrice() != null
                && listing.price().compareTo(request.maxPrice()) > 0) {
            return false;
        }

        if (request.minBedrooms() != null
                && listing.bedrooms() < request.minBedrooms()) {
            return false;
        }

        if (request.city() != null
                && !listing.city().trim()
                        .equalsIgnoreCase(request.city())) {
            return false;
        }

        if (request.keyword() != null
                && !listing.description()
                        .toLowerCase(Locale.ROOT)
                        .contains(
                                request.keyword().toLowerCase(Locale.ROOT))) {
            return false;
        }

        return true;
    }

    private double calculateScore(
            Listing listing,
            BigDecimal targetBudget,
            LocalDate today) {

        long ageDays = Math.max(
                0,
                ChronoUnit.DAYS.between(listing.listedDate(), today));

        double recency = 1.0 / (1.0 + ageDays / 30.0);

        if (targetBudget == null) {
            return 100.0 * recency;
        }

        double relativeDifference = listing.price()
                .subtract(targetBudget)
                .abs()
                .divide(targetBudget, MathContext.DECIMAL64)
                .doubleValue();

        double budgetFit = Math.max(
                0.0,
                1.0 - relativeDifference);

        return 100.0 * (0.7 * budgetFit + 0.3 * recency);
    }
}

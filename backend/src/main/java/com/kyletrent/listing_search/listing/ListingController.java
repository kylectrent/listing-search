package com.kyletrent.listing_search.listing;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingSearchService searchService;

    public ListingController(ListingSearchService searchSerice) {
        this.searchService = searchSerice;
    }

    @GetMapping
    public ListingSearchResponse search(
        @Valid @ModelAttribute ListingSearchRequest request) {
        return searchService.search(request);
    }
    
    
}

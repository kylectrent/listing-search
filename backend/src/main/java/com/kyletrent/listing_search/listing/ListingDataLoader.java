package com.kyletrent.listing_search.listing;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Component
public class ListingDataLoader {

    private final List<Listing> listings;

    public ListingDataLoader(JsonMapper jsonMapper) {
        ClassPathResource resource = new ClassPathResource ("data/sample_listings.json");

        try (InputStream input = resource.getInputStream()) {
            List<Listing> loaded = jsonMapper.readValue(
                input,
                new TypeReference<List<Listing>>() {}
            );

            this.listings = List.copyOf(loaded);
        } catch (IOException | RuntimeException exception) {
            throw new IllegalStateException(
                "Failed to load data/sample_listings.json",
                exception
            );
        }
    }

    public List<Listing> getListings() {
        return listings;
    }
    
}

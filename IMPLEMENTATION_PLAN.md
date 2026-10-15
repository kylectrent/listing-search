# Listing search implementation plan

## Scope and existing project

Build the assessment's listing search application in the existing monorepo:

- `backend/`: Spring Boot, Maven, Java 21; web MVC and validation dependencies already present.
- `frontend/`: React, TypeScript, Vite; currently the generated starter screen.
- Data: copy the supplied `sample_listings.json` into `backend/src/main/resources/data/sample_listings.json` during implementation.
- No database, JPA entities, repository layer, authentication, or elaborate styling.

The assessment documents supply product requirements; the user's request determines the stack and database-free architecture. Submission and recruiter instructions are context, not actions to perform. This document plans implementation; application code has not yet been changed.

## 1. Establish the API contract and behavior

Use `GET /api/listings` with optional query parameters:

| Parameter | Behavior |
| --- | --- |
| `minPrice`, `maxPrice` | Inclusive price bounds; nonnegative values |
| `minBedrooms` | Inclusive minimum; nonnegative integer |
| `city` | Trimmed, case-insensitive exact city match |
| `keyword` | Trimmed, case-insensitive substring match against description |
| `targetBudget` | Positive budget used for ranking; optional |
| `page` | Zero-based page index, default 0; must be nonnegative |
| `pageSize` | Default 10; integer from 1 through 100 |

Combine filters with AND. Treat blank city/keyword as absent. When budget is absent, rank by recency alone. Retain all statuses and source records because the handout does not require active-only filtering or deduplication. Use `(source, id)` as listing identity, including React keys.

Return `{ items, page, pageSize, totalElements, totalPages }`. Each item includes the listing fields and a numeric `relevanceScore`. Metadata counts filtered results before pagination. An unknown city or other valid search with no matches returns HTTP 200 with empty items and zero totals. A page beyond the last page returns empty items while preserving actual totals; the UI disables navigation beyond the last page.

Invalid values, malformed numbers, and `minPrice > maxPrice` return HTTP 400 with a consistent response such as `{ code: "INVALID_SEARCH", message, fieldErrors }`. Parameter defaults and validation must apply to direct API calls, not just UI submissions.

## 2. Implement the backend

Use a small package under `com.kyletrent.listing_search`, with constructor injection:

| File | Responsibility |
| --- | --- |
| `Listing.java` | Plain Java record matching JSON fields; `BigDecimal` for price and `LocalDate` for listed date; no persistence annotations |
| `ListingDataLoader.java` | Read the classpath resource with Spring's configured JSON mapper once at startup; expose an immutable list and fail clearly on missing/malformed data |
| `ListingSearchRequest.java` | Typed query parameters, defaults, field validation, and price-range validation |
| `ListingSearchService.java` | Filter, calculate scores, sort, and paginate the in-memory list |
| `ScoredListing.java`, `ListingSearchResponse.java` | Response records for scored items and pagination metadata |
| `ListingController.java` | Bind/validate the request and delegate to the service |
| `ApiExceptionHandler.java` | Convert validation and parameter-binding failures into consistent HTTP 400 responses |

Keep the controller thin. The service operates on loaded records rather than reading the file for every request. Verify the existing Maven wrapper and Java 21 setup before implementation; retain the generated Spring Boot version unless dependency resolution or compilation demonstrates a problem. Use the JSON APIs supported by that version.

### Proposed relevance scoring

Use a fixed, documented formula, independent of the result set:

```text
ageDays = max(0, days between listedDate and today)
recency = 1 / (1 + ageDays / 30.0)
budgetFit = max(0, 1 - abs(price - targetBudget) / targetBudget)

with targetBudget: score = 100 * (0.7 * budgetFit + 0.3 * recency)
without targetBudget: score = 100 * recency
```

This favors proximity to budget and gradually discounts older listings. Equal deviations above and below budget receive equal budget scores; `maxPrice` is how a user imposes a strict affordability limit. The 70/30 weights and 30-day scale are explainable choices, not assessment-prescribed values. Future dates receive the highest recency score.

Inject a `Clock` so tests have a fixed date. Sort by unrounded score descending, then listed date descending, source ascending, and id ascending. Display scores to two decimal places without rounding before sorting. Filter first, score and sort second, paginate last. Use safe pagination arithmetic for large page values.

## 3. Implement the React UI

Replace the starter screen with one search page using native form controls and minimal CSS:

- `types/listing.ts`: listing, response, search parameter, and API error types.
- `api/listings.ts`: build query strings with `URLSearchParams`, call `fetch`, and parse success/error responses.
- `components/SearchForm.tsx`: min/max price, minimum bedrooms, city, description keyword, target budget, and page-size inputs; Search and Reset buttons.
- `components/ListingResults.tsx`: plain table/list with address, city, price, bedrooms, listed date, and relevance score; source can clarify separate source records.
- `components/Pagination.tsx`: total count, current page, Previous and Next controls.
- `App.tsx`: draft form state, submitted search state, current page, loading/error/results state, and orchestration.

Fetch unfiltered page 0 on initial load. Search submits filters and resets page to 0; pagination keeps the submitted filters; changing page size resets page to 0. Reset restores defaults and fetches page 0. Preserve empty numeric inputs as absent rather than converting them to zero. Validate inputs before requesting, while keeping the server authoritative.

Use `AbortController` and effect cleanup to prevent a slower old response from replacing newer results. Provide distinct loading, no-results, validation, and server/network-error messages. Use associated labels and disable invalid pagination actions. Show page numbers to users starting at 1, while sending zero-based indices to the API; display a no-results message instead of “page 1 of 0.”

Configure Vite to proxy `/api` to the local backend on port 8080, keeping browser requests relative. No CORS configuration is needed for this development arrangement. Document that separate production origins would require an explicit hosting/CORS arrangement; deployment is outside this task.

## 4. Verify required behavior

Backend unit tests are the main correctness checks. Cover:

- Each filter alone and combined, inclusive bounds, case handling, and blank strings.
- Unknown city and searches with no matches.
- Budget fit, recency, optional budget, future dates, and deterministic tied-score ordering.
- Missing defaults, negative values, fractional integer inputs, zero budget, invalid numeric strings, inverted price ranges, and invalid page sizes.
- First/last/beyond-last pages, empty datasets, correct totals, and very large page indices.
- Separate records with the same id from different sources.

Use service unit tests with small fixtures and a fixed clock, plus MVC tests proving binding, HTTP 400 errors, and response serialization. Verify that the application can load the supplied classpath dataset.

Add focused frontend interaction tests using Vitest and React Testing Library for form submission, resetting pagination, rendering empty/error states, and page navigation. Avoid tests that merely reproduce the scoring implementation. Run the frontend build and lint, backend tests, and an end-to-end manual smoke check with both applications running.

## 5. Document and finish

Write a root `README.md` with prerequisites, backend/frontend startup commands, test commands, an example API request, the scoring formula, filter semantics, pagination defaults, and the above trade-offs. Include a short demo checklist: unfiltered search, combined filters, budget ranking, pagination, no matches, and invalid inputs.

Implementation order: API records and data loader → scoring/filtering tests and service → controller and HTTP error tests → React API integration and form → results/pagination/states → frontend checks and end-to-end smoke test → README.

Complete when both apps run locally, every required input reaches the API, results are filtered/ranked/paginated by the backend, errors are deliberate, and the required edge cases pass. Leave potential live-interview additions such as deduplication, geographic search, and pet-policy filtering for actual requirements.

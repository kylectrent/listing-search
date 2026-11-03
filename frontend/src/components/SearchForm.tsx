

import { useState, type SubmitEvent } from 'react'
import type { ListingSearchParams } from '../types/listing';

interface SearchFormProps {
    onSearch: (params: ListingSearchParams) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {

    const [filters, setFilters] = useState({
        city: '',
        keyword: '',
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        targetBudget: '',
        pageSize: ''
    });

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        onSearch({
            city: filters.city.trim(),
            pageSize: 3,
            page: 0
        })

    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                City
                <input
                    value={filters.city}
                    onChange={(event) =>
                        setFilters((previous) => ({
                            ...previous,
                            city: event.target.value
                        }))
                    }
                />
            </label>
            <button type="submit">Search</button>
        </form>
    )
}

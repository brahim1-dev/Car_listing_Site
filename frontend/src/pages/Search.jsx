import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  FaCogs,
  FaGasPump,
  FaMapMarkerAlt,
  FaTachometerAlt,
} from "react-icons/fa"
import ListingPostedMeta from "../components/ListingPostedMeta"

const defaultFilters = {
  q: "",
  type: ["Sale", "Rent"],
  offer: false,
  condition: "",
  transmission: "",
  fuelType: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  sort: "newest",
}

const readFilters = (params) => ({
  q: params.get("q") || "",
  type: params.getAll("type").length
    ? params.getAll("type")
    : [...defaultFilters.type],
  offer: params.get("offer") === "true",
  condition: params.get("condition") || "",
  transmission: params.get("transmission") || "",
  fuelType: params.get("fuelType") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  minYear: params.get("minYear") || "",
  maxYear: params.get("maxYear") || "",
  sort: params.get("sort") || "newest",
})

const formatPrice = (price) => Number(price).toLocaleString()
const INITIAL_RESULT_LIMIT = 6

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => readFilters(searchParams))
  const [listings, setListings] = useState([])
  const [showAllResults, setShowAllResults] = useState(false)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isCurrent = true
    const query = searchParams.toString()

    const loadListings = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/listing${query ? `?${query}` : ""}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not search car listings.")
        }
        if (isCurrent) {
          setListings(result.data)
          setCount(result.count)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not search car listings.",
          )
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadListings()
    return () => {
      isCurrent = false
    }
  }, [searchParams])

  const visibleListings = showAllResults
    ? listings
    : listings.slice(0, INITIAL_RESULT_LIMIT)

  const updateFilter = (event) => {
    const { name, value, checked, type } = event.target
    setFilters((current) => {
      if (name === "type") {
        return {
          ...current,
          type: checked
            ? [...current.type, value]
            : current.type.filter((item) => item !== value),
        }
      }
      return { ...current, [name]: type === "checkbox" ? checked : value }
    })
  }

  const submitFilters = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (filters.q.trim()) params.set("q", filters.q.trim())
    filters.type.forEach((type) => params.append("type", type))
    if (filters.offer) params.set("offer", "true")
    for (const field of [
      "condition",
      "transmission",
      "fuelType",
      "minPrice",
      "maxPrice",
      "minYear",
      "maxYear",
    ]) {
      if (filters[field]) params.set(field, filters[field])
    }
    if (filters.sort !== "newest") params.set("sort", filters.sort)
    setSearchParams(params)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    setSearchParams(new URLSearchParams())
  }

  return (
    <main className="search-page">
      <aside className="search-sidebar">
        <form className="search-filters" onSubmit={submitFilters}>
          <div className="search-field search-term-field">
            <label htmlFor="search-term">Search term</label>
            <input
              id="search-term"
              name="q"
              type="search"
              value={filters.q}
              onChange={updateFilter}
              placeholder="Make, model, location..."
              maxLength={100}
            />
          </div>

          <fieldset className="search-filter-group">
            <legend>Type</legend>
            <label className="search-checkbox">
              <input
                type="checkbox"
                name="type"
                value="Sale"
                checked={filters.type.includes("Sale")}
                onChange={updateFilter}
              />
              Sale
            </label>
            <label className="search-checkbox">
              <input
                type="checkbox"
                name="type"
                value="Rent"
                checked={filters.type.includes("Rent")}
                onChange={updateFilter}
              />
              Rent
            </label>
            <label className="search-checkbox">
              <input
                type="checkbox"
                name="offer"
                checked={filters.offer}
                onChange={updateFilter}
              />
              Offer
            </label>
          </fieldset>

          <label className="search-field" htmlFor="search-condition">
            <span>Condition</span>
            <select
              id="search-condition"
              name="condition"
              value={filters.condition}
              onChange={updateFilter}
            >
              <option value="">Any condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>

          <label className="search-field" htmlFor="search-transmission">
            <span>Transmission</span>
            <select
              id="search-transmission"
              name="transmission"
              value={filters.transmission}
              onChange={updateFilter}
            >
              <option value="">Any transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
            </select>
          </label>

          <label className="search-field" htmlFor="search-fuel">
            <span>Fuel type</span>
            <select
              id="search-fuel"
              name="fuelType"
              value={filters.fuelType}
              onChange={updateFilter}
            >
              <option value="">Any fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>

          <fieldset className="search-filter-group search-range-group">
            <legend>Price range</legend>
            <input
              aria-label="Minimum price"
              name="minPrice"
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={updateFilter}
              placeholder="Min"
            />
            <input
              aria-label="Maximum price"
              name="maxPrice"
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={updateFilter}
              placeholder="Max"
            />
          </fieldset>

          <fieldset className="search-filter-group search-range-group">
            <legend>Year</legend>
            <input
              aria-label="Minimum year"
              name="minYear"
              type="number"
              min="1886"
              max={new Date().getFullYear() + 1}
              value={filters.minYear}
              onChange={updateFilter}
              placeholder="From"
            />
            <input
              aria-label="Maximum year"
              name="maxYear"
              type="number"
              min="1886"
              max={new Date().getFullYear() + 1}
              value={filters.maxYear}
              onChange={updateFilter}
              placeholder="To"
            />
          </fieldset>

          <label className="search-field" htmlFor="search-sort">
            <span>Sort by</span>
            <select
              id="search-sort"
              name="sort"
              value={filters.sort}
              onChange={updateFilter}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="year_desc">Year: newest first</option>
              <option value="year_asc">Year: oldest first</option>
            </select>
          </label>

          <div className="search-filter-actions">
            <button className="search-submit" type="submit">Search</button>
            <button className="search-reset" type="button" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        </form>
      </aside>

      <section className="search-results">
        <header className="search-results-heading">
          <div>
            <p className="marketplace-eyebrow">Find your next drive</p>
            <h1>Listing Results</h1>
          </div>
          {!isLoading && <span>{count} result{count === 1 ? "" : "s"}</span>}
        </header>

        {isLoading ? (
          <p className="search-state">Searching listings...</p>
        ) : error ? (
          <p className="search-state search-error" role="alert">{error}</p>
        ) : listings.length === 0 ? (
          <div className="search-empty">
            <h2>No matching cars found</h2>
            <p>Try a different search term or broaden your filters.</p>
            <button type="button" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="search-results-grid">
              {visibleListings.map((listing) => {
                const image = listing.imageURLs?.[0]
                const hasDiscount =
                  listing.offer &&
                  Number(listing.discountPercent) > 0 &&
                  Number(listing.discountPercent) < 100
                const price = hasDiscount
                  ? Number(listing.price) * (1 - Number(listing.discountPercent) / 100)
                  : Number(listing.price)

                return (
                  <Link
                    className="search-result-card"
                    key={listing.id}
                    to={`/listing/${encodeURIComponent(listing.id)}`}
                  >
                    <div className="search-result-image">
                      {image ? (
                        <img src={image} alt={listing.name} loading="lazy" />
                      ) : (
                        <span>No photo available</span>
                      )}
                      {hasDiscount && (
                        <span className="search-result-offer">
                          {listing.discountPercent}% off
                        </span>
                      )}
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-title">
                        <h2>{listing.name}</h2>
                        <span>{listing.type}</span>
                      </div>
                      <ListingPostedMeta listing={listing} className="listing-card-posted-meta" />
                      <p className="search-result-location">
                        <FaMapMarkerAlt aria-hidden="true" />
                        {listing.location}
                      </p>
                      <p className="search-result-description">{listing.description}</p>
                      <strong className="search-result-price">
                        {hasDiscount && <del>{formatPrice(listing.price)}</del>}
                        {formatPrice(price)}
                        {listing.type === "Rent" ? " /month" : ""}
                      </strong>
                      <div className="search-result-specs">
                        <span><FaCogs aria-hidden="true" />{listing.transmission}</span>
                        <span><FaGasPump aria-hidden="true" />{listing.fuelType}</span>
                        <span>
                          <FaTachometerAlt aria-hidden="true" />
                          {Number(listing.mileage).toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            {listings.length > INITIAL_RESULT_LIMIT && (
              <button
                className="search-results-toggle"
                type="button"
                aria-expanded={showAllResults}
                onClick={() => setShowAllResults((isExpanded) => !isExpanded)}
              >
                {showAllResults ? "Show less" : `Show more (${listings.length - INITIAL_RESULT_LIMIT})`}
              </button>
            )}
            {count > listings.length && (
              <p className="search-limit-note">
                Showing the newest {listings.length} of {count} matching listings.
                Add filters to narrow your results.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Search

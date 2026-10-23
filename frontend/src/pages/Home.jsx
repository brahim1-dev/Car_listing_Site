import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const formatPrice = (price) => Number(price).toLocaleString()

const Home = () => {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch("/api/listing")
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not load car listings.")
        }
        setListings(result.data)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load car listings.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [])

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <p className="marketplace-eyebrow">Find your next drive</p>
        <h1>Discover cars for sale and rent</h1>
        <p>Browse local listings and find the right car for your journey.</p>
        <Link to="/create-listing" className="marketplace-create-link">
          List your car
        </Link>
      </section>

      <section className="marketplace-listings">
        <div className="marketplace-section-heading">
          <div>
            <p className="marketplace-eyebrow">The latest arrivals</p>
            <h2>Available cars</h2>
          </div>
          <span>{listings.length} listings</span>
        </div>

        {isLoading ? (
          <p className="marketplace-message">Loading car listings...</p>
        ) : error ? (
          <p className="marketplace-message marketplace-error">{error}</p>
        ) : listings.length === 0 ? (
          <div className="marketplace-empty">
            <h3>No cars listed yet</h3>
            <p>Be the first to add a car for sale or rent.</p>
            <Link to="/create-listing">Create a listing</Link>
          </div>
        ) : (
          <div className="marketplace-grid">
            {listings.map((listing) => {
              const hasDiscount =
                listing.offer &&
                Number(listing.discountPercent) > 0 &&
                Number(listing.discountPercent) < 100
              const discountedPrice = hasDiscount
                ? Number(listing.price) * (1 - Number(listing.discountPercent) / 100)
                : Number(listing.price)

              return (
                <article className="marketplace-card" key={listing.id}>
                  <div className="marketplace-card-image">
                    {listing.imageURLs?.[0] ? (
                      <img
                        src={listing.imageURLs[0]}
                        alt={listing.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="marketplace-no-image">Car photo unavailable</div>
                    )}
                    <span className="marketplace-type-badge">
                      {listing.type === "Rent" ? "For rent" : "For sale"}
                    </span>
                    {hasDiscount && (
                      <span className="marketplace-offer-badge">
                        {listing.discountPercent}% off
                      </span>
                    )}
                  </div>
                  <div className="marketplace-card-content">
                    <h3>{listing.name}</h3>
                    <p className="marketplace-car-spec">
                      {[listing.year, listing.make, listing.model]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="marketplace-card-footer">
                      <div className="marketplace-price">
                        {hasDiscount && (
                          <del>{formatPrice(listing.price)}</del>
                        )}
                        <strong>{formatPrice(discountedPrice)}</strong>
                        {listing.type === "Rent" && <span>/month</span>}
                      </div>
                      <span className="marketplace-location">{listing.location}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home

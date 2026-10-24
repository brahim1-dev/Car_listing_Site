import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  FaCogs,
  FaGasPump,
  FaMapMarkerAlt,
  FaTachometerAlt,
} from "react-icons/fa"
import { Keyboard, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import ListingPostedMeta from "../components/ListingPostedMeta"

const INITIAL_CARS_LIMIT = 3

const formatPrice = (price) => Number(price).toLocaleString()

const formatListingDate = (dateValue) => {
  const date = new Date(dateValue)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
    : "Recently posted"
}

const getPrice = (listing) => {
  const price = Number(listing.price)
  if (
    listing.offer &&
    Number(listing.discountPercent) > 0 &&
    Number(listing.discountPercent) < 100
  ) {
    return price * (1 - Number(listing.discountPercent) / 100)
  }
  return price
}

const HomeListingCard = ({ listing }) => (
  <Link
    className="home-listing-card"
    to={`/listing/${encodeURIComponent(listing.id)}`}
  >
    <div className="home-listing-image">
      {listing.imageURLs?.[0] ? (
        <img src={listing.imageURLs[0]} alt={listing.name} loading="lazy" />
      ) : (
        <span className="home-listing-no-image">Car photo unavailable</span>
      )}
      <span className="home-listing-date">
        {formatListingDate(listing.createdAt)}
      </span>
      {listing.offer && Number(listing.discountPercent) > 0 && (
        <span className="home-listing-discount">
          {listing.discountPercent}% off
        </span>
      )}
    </div>
    <div className="home-listing-content">
      <h3>{listing.name}</h3>
      <div className="home-listing-location">
        <span>
          <FaMapMarkerAlt aria-hidden="true" />
          {listing.location}
        </span>
        <strong>{listing.type === "Rent" ? "Rent" : "Sale"}</strong>
      </div>
      <p className="home-listing-description">{listing.description}</p>
      <strong className="home-listing-price">
        {listing.offer && Number(listing.discountPercent) > 0 && (
          <del>{formatPrice(listing.price)}</del>
        )}
        {formatPrice(getPrice(listing))}
        {listing.type === "Rent" && <span>/month</span>}
      </strong>
      <div className="home-listing-specs">
        <span><FaCogs aria-hidden="true" />{listing.transmission}</span>
        <span><FaGasPump aria-hidden="true" />{listing.fuelType}</span>
        <span>
          <FaTachometerAlt aria-hidden="true" />
          {Number(listing.mileage).toLocaleString()} km
        </span>
      </div>
      <ListingPostedMeta listing={listing} className="home-listing-poster" />
    </div>
  </Link>
)

const HomeListingSection = ({ title, listings, emptyMessage }) => {
  const [showAll, setShowAll] = useState(false)
  const visibleListings = showAll
    ? listings
    : listings.slice(0, INITIAL_CARS_LIMIT)

  if (!listings.length) {
    return (
      <section className="home-listings-section">
        <div className="home-section-heading">
          <h2>{title}</h2>
        </div>
        <p className="home-section-empty">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="home-listings-section">
      <div className="home-section-heading">
        <h2>{title}</h2>
        <span>{listings.length} {listings.length === 1 ? "car" : "cars"}</span>
      </div>
      <div className="home-listings-grid">
        {visibleListings.map((listing) => (
          <HomeListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {listings.length > INITIAL_CARS_LIMIT && (
        <button
          className="home-show-more"
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((expanded) => !expanded)}
        >
          {showAll ? "Show less" : `Show more ${title.toLowerCase()}`}
        </button>
      )}
    </section>
  )
}

const Home = () => {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isCurrent = true

    const loadListings = async () => {
      try {
        const response = await fetch("/api/listing")
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not load car listings.")
        }
        if (isCurrent) setListings(result.data)
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load car listings.",
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
  }, [])

  const recentOffers = listings.filter(
    (listing) => listing.offer && Number(listing.discountPercent) > 0,
  )
  const recentRentals = listings.filter((listing) => listing.type === "Rent")
  const recentSales = listings.filter((listing) => listing.type === "Sale")

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">IftiinsheAuto marketplace</p>
          <h1>Find your next perfect vehicle with ease</h1>
          <p>
            Browse local cars for sale and rent, compare the details, and connect
            directly with the person who listed the car.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary-link" to="/search">Let&apos;s get started</Link>
            <Link className="home-secondary-link" to="/create-listing">List your car</Link>
          </div>
        </div>
        {listings.length ? (
          <Swiper
            className="home-featured-swiper"
            modules={[Keyboard, Navigation, Pagination]}
            navigation={listings.length > 1}
            pagination={listings.length > 1 ? { clickable: true } : false}
            keyboard={{ enabled: true }}
            loop={listings.length > 1}
          >
            {listings.map((listing, index) => (
              <SwiperSlide key={listing.id}>
                <Link
                  className="home-featured-car"
                  to={`/listing/${encodeURIComponent(listing.id)}`}
                  aria-label={`View featured car: ${listing.name}`}
                >
                  {listing.imageURLs?.[0] ? (
                    <img
                      src={listing.imageURLs[0]}
                      alt={listing.name}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  ) : (
                    <span className="home-featured-slide-placeholder">
                      Car photo unavailable
                    </span>
                  )}
                  <span className="home-featured-label">
                    <span>Latest listing</span>
                    <strong>{listing.name}</strong>
                    <span>{listing.location}</span>
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="home-featured-placeholder">
            {isLoading ? "Finding the latest cars..." : "Your next drive starts here"}
          </div>
        )}
      </section>

      <div className="home-content">
        {isLoading ? (
          <p className="home-state">Loading the latest cars...</p>
        ) : error ? (
          <p className="home-state home-state-error" role="alert">{error}</p>
        ) : listings.length === 0 ? (
          <section className="home-empty">
            <h2>No cars listed yet</h2>
            <p>Be the first to list a car for sale or rent.</p>
            <Link className="home-primary-link" to="/create-listing">
              Create a listing
            </Link>
          </section>
        ) : (
          <>
            <HomeListingSection
              title="Recent offers"
              listings={recentOffers}
              emptyMessage="There are no discounted cars right now. Check back soon for new offers."
            />
            <HomeListingSection
              title="Recent cars for rent"
              listings={recentRentals}
              emptyMessage="No cars are available to rent right now."
            />
            <HomeListingSection
              title="Recent cars for sale"
              listings={recentSales}
              emptyMessage="No cars are available for sale right now."
            />
          </>
        )}
      </div>
    </main>
  )
}

export default Home

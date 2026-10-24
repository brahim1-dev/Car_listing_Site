import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { FaEnvelope } from "react-icons/fa"
import {
  FaCalendarAlt,
  FaCarSide,
  FaCheckCircle,
  FaCogs,
  FaGasPump,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaTag,
} from "react-icons/fa"
import { Keyboard, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { auth } from "../firebase"
import { useAppContext } from "../context/useAppContext"
import ListingPostedMeta from "../components/ListingPostedMeta"

const formatPrice = (price) => Number(price).toLocaleString()

const Listing = () => {
  const { listingId } = useParams()
  const { currentUser } = useAppContext()
  const [listing, setListing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [contactState, setContactState] = useState(null)
  const [contactMessage, setContactMessage] = useState("")
  const [contactRetry, setContactRetry] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadListing = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/listing/${encodeURIComponent(listingId)}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not load this car listing.")
        }
        if (isCurrent) setListing(result.data)
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load this car listing.",
          )
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadListing()
    return () => {
      isCurrent = false
    }
  }, [listingId])

  useEffect(() => {
    if (!currentUser || !listing) return undefined

    let isCurrent = true
    const loadSellerContact = async () => {
      setContactState({
        listingId,
        viewerId: currentUser.uid,
        isLoading: true,
        email: "",
        error: "",
      })
      try {
        const authenticatedUser = auth.currentUser
        if (!authenticatedUser || authenticatedUser.uid !== currentUser.uid) {
          throw new Error("Your sign-in session is still loading. Please try again.")
        }
        const idToken = await authenticatedUser.getIdToken(true)
        if (listing.userId === currentUser.uid) {
          const response = await fetch("/api/listing/mine/contact", {
            method: "PATCH",
            headers: { Authorization: `Bearer ${idToken}` },
          })
          const result = await response.json()
          if (!response.ok) {
            throw new Error(result.message || "Could not enable contact for your listing.")
          }
          if (isCurrent) {
            setContactState({
              listingId,
              viewerId: currentUser.uid,
              isLoading: false,
              email: "",
              error: "",
              synced: true,
            })
          }
          return
        }

        const response = await fetch(
          `/api/listing/${encodeURIComponent(listingId)}/contact`,
          { headers: { Authorization: `Bearer ${idToken}` } },
        )
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not load seller contact information.")
        }
        if (isCurrent) {
          setContactState({
            listingId,
            viewerId: currentUser.uid,
            isLoading: false,
            email: result.data.email,
            error: "",
          })
        }
      } catch (contactLoadError) {
        if (isCurrent) {
          setContactState({
            listingId,
            viewerId: currentUser.uid,
            isLoading: false,
            email: "",
            error: contactLoadError instanceof Error
              ? contactLoadError.message
              : "Could not load seller contact information.",
          })
        }
      }
    }

    loadSellerContact()
    return () => {
      isCurrent = false
    }
  }, [currentUser, listing, listingId, contactRetry])

  const handleOpenEmail = (event) => {
    event.preventDefault()
    if (!sellerContact?.email || !contactMessage.trim()) return

    const subject = `I'm interested in your ${listing.name}`
    const body = [
      contactMessage.trim(),
      "",
      `My email: ${currentUser.email || ""}`,
      `Listing: ${window.location.href}`,
    ].join("\n")
    const params = new URLSearchParams({ subject, body })
    window.location.href = `mailto:${sellerContact.email}?${params.toString()}`
  }

  if (isLoading) {
    return (
      <main className="listing-page">
        <p className="listing-state">Loading listing...</p>
      </main>
    )
  }

  if (error || !listing) {
    return (
      <main className="listing-page">
        <section className="listing-state">
          <h1>{error || "Car listing not found."}</h1>
          <Link to="/">Back to available cars</Link>
        </section>
      </main>
    )
  }

  const hasDiscount =
    listing.offer &&
    Number(listing.discountPercent) > 0 &&
    Number(listing.discountPercent) < 100
  const displayedPrice = hasDiscount
    ? Number(listing.price) * (1 - Number(listing.discountPercent) / 100)
    : Number(listing.price)
  const images = listing.imageURLs?.filter(Boolean) ?? []
  const sellerContact =
    contactState?.listingId === listingId &&
    contactState?.viewerId === currentUser?.uid
      ? contactState
      : null

  return (
    <main className="listing-page">
      <section className="listing-gallery" aria-label={`${listing.name} photos`}>
        {images.length ? (
          <Swiper
            className="listing-swiper"
            modules={[Keyboard, Navigation, Pagination]}
            navigation={images.length > 1}
            pagination={images.length > 1 ? { clickable: true } : false}
            keyboard={{ enabled: true }}
            loop={images.length > 1}
          >
            {images.map((image, index) => (
              <SwiperSlide key={`${image}-${index}`}>
                <img
                  className="listing-gallery-image"
                  src={image}
                  alt={`${listing.name} photo ${index + 1}`}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="listing-gallery-empty">No car photos available</div>
        )}
      </section>

      <article className="listing-details">
        <Link className="listing-back-link" to="/">Back to available cars</Link>
        <div className="listing-title-price">
          <h1>{listing.name}</h1>
          <div className="listing-detail-price">
            {hasDiscount && <del>{formatPrice(listing.price)}</del>}
            <strong>{formatPrice(displayedPrice)}</strong>
            {listing.type === "Rent" && <span>/month</span>}
            {hasDiscount && (
              <span className="listing-discount">{listing.discountPercent}% off</span>
            )}
          </div>
        </div>
        <p className="listing-location">
          <FaMapMarkerAlt aria-hidden="true" />
          <span>{listing.location}</span>
        </p>
        <ListingPostedMeta listing={listing} />
        <span className="listing-type">
          <FaTag aria-hidden="true" />
          {listing.type === "Rent" ? "For Rent" : "For Sale"}
        </span>
        <p className="listing-description">{listing.description}</p>
        <div className="listing-specifications">
          {[
            ["Model", listing.model || listing.make, FaCarSide],
            ["Year", listing.year, FaCalendarAlt],
            ["Mileage", `${Number(listing.mileage).toLocaleString()} km`, FaTachometerAlt],
            ["Fuel", listing.fuelType, FaGasPump],
            ["Transmission", listing.transmission, FaCogs],
            ["Condition", listing.condition, FaCheckCircle],
          ].map(([label, value, Icon]) => (
            <div className="listing-specification" key={label}>
              <div className="listing-specification-heading">
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {currentUser && listing.userId !== currentUser.uid ? (
          <div className="listing-contact">
            {!sellerContact || sellerContact.isLoading ? (
              <p className="listing-contact-message">Loading seller contact...</p>
            ) : sellerContact.email ? (
              <form className="listing-contact-form" onSubmit={handleOpenEmail}>
                <label htmlFor="listing-contact-message">
                  <FaEnvelope aria-hidden="true" />
                  Write a message to the owner
                </label>
                <textarea
                  id="listing-contact-message"
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  maxLength={5000}
                  rows={5}
                  placeholder={`Hi, I'm interested in your ${listing.name}...`}
                  required
                />
                <div className="listing-contact-form-footer">
                  <span>{contactMessage.length}/5000</span>
                  <button
                    className="listing-contact-button"
                    type="submit"
                    disabled={!contactMessage.trim()}
                  >
                    <FaEnvelope aria-hidden="true" />
                    Open email app
                  </button>
                </div>
                <p className="listing-contact-message">
                  Your email app will open with this message ready to send.
                </p>
                {sellerContact.error && (
                  <p className="listing-contact-message listing-contact-error" role="alert">
                    {sellerContact.error}
                  </p>
                )}
              </form>
            ) : (
              <div>
                <p className="listing-contact-message listing-contact-error" role="alert">
                  {sellerContact.error || "Seller contact is currently unavailable."}
                </p>
                <button
                  className="listing-contact-button"
                  type="button"
                  onClick={() => setContactRetry((count) => count + 1)}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        ) : null}
      </article>
    </main>
  )
}

export default Listing
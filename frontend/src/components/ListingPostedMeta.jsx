import { FaClock, FaUser } from "react-icons/fa"
import { formatPostedTime } from "../utils/listingMeta"

const ListingPostedMeta = ({ listing, className = "" }) => {
  const postedAt = listing.createdAt ? new Date(listing.createdAt) : null
  const hasValidDate = postedAt && Number.isFinite(postedAt.getTime())
  const postedDate = hasValidDate ? postedAt.toLocaleDateString() : "date unavailable"

  return (
    <p
      className={`listing-posted-meta ${className}`.trim()}
      title={hasValidDate ? postedAt.toLocaleString() : undefined}
    >
      <span>
        <FaClock aria-hidden="true" />
        Posted {postedDate} · {formatPostedTime(listing.createdAt)}
      </span>
      <span>
        <FaUser aria-hidden="true" />
        by {listing.sellerName || "Car owner"}
      </span>
    </p>
  )
}

export default ListingPostedMeta

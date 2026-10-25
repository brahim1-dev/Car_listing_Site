import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { auth } from "../firebase"
import { uploadCarImage } from "../cloudinary"
import { readApiResponse } from "../utils/readApiResponse"

const initialForm = {
  name: "",
  description: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  fuelType: "Petrol",
  transmission: "Automatic",
  condition: "New",
  location: "",
  type: "Sale",
  offer: false,
  discountPercent: "",
  price: "",
}

const listingDraftKey = "car-listing-draft"

const getListingFormData = (listing) => ({
  name: listing.name ?? "",
  description: listing.description ?? "",
  make: listing.make ?? "",
  model: listing.model ?? "",
  year: String(listing.year ?? ""),
  mileage: String(listing.mileage ?? ""),
  fuelType: listing.fuelType ?? initialForm.fuelType,
  transmission: listing.transmission ?? initialForm.transmission,
  condition: listing.condition ?? initialForm.condition,
  location: listing.location ?? "",
  type: listing.type ?? initialForm.type,
  offer: Boolean(listing.offer),
  discountPercent: listing.offer ? String(listing.discountPercent ?? "") : "",
  price: String(listing.price ?? ""),
})

const loadListingDraft = (draftKey) => {
  try {
    const savedDraft = localStorage.getItem(draftKey)
    if (!savedDraft) return null

    const draft = JSON.parse(savedDraft)
    if (
      !draft ||
      typeof draft.formData !== "object" ||
      Array.isArray(draft.formData) ||
      !Array.isArray(draft.imageURLs) ||
      draft.imageURLs.some((url) => typeof url !== "string")
    ) {
      throw new Error("Saved listing draft has an invalid format.")
    }

    return {
      formData: { ...initialForm, ...draft.formData },
      imageURLs: draft.imageURLs,
    }
  } catch (error) {
    console.error("Could not restore saved car listing draft:", error)
    toast.error("Could not restore your saved listing draft.")
    return null
  }
}

const CarListing = () => {
  const navigate = useNavigate()
  const { listingId } = useParams()
  const isEditing = Boolean(listingId)
  const draftKey = isEditing ? `${listingDraftKey}:${listingId}` : listingDraftKey
  const fileInputRef = useRef(null)
  const [savedDraft] = useState(() => loadListingDraft(draftKey))
  const [formData, setFormData] = useState(savedDraft?.formData ?? initialForm)
  const [imageURLs, setImageURLs] = useState(savedDraft?.imageURLs ?? [])
  const [imageURLInput, setImageURLInput] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isLoadingListing, setIsLoadingListing] = useState(isEditing)
  const [listingLoadError, setListingLoadError] = useState("")
  const [isListingLoaded, setIsListingLoaded] = useState(!isEditing)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBusy = isUploading || isSubmitting

  useEffect(() => {
    if (!isEditing) return undefined

    let isCurrent = true
    const loadListing = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken(true)
        const response = await fetch("/api/listing/mine", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        const result = await readApiResponse(response)
        if (!response.ok) {
          throw new Error(result.message || "Could not load this listing.")
        }

        const listing = result.data.find((item) => item.id === listingId)
        if (!listing) {
          throw new Error("This listing is unavailable or does not belong to your account.")
        }

        if (isCurrent) {
          if (!savedDraft) {
            setFormData(getListingFormData(listing))
            setImageURLs(listing.imageURLs)
          }
          setIsListingLoaded(true)
        }
      } catch (error) {
        if (isCurrent) {
          setListingLoadError(
            error instanceof Error ? error.message : "Could not load this listing.",
          )
        }
      } finally {
        if (isCurrent) setIsLoadingListing(false)
      }
    }

    loadListing()
    return () => {
      isCurrent = false
    }
  }, [isEditing, listingId, savedDraft])

  useEffect(() => {
    if (!isListingLoaded) return

    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ formData, imageURLs }),
      )
    } catch (error) {
      console.error("Could not save car listing draft:", error)
      toast.error("Your listing draft could not be saved on this device.")
    }
  }, [draftKey, formData, imageURLs, isListingLoaded])

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target
    setFormData((data) => ({
      ...data,
      [id]: type === "checkbox" ? checked : value,
      ...(id === "offer" && !checked ? { discountPercent: "" } : {}),
    }))
  }

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || [])
    const availableSlots = 6 - imageURLs.length - selectedFiles.length
    if (files.length > availableSlots) {
      toast.error(`You can add up to 6 images. ${availableSlots} slot(s) remain.`)
    }
    setSelectedFiles((current) => [
      ...current,
      ...files.slice(0, availableSlots),
    ])
    event.target.value = ""
  }

  const handleUploadImages = async () => {
    if (!selectedFiles.length) {
      toast.error("Choose one or more images first.")
      return
    }

    setIsUploading(true)
    const uploadedURLs = []
    const uploadedFiles = new Set()
    const failedFiles = []
    try {
      for (const file of selectedFiles) {
        try {
          uploadedURLs.push(await uploadCarImage(file))
          uploadedFiles.add(file)
        } catch (error) {
          failedFiles.push(
            `${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`,
          )
        }
      }

      setImageURLs((images) => [...images, ...uploadedURLs])
      setSelectedFiles((files) => files.filter((file) => !uploadedFiles.has(file)))
      if (uploadedURLs.length) {
        toast.success(`${uploadedURLs.length} image(s) uploaded.`)
      }
      if (failedFiles.length) {
        toast.error(failedFiles[0])
      }
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index) => {
    setImageURLs((images) => images.filter((_, imageIndex) => imageIndex !== index))
  }

  const addImageURL = () => {
    const value = imageURLInput.trim()
    let parsedURL
    try {
      parsedURL = new URL(value)
    } catch {
      toast.error("Enter a valid image URL.")
      return
    }

    if (!["http:", "https:"].includes(parsedURL.protocol)) {
      toast.error("Image links must start with http:// or https://.")
      return
    }

    if (imageURLs.length + selectedFiles.length >= 6) {
      toast.error("You can add up to 6 images.")
      return
    }

    if (imageURLs.includes(parsedURL.href)) {
      toast.error("This image has already been added.")
      return
    }

    setImageURLs((images) => [...images, parsedURL.href])
    setImageURLInput("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!imageURLs.length && !selectedFiles.length) {
      toast.error("Add at least one image by uploading a file or entering an image URL.")
      return
    }
    if (selectedFiles.length) {
      toast.error("Upload your selected image files before creating the listing.")
      return
    }
    if (!auth?.currentUser) {
      toast.error("Please sign in before creating a listing.")
      navigate("/sign-in")
      return
    }

    setIsSubmitting(true)
    try {
      const idToken = await auth.currentUser.getIdToken(true)
      const response = await fetch(
        isEditing ? `/api/listing/${encodeURIComponent(listingId)}` : "/api/listing",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            ...formData,
            year: Number(formData.year),
            mileage: Number(formData.mileage),
            price: Number(formData.price),
            discountPercent: formData.offer
              ? Number(formData.discountPercent)
              : 0,
            imageURLs,
          }),
        },
      )
      const result = await readApiResponse(response)
      if (!response.ok) {
        throw new Error(result.message || "Could not create the car listing.")
      }

      try {
        localStorage.removeItem(draftKey)
      } catch (error) {
        console.error("Could not clear saved car listing draft:", error)
        toast.error("Listing saved, but the saved draft could not be cleared.")
      }
      toast.success(
        isEditing ? "Your car listing has been updated." : "Your car listing has been created.",
      )
      navigate(isEditing ? "/profile" : "/")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create the car listing.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingListing) {
    return (
      <main className="car-listing-page">
        <p className="car-listing-load-message">Loading your listing...</p>
      </main>
    )
  }

  if (listingLoadError) {
    return (
      <main className="car-listing-page">
        <section className="car-listing-load-message">
          <p>{listingLoadError}</p>
          <Link to="/profile">Back to profile</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="car-listing-page">
      <section className="car-listing-content">
        <header className="car-listing-heading">
          <p className="car-listing-eyebrow">Sell or rent your vehicle</p>
          <h1>{isEditing ? "Edit Car Listing" : "Car Listing"}</h1>
          <p>
            {isEditing
              ? "Update your car details and photos."
              : "Add your car details and photos to publish a listing."}
          </p>
        </header>

        <form className="car-listing-form" onSubmit={handleSubmit}>
          <div className="car-listing-details">
            <label className="sr-only" htmlFor="name">Car name</label>
            <input
              className="car-listing-input"
              id="name"
              placeholder="Car Name..."
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="description">Car description</label>
            <textarea
              className="car-listing-input car-listing-description"
              id="description"
              placeholder="Car Description..."
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="make">Make</label>
            <input
              className="car-listing-input"
              id="make"
              placeholder="Make, eg. Toyota, Nissan"
              value={formData.make}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="model">Model</label>
            <input
              className="car-listing-input"
              id="model"
              placeholder="Model, eg. Vitz, Nissan Patrol"
              value={formData.model}
              onChange={handleChange}
            />

            <label className="sr-only" htmlFor="year">Year</label>
            <input
              className="car-listing-input"
              id="year"
              type="number"
              placeholder="Year, eg. 2018"
              min="1886"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="mileage">Mileage</label>
            <input
              className="car-listing-input"
              id="mileage"
              type="number"
              placeholder="Mileage, eg. 130000 km"
              min="0"
              value={formData.mileage}
              onChange={handleChange}
              required
            />

            <label className="sr-only" htmlFor="fuelType">Fuel type</label>
            <select
              className="car-listing-input"
              id="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>

            <label className="sr-only" htmlFor="transmission">Transmission</label>
            <select
              className="car-listing-input"
              id="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option>Automatic</option>
              <option>Manual</option>
              <option>CVT</option>
            </select>

            <label className="sr-only" htmlFor="condition">Condition</label>
            <select
              className="car-listing-input"
              id="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option>New</option>
              <option>Used</option>
              <option>Damaged</option>
            </select>

            <label className="sr-only" htmlFor="location">Location</label>
            <input
              className="car-listing-input"
              id="location"
              placeholder="Location, eg. Hargeisa, Mogadishu..."
              value={formData.location}
              onChange={handleChange}
              required
            />

            <div className="car-listing-options">
              <div className="car-listing-types" role="radiogroup" aria-label="Listing type">
                {["Sale", "Rent"].map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={() => setFormData((data) => ({ ...data, type }))}
                    />
                    {type}
                  </label>
                ))}
              </div>
              <label className="car-listing-offer">
                <input
                  id="offer"
                  type="checkbox"
                  checked={formData.offer}
                  onChange={handleChange}
                />
                Offer
              </label>
            </div>

            <div className="car-listing-price-row">
              <label className="sr-only" htmlFor="price">Price</label>
              <input
                className="car-listing-input"
                id="price"
                type="number"
                placeholder="Price..."
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <span>{formData.type === "Rent" ? "Price / Month" : "Regular Price"}</span>
            </div>
            {formData.offer && (
              <>
                <label className="sr-only" htmlFor="discountPercent">
                  Discount percentage
                </label>
                <div className="car-listing-discount-row">
                  <input
                    className="car-listing-input"
                    id="discountPercent"
                    type="number"
                    placeholder="Discount percentage"
                    min="1"
                    max="99"
                    step="1"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    required
                  />
                  <span>% off</span>
                </div>
                {Number(formData.price) > 0 &&
                  Number(formData.discountPercent) >= 1 &&
                  Number(formData.discountPercent) <= 99 && (
                    <p className="car-listing-price-preview">
                      Discounted price:{" "}
                      <strong>
                        {(
                          Number(formData.price) *
                          (1 - Number(formData.discountPercent) / 100)
                        ).toLocaleString()}
                        {formData.type === "Rent" ? " /month" : ""}
                      </strong>
                    </p>
                  )}
              </>
            )}
          </div>

          <div className="car-listing-media">
            <div className="car-listing-upload-label">
              <strong>Images:</strong>
              <span>Upload files or add image links. The first image is the cover (max 6).</span>
            </div>
            <input
              ref={fileInputRef}
              className="car-listing-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelection}
              disabled={isBusy || imageURLs.length + selectedFiles.length >= 6}
            />
            <button
              className="car-listing-upload-button"
              type="button"
              onClick={handleUploadImages}
              disabled={isBusy || selectedFiles.length === 0}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            <div className="car-listing-url-row">
              <label className="sr-only" htmlFor="car-image-url">Image URL</label>
              <input
                className="car-listing-input"
                id="car-image-url"
                type="url"
                value={imageURLInput}
                onChange={(event) => setImageURLInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addImageURL()
                  }
                }}
                placeholder="Paste an image link (https://...)"
                disabled={isBusy || imageURLs.length + selectedFiles.length >= 6}
              />
              <button
                className="car-listing-upload-button car-listing-add-url-button"
                type="button"
                onClick={addImageURL}
                disabled={
                  isBusy ||
                  !imageURLInput.trim() ||
                  imageURLs.length + selectedFiles.length >= 6
                }
              >
                Add link
              </button>
            </div>

            <p className="car-listing-image-count">
              {selectedFiles.length
                ? `${selectedFiles.length} image(s) selected`
                : imageURLs.length
                  ? `${imageURLs.length} of 6 image(s) added`
                  : "Choose up to 6 images"}
            </p>
            {imageURLs.length > 0 && (
              <div className="car-listing-previews">
                {imageURLs.map((url, index) => (
                  <div className="car-listing-preview" key={url}>
                    <img src={url} alt={`Car listing ${index + 1}`} />
                    <div className="car-listing-preview-info">
                      {index === 0 && <span>Cover image</span>}
                      <span>Image {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete image ${index + 1}`}
                      onClick={() => removeImage(index)}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="car-listing-submit"
              type="submit"
              disabled={isBusy}
            >
              {isSubmitting
                ? isEditing
                  ? "Saving changes..."
                  : "Creating listing..."
                : isEditing
                  ? "Save Changes"
                  : "Create Listing"}
            </button>
            <p className="car-listing-signin-note">
              Your listing will be published under your account.{" "}
              <Link to="/profile">Manage your profile</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}

export default CarListing

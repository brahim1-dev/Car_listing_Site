import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { auth } from "../firebase"
import { uploadCarImage } from "../cloudinary"

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
  price: "",
}

const CarListing = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(initialForm)
  const [imageURLs, setImageURLs] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBusy = isUploading || isSubmitting

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target
    setFormData((data) => ({
      ...data,
      [id]: type === "checkbox" ? checked : value,
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!imageURLs.length) {
      toast.error("Upload at least one car image.")
      return
    }
    if (!auth?.currentUser) {
      toast.error("Please sign in before creating a listing.")
      navigate("/sign-in")
      return
    }

    setIsSubmitting(true)
    try {
      const idToken = await auth.currentUser.getIdToken()
      const response = await fetch("/api/listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
          mileage: Number(formData.mileage),
          price: Number(formData.price),
          imageURLs,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Could not create the car listing.")
      }

      toast.success("Your car listing has been created.")
      setFormData(initialForm)
      setImageURLs([])
      setSelectedFiles([])
      navigate("/")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create the car listing.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="car-listing-page">
      <section className="car-listing-content">
        <header className="car-listing-heading">
          <p className="car-listing-eyebrow">Sell or rent your vehicle</p>
          <h1>Car Listing</h1>
          <p>Add your car details and photos to publish a listing.</p>
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
          </div>

          <div className="car-listing-media">
            <div className="car-listing-upload-label">
              <strong>Images:</strong>
              <span>The first image will be the cover (max 6).</span>
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

            <p className="car-listing-image-count">
              {selectedFiles.length
                ? `${selectedFiles.length} image(s) selected`
                : imageURLs.length
                  ? `${imageURLs.length} image(s) uploaded`
                  : "Choose up to 6 images"}
            </p>
            {imageURLs.length > 0 && (
              <div className="car-listing-previews">
                {imageURLs.map((url, index) => (
                  <div className="car-listing-preview" key={url}>
                    <img src={url} alt={`Car listing ${index + 1}`} />
                    {index === 0 && <span>Cover</span>}
                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() => removeImage(index)}
                      disabled={isBusy}
                    >
                      ×
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
              {isSubmitting ? "Creating listing..." : "Create Listing"}
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

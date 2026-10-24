import { Link } from "react-router-dom"
import {
  FaCarSide,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaRegEnvelope,
  FaSearch,
} from "react-icons/fa"

const steps = [
  {
    icon: FaSearch,
    title: "Find a car",
    description:
      "Search local listings and narrow your choices by price, year, fuel type, condition, and more.",
  },
  {
    icon: FaClipboardCheck,
    title: "Compare the details",
    description:
      "Review photos, specifications, pricing, offers, and when each car was posted.",
  },
  {
    icon: FaRegEnvelope,
    title: "Contact the owner",
    description:
      "Signed-in buyers can prepare a message and open their email app to contact the person who posted the car.",
  },
]

const About = () => (
  <main className="about-page">
    <section className="about-hero">
      <p className="about-eyebrow">About SuuroCars</p>
      <h1>A simpler way to find your next car.</h1>
      <p>
        Explore cars for sale and rent, compare useful details, and connect
        directly with the people who list them.
      </p>
      <Link className="about-primary-link" to="/search">
        <FaSearch aria-hidden="true" />
        Explore listings
      </Link>
      <div className="about-hero-icon" aria-hidden="true">
        <FaCarSide />
      </div>
    </section>

    <section className="about-intro">
      <div className="about-intro-icon" aria-hidden="true">
        <FaMapMarkerAlt />
      </div>
      <div>
        <p className="about-eyebrow">Our marketplace</p>
        <h2>Local listings. Clear details. Direct connection.</h2>
        <p>
          SuuroCars brings car listings together in one place. Whether
          you&apos;re looking to buy or rent, you can browse photos and vehicle
          information, check prices and offers, and reach out to the listing
          owner when you&apos;re ready.
        </p>
      </div>
    </section>

    <section className="about-how-it-works">
      <div className="about-section-heading">
        <p className="about-eyebrow">Getting started</p>
        <h2>From browsing to reaching out</h2>
      </div>
      <div className="about-steps">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <article className="about-step" key={title}>
            <span className="about-step-number">0{index + 1}</span>
            <span className="about-step-icon" aria-hidden="true">
              <Icon />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-seller-cta">
      <div>
        <p className="about-eyebrow">Have a car to list?</p>
        <h2>Put your car in front of local buyers and renters.</h2>
        <p>Create a listing with photos, pricing, and the details people need.</p>
      </div>
      <Link className="about-primary-link" to="/create-listing">
        List your car
      </Link>
    </section>
  </main>
)

export default About

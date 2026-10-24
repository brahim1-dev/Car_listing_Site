import { FaCarSide } from "react-icons/fa"
import { Link } from "react-router-dom"

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-main">
      <div className="site-footer-brand">
        <Link className="site-footer-logo" to="/">
          <FaCarSide aria-hidden="true" />
          <span>SuuroCars</span>
        </Link>
        <p>
          Browse local cars for sale and rent, and connect with the people who
          list them.
        </p>
      </div>
      <nav className="site-footer-links" aria-label="Footer navigation">
        <h2>Explore</h2>
        <Link to="/">Home</Link>
        <Link to="/search">Search cars</Link>
        <Link to="/about">About us</Link>
      </nav>
      <nav className="site-footer-links" aria-label="Marketplace navigation">
        <h2>Marketplace</h2>
        <Link to="/create-listing">List your car</Link>
        <Link to="/sign-in">Sign in</Link>
      </nav>
    </div>
    <div className="site-footer-bottom">
      <span>© {new Date().getFullYear()} SuuroCars</span>
      <span>Find a car. Make your next move.</span>
    </div>
  </footer>
)

export default Footer

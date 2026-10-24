import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SingUp from "./pages/SignUp"
import About from "./pages/About"
import Profile from "./pages/Profile"
import CarListing from "./pages/Carlisting"
import Listing from "./pages/Listing"
import Search from "./pages/Search"
import Header from "./components/Header"
import Footer from "./components/Footer"
import PrivateRoute from "./components/PrivateRoute"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const App = () => {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app-route-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SingUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search key={location.search} />} />
          <Route path="/listing/:listingId" element={<Listing />} />
          <Route
            path="/create-listing"
            element={
              <PrivateRoute>
                <CarListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-listing/:listingId"
            element={
              <PrivateRoute>
                <CarListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
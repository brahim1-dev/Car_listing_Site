import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SingUp from "./pages/SignUp"
import About from "./pages/About"
import Profile from "./pages/Profile"
import Header from "./components/Header"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAppContext } from "./context/useAppContext"

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext()
  const location = useLocation()

  if (loading) {
    return <main className="max-w-lg mx-auto p-3 text-center">Checking your session...</main>
  }

  return currentUser ? children : <Navigate to="/sign-in" replace state={{ from: location }} />
}

const App = () => {
  return (
    <>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SingUp />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
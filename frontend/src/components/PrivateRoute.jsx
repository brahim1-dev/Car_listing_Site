import { Navigate, useLocation } from "react-router-dom"
import { useAppContext } from "../context/useAppContext"

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext()
  const location = useLocation()

  if (loading) {
    return (
      <main className="max-w-lg mx-auto p-3 text-center">
        Checking your session...
      </main>
    )
  }

  return currentUser ? (
    children
  ) : (
    <Navigate to="/sign-in" replace state={{ from: location }} />
  )
}

export default PrivateRoute
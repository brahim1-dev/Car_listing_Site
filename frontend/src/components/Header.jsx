import { useState } from "react"
import { FaSearch } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/useAppContext"
import { logOut } from "../firebase"

const Header = () => {
  const { currentUser, signoutUserStart, signoutUserSuccess, signoutUserFailure, loading } = useAppContext()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const avatarLabel = (currentUser?.displayName || currentUser?.email || "User")
    .charAt(0)
    .toUpperCase()

  const handleSignOut = async () => {
    setIsMenuOpen(false)
    signoutUserStart()
    try {
      await logOut()
      signoutUserSuccess()
      toast.success("Signed out successfully.")
      navigate("/sign-in")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign out."
      signoutUserFailure(message)
      toast.error(message)
    }
  }

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3" >
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Iftiinshe</span>
            <span className="text-slate-700">Auto</span>
          </h1>
        </Link>
        <form className="flex items-center bg-slate-100 rounded-lg p-3">
          <input 
            type="text" 
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 ms:w-64"
          />
          <FaSearch className="text-slate-600" />
        </form>
        <ul className="flex gap-4">
          <Link className="hidden sm:inline text-slate-700 hover:underline" to="/">Home</Link>
          <Link className="text-slate-700 hover:underline" to="/about">About</Link>
          {currentUser ? (
            <li className="relative">
              <button
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-700 text-sm font-semibold text-white hover:ring-2 hover:ring-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                type="button"
                aria-label="Open account menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                {currentUser.photoURL ? (
                  <img
                    className="h-full w-full object-cover"
                    src={currentUser.photoURL}
                    alt=""
                  />
                ) : (
                  avatarLabel
                )}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-10 z-10 min-w-36 rounded-lg bg-white py-1 shadow-lg">
                  <Link
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    {loading ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </li>
          ) : (
            <Link className="text-slate-700 hover:underline" to="/sign-in">Sign In</Link>
          )}
        </ul>
      </div>
    </header>
  )
}

export default Header
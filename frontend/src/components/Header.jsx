import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/useAppContext"
import { auth, logOut } from "../firebase"

const Header = () => {
  const { currentUser, signoutUserStart, signoutUserSuccess, signoutUserFailure, loading } = useAppContext()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [adminUid, setAdminUid] = useState("")
  const isAdmin = Boolean(currentUser && adminUid === currentUser.uid)
  const avatarLabel = (currentUser?.displayName || currentUser?.email || "User")
    .charAt(0)
    .toUpperCase()

  useEffect(() => {
    if (!currentUser || !auth) return undefined

    let isCurrent = true
    const checkAdminAccess = async () => {
      try {
        const firebaseUser = auth.currentUser
        if (!firebaseUser || firebaseUser.uid !== currentUser.uid) {
          throw new Error("The signed-in user changed before admin access could be checked.")
        }
        const idToken = await firebaseUser.getIdToken()
        const response = await fetch("/api/admin/access", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Could not check administrator access.")
        }
        if (isCurrent) {
          setAdminUid(result.data.isAdmin ? currentUser.uid : "")
        }
      } catch (error) {
        if (isCurrent) setAdminUid("")
        console.error("Could not check administrator access:", error)
      }
    }

    checkAdminAccess()
    return () => {
      isCurrent = false
    }
  }, [currentUser])

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set("q", searchTerm.trim())
    navigate(`/search${params.size ? `?${params.toString()}` : ""}`)
  }

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
      <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Suuro</span>
            <span className="text-slate-700">Cars</span>
          </h1>
        </Link>
        <form
          className="flex min-w-0 max-w-[21.6rem] flex-1 items-center gap-3 rounded-full border border-slate-300/80 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-300/70"
          onSubmit={handleSearch}
          role="search"
        >
          <input
            type="search"
            placeholder="Search cars..."
            aria-label="Search cars"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button
            className="shrink-0 text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            type="submit"
            aria-label="Search listings"
          >
            <FaSearch aria-hidden="true" />
          </button>
        </form>
        <ul className="flex gap-4">
          <Link className="hidden sm:inline text-slate-700 hover:underline" to="/">Home</Link>
          <Link className="text-slate-700 hover:underline" to="/about">About</Link>
          {currentUser ? (
            <>
              <Link
                className="hidden sm:inline text-slate-700 hover:underline"
                to="/create-listing"
              >
                Car Listing
              </Link>
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
                    {isAdmin && (
                      <Link
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin dashboard
                      </Link>
                    )}
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
            </>
          ) : (
            <Link className="text-slate-700 hover:underline" to="/sign-in">Sign In</Link>
          )}
        </ul>
      </div>
    </header>
  )
}

export default Header
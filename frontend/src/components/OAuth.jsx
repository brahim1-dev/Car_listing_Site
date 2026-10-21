
import { useState } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/AppContext"

const OAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signInStart, signInSuccess, signInFailure } = useAppContext()
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      toast.error("Google did not return a sign-in credential.")
      return
    }

    setIsSubmitting(true)
    signInStart()

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Could not sign in with Google.")
      }

      signInSuccess(result.data)
      toast.success(result.message || "Signed in with Google.")
      navigate("/profile")
    } catch (requestError) {
      signInFailure(requestError.message || "Could not sign in with Google.")
      toast.error(requestError.message || "Could not connect to the server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!googleClientId) {
    return (
      <button
        className="border border-slate-300 rounded-lg p-3 text-slate-700 uppercase hover:bg-slate-50"
        type="button"
        onClick={() => toast.error("Configure VITE_GOOGLE_CLIENT_ID to enable Google sign-in.")}
      >
        Continue with Google
      </button>
    )
  }

  return (
    <div className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error("Google sign-in was unsuccessful.")}
        text="continue_with"
        width="100%"
      />
    </div>
  )
}

export default OAuth
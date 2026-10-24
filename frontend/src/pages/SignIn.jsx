import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/useAppContext"
import OAuth from "../components/OAuth"
import {
  firebaseConfigError,
  logOut,
  signInWithEmail,
} from "../firebase"

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const {
    currentUser,
    signInStart,
    signInSuccess,
    signInFailure,
    signoutUserSuccess,
  } = useAppContext()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.id]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    signInStart()

    try {
      const user = await signInWithEmail(formData.email, formData.password)
      signInSuccess(user)
      toast.success("Signed in successfully.")
      navigate("/")
    } catch (error) {
      const message = [
        "auth/invalid-credential",
        "auth/invalid-login-credentials",
        "auth/wrong-password",
        "auth/user-not-found",
      ].includes(error?.code)
        ? "Email or password is incorrect. If you are trying another account, sign out of the current account first."
        : error instanceof Error
          ? error.message
          : "Could not sign in."
      signInFailure(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      {currentUser && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          <p>
            You are currently signed in as{" "}
            <strong>{currentUser.email || currentUser.displayName || "this account"}</strong>.
            A failed sign-in keeps this account active.
          </p>
          <button
            className="mt-2 font-semibold underline"
            type="button"
            onClick={async () => {
              try {
                await logOut()
                signoutUserSuccess()
                toast.success("Signed out. You can now sign in to another account.")
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Could not sign out."
                toast.error(message)
              }
            }}
          >
            Sign out to switch accounts
          </button>
        </div>
      )}
      {firebaseConfigError && (
        <p className="mb-4 rounded-lg bg-amber-100 p-3 text-amber-900">
          {firebaseConfigError}
        </p>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border p-3 rounded-lg"
          type="email"
          placeholder="Email"
          id="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="border p-3 rounded-lg"
          type="password"
          placeholder="Password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="flex items-center gap-4 my-5">
        <hr className="flex-1 border-slate-300" />
        <span className="text-slate-500">OR</span>
        <hr className="flex-1 border-slate-300" />
      </div>
      <OAuth />
      <div className="flex gap-2 mt-5">
        <p>Need an account?</p>
        <Link className="text-blue-700 hover:underline" to="/sign-up">
          Sign up
        </Link>
      </div>
    </main>
  )
}

export default SignIn

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/useAppContext"
import OAuth from "../components/OAuth"
import { firebaseConfigError, signInWithEmail } from "../firebase"

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signInStart, signInSuccess, signInFailure } = useAppContext()

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
      navigate("/profile")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign in."
      signInFailure(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
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

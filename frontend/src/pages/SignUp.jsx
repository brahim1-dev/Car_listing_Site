import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAppContext } from "../context/useAppContext"
import OAuth from "../components/OAuth"
import { firebaseConfigError, signUpWithEmail } from "../firebase"

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
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
    const username = formData.username.trim()
    if (!username) {
      toast.error("Please enter a username.")
      return
    }

    setIsSubmitting(true)
    signInStart()

    try {
      const user = await signUpWithEmail(
        username,
        formData.email,
        formData.password,
      )
      signInSuccess(user)
      toast.success("Account created successfully.")
      navigate("/")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create your account."
      signInFailure(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      {firebaseConfigError && (
        <p className="mb-4 rounded-lg bg-amber-100 p-3 text-amber-900">
          {firebaseConfigError}
        </p>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input 
          className="border p-3 rounded-lg"
          type="text" 
          placeholder="Username"
          id="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
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
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <button
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <div className="flex items-center gap-4 my-5">
        <hr className="flex-1 border-slate-300" />
        <span className="text-slate-500">OR</span>
        <hr className="flex-1 border-slate-300" />
      </div>
      <OAuth mode="signup" />
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link className="text-blue-700 hover:underline" to="/sign-in">
          Sign in
        </Link>
      </div>
    </main>
  )
}

export default SignUp
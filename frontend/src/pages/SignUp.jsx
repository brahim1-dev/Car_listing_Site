import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import OAuth from "../components/OAuth"

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.id]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Could not create your account.")
      }

      toast.success(result.message || "Account created successfully.")
      navigate("/sign-in")
    } catch (requestError) {
      toast.error(requestError.message || "Could not connect to the server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
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
      <OAuth />
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
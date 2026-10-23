import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaCamera } from "react-icons/fa"
import { toast } from "react-toastify"
import { deleteAccount, logOut, updateAccount } from "../firebase"
import { uploadProfilePhoto } from "../cloudinary"
import { useAppContext } from "../context/useAppContext"

const Profile = () => {
  const { currentUser, signInSuccess, signoutUserStart, signoutUserSuccess, signoutUserFailure } =
    useAppContext()
  const navigate = useNavigate()
  const photoInputRef = useRef(null)
  const [formData, setFormData] = useState({
    username: currentUser.displayName || "",
    email: currentUser.email || "",
    password: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const avatarLabel = (formData.username || formData.email || "User")
    .charAt(0)
    .toUpperCase()
  const isBusy = isUpdating || isUploadingPhoto || isDeleting || isSigningOut

  const handleChange = (event) => {
    setFormData((data) => ({ ...data, [event.target.id]: event.target.value }))
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const user = await uploadProfilePhoto(file)
      signInSuccess({ ...user })
      toast.success("Profile photo updated.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not upload profile photo."
      toast.error(message)
    } finally {
      setIsUploadingPhoto(false)
      setPhotoInputKey((key) => key + 1)
    }
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    const username = formData.username.trim()
    if (!username) {
      toast.error("Please enter a username.")
      return
    }

    setIsUpdating(true)
    try {
      const user = await updateAccount({
        displayName: username,
        email: formData.email.trim(),
        password: formData.password,
      })
      signInSuccess(user)
      setFormData((data) => ({ ...data, username, password: "" }))
      toast.success("Profile updated successfully.")
    } catch (error) {
      const message =
        error.code === "auth/requires-recent-login"
          ? "Please sign out and sign in again before changing your email or password."
          : error instanceof Error
            ? error.message
            : "Could not update your profile."
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account?")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteAccount()
      signoutUserSuccess()
      toast.success("Your account has been deleted.")
      navigate("/sign-up")
    } catch (error) {
      const message =
        error.code === "auth/requires-recent-login"
          ? "Please sign out and sign in again before deleting your account."
          : error instanceof Error
            ? error.message
            : "Could not delete your account."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    signoutUserStart()
    try {
      await logOut()
      signoutUserSuccess()
      navigate("/")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign out."
      signoutUserFailure(message)
      toast.error(message)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-content">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-avatar-wrap">
          <input
            key={photoInputKey}
            ref={photoInputRef}
            className="profile-photo-input"
            type="file"
            accept="image/*"
            aria-label="Choose a profile photo"
            onChange={handlePhotoChange}
          />
          <button
            className="profile-avatar-button"
            type="button"
            aria-label={isUploadingPhoto ? "Uploading profile photo" : "Choose a profile photo"}
            onClick={() => photoInputRef.current?.click()}
            disabled={isBusy}
          >
            <span className="profile-avatar">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" />
              ) : (
                avatarLabel
              )}
            </span>
            <span className="profile-avatar-edit">
              {isUploadingPhoto ? "..." : <FaCamera aria-hidden="true" />}
            </span>
          </button>
        </div>

        <form className="profile-form" onSubmit={handleUpdate}>
          <div className="profile-field">
            <label className="profile-label" htmlFor="username">Username</label>
            <input
              className="profile-input"
              type="text"
              id="username"
              placeholder="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="email">Email</label>
            <input
              className="profile-input"
              type="email"
              id="email"
              placeholder="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="password">New password</label>
            <input
              className="profile-input"
              type="password"
              id="password"
              placeholder="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>
          <button
            className="profile-update"
            type="submit"
            disabled={isBusy}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </form>

        <div className="profile-actions">
          <button
            className="profile-action-delete"
            type="button"
            onClick={handleDeleteAccount}
            disabled={isBusy}
          >
            {isDeleting ? "Deleting account..." : "Delete account"}
          </button>
          <button
            className="profile-action-signout"
            type="button"
            onClick={handleSignOut}
            disabled={isBusy}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    </main>
  )
}

export default Profile

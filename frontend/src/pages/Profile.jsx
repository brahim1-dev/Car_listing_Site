import { useAppContext } from "../context/useAppContext"

const Profile = () => {
  const { currentUser } = useAppContext()

  return (
    <main className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl text-center font-semibold my-7">Your Profile</h1>
      <div className="flex flex-col items-center gap-3">
        {currentUser.photoURL && (
          <img
            className="h-24 w-24 rounded-full object-cover"
            src={currentUser.photoURL}
            alt=""
          />
        )}
        <p className="text-lg font-semibold">
          {currentUser.displayName || currentUser.email}
        </p>
        <p className="text-slate-600">{currentUser.email}</p>
      </div>
    </main>
  )
}

export default Profile

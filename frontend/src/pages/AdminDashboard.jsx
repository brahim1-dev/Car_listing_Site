import { useCallback, useEffect, useMemo, useState } from "react"
import { FaSearch, FaShieldAlt, FaTrashAlt, FaUsers } from "react-icons/fa"
import { auth } from "../firebase"

const formatDate = (value) => {
  if (!value) return "Never"
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "Unknown"
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [deletingUid, setDeletingUid] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const requestUsers = useCallback(async (pageToken, append) => {
    const user = auth?.currentUser
    if (!user) {
      throw new Error("Your sign-in session is unavailable. Sign in again.")
    }
    const idToken = await user.getIdToken(true)
    const query = pageToken
      ? `?${new URLSearchParams({ pageToken }).toString()}`
      : ""
    const response = await fetch(`/api/admin/users${query}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || "Could not load admin users.")
    }
    setUsers((current) => append ? [...current, ...result.data] : result.data)
    setNextPageToken(result.nextPageToken)
  }, [])

  useEffect(() => {
    let isCurrent = true

    const loadUsers = async () => {
      setIsLoading(true)
      setError("")
      try {
        await requestUsers(null, false)
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load admin users.",
          )
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      isCurrent = false
    }
  }, [requestUsers])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) =>
      [user.displayName, user.email, user.uid]
        .some((value) => value?.toLowerCase().includes(query)),
    )
  }, [search, users])

  const listingCount = users.reduce((total, user) => total + user.listingCount, 0)

  const loadMoreUsers = async () => {
    if (!nextPageToken || isLoadingMore) return
    setIsLoadingMore(true)
    setError("")
    try {
      await requestUsers(nextPageToken, true)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load more users.",
      )
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleDeleteUser = async (user) => {
    if (!user.canDelete || deletingUid) return
    const displayName = user.displayName || user.email || user.uid
    const confirmed = window.confirm(
      `Permanently delete ${displayName}? Their Firebase account, profile, and ${user.listingCount} listing(s) will be deleted.`,
    )
    if (!confirmed) return

    setDeletingUid(user.uid)
    setError("")
    setNotice("")
    try {
      const idToken = await auth.currentUser.getIdToken(true)
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.uid)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        },
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Could not delete this user.")
      }
      setUsers((current) => current.filter((item) => item.uid !== user.uid))
      setNotice(result.message)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this user.",
      )
    } finally {
      setDeletingUid("")
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-content">
        <header className="admin-heading">
          <div>
            <p className="admin-eyebrow">Marketplace controls</p>
            <h1>Admin dashboard</h1>
            <p>Review registered accounts and remove accounts that should no longer use the marketplace.</p>
          </div>
          <span className="admin-secure-badge">
            <FaShieldAlt aria-hidden="true" />
            Administrator
          </span>
        </header>

        <section className="admin-stats" aria-label="User statistics">
          <article className="admin-stat-card">
            <span className="admin-stat-icon"><FaUsers aria-hidden="true" /></span>
            <div>
              <span>Users loaded</span>
              <strong>{users.length}</strong>
            </div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon"><FaShieldAlt aria-hidden="true" /></span>
            <div>
              <span>Listings by these users</span>
              <strong>{listingCount}</strong>
            </div>
          </article>
        </section>

        <section className="admin-users-panel">
          <div className="admin-users-toolbar">
            <div>
              <h2>User management</h2>
              <p>Deleting an account also removes its marketplace listings.</p>
            </div>
            <label className="admin-user-search">
              <FaSearch aria-hidden="true" />
              <span className="sr-only">Search users</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, or ID"
              />
            </label>
          </div>

          {error && users.length > 0 && (
            <p className="admin-feedback admin-feedback-error" role="alert">{error}</p>
          )}
          {notice && <p className="admin-feedback" role="status">{notice}</p>}

          {isLoading ? (
            <p className="admin-empty-state">Loading user accounts...</p>
          ) : error && users.length === 0 ? (
            <div className="admin-empty-state">
              <h2>Dashboard unavailable</h2>
              <p className="admin-error-detail" role="alert">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="admin-empty-state">
              {users.length ? "No users match your search." : "No user accounts were found."}
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Last sign-in</th>
                    <th scope="col">Listings</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td>
                        <strong>{user.displayName || "Unnamed user"}</strong>
                        <span>{user.email || "No email"}</span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.lastSignInAt)}</td>
                      <td>{user.listingCount}</td>
                      <td>
                        <span className={`admin-status ${user.disabled ? "admin-status-disabled" : ""}`}>
                          {user.disabled ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td>
                        {user.canDelete ? (
                          <button
                            className="admin-delete-button"
                            type="button"
                            disabled={Boolean(deletingUid)}
                            onClick={() => handleDeleteUser(user)}
                          >
                            <FaTrashAlt aria-hidden="true" />
                            {deletingUid === user.uid ? "Deleting..." : "Delete"}
                          </button>
                        ) : (
                          <span className="admin-protected-label">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && nextPageToken && (
            <button
              className="admin-load-more"
              type="button"
              disabled={isLoadingMore}
              onClick={loadMoreUsers}
            >
              {isLoadingMore ? "Loading..." : "Load more users"}
            </button>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard

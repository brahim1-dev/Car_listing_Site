import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { auth, firebaseConfigError } from "../firebase";
import { AppContext } from "./app-context";

const syncOwnedListingContact = async (user) => {
  try {
    const idToken = await user.getIdToken(true);
    const response = await fetch("/api/listing/mine/contact", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not update contact on your listings.");
    }
  } catch (syncError) {
    const message =
      syncError instanceof Error
        ? syncError.message
        : "Could not update contact on your listings.";
    toast.error(`${message} Open your profile to retry.`);
  }
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(firebaseConfigError);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
        setError(null);
        if (user) void syncOwnedListingContact(user);
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      },
    );
  }, []);

  const signInStart = () => setLoading(true);

  const signInSuccess = (user) => {
    setCurrentUser(user);
    setLoading(false);
    setError(null);
  };

  const signInFailure = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const signoutUserStart = () => setLoading(true);
  const signoutUserSuccess = () => {
    setCurrentUser(null);
    setLoading(false);
    setError(null);
  };
  const signoutUserFailure = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const value = {
    currentUser,
    error,
    loading,
    signInStart,
    signInFailure,
    signInSuccess,
    signoutUserStart,
    signoutUserSuccess,
    signoutUserFailure,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

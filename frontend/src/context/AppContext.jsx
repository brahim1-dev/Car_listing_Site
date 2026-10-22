import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseConfigError } from "../firebase";
import { AppContext } from "./app-context";

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

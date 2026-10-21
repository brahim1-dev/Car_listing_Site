import { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext(); // creating context object to hold shared state and functions

export const AppProvider = ({ children }) => {
  //    states
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("current-user-data");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  // save the current user info to local storage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("current-user-data", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("current-user-data");
    }
  }, [currentUser]);

  // actions for user manangement
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

  const updateUserStart = () => setLoading(true);
  const updateUserSuccess = (updatedUser) => {
    setCurrentUser(updatedUser);
    setLoading(false);
    setError(null);
  };

  const updateUserFailure = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const deleteUserStart = () => setLoading(true);
  const deleteUserSuccess = () => {
    setCurrentUser(null);
    setLoading(false);
    setError(null);
    localStorage.removeItem("current-user-data");
  };

  const deleteUserFailure = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const signoutUserStart = () => setLoading(true);
  const signoutUserSuccess = () => {
    setCurrentUser(null);
    setLoading(false);
    setError(null);
    localStorage.removeItem("current-user-data");
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
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signoutUserStart,
    signoutUserSuccess,
    signoutUserFailure,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAPpContext must be used within an AppProvider");
  }
  return context;
};

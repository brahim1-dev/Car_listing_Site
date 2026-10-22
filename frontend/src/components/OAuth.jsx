import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signInWithGoogle } from "../firebase";
import { useAppContext } from "../context/useAppContext";

const OAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signInStart, signInSuccess, signInFailure } = useAppContext();

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    signInStart();

    try {
      const user = await signInWithGoogle();
      signInSuccess(user);
      toast.success("Signed in with Google.");
      navigate("/profile");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign in with Google.";
      signInFailure(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className="w-full border border-slate-300 rounded-lg p-3 text-slate-700 uppercase hover:bg-slate-50 disabled:opacity-60"
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
};

export default OAuth;

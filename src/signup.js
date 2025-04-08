// signup.js
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, realtimeDb } from "./firebase";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleEmailSignUp = async () => {
    setError("");
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await initializeUserData(user);
      alert("Account created successfully!");
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await initializeUserData(user);
      alert("Account created successfully with Google!");
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  const initializeUserData = async (user) => {
    const userRef = ref(realtimeDb, `users/${user.uid}`);
    await set(userRef, {
      email: user.email,
      inventory: [],
      invoices: [],
      returnHistory: [],
      expiredItems: [],
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleError = (error) => {
    console.error("Signup error:", error);
    switch (error.code) {
      case "auth/email-already-in-use":
        setError("This email is already registered. Please log in.");
        break;
      case "auth/invalid-email":
        setError("Invalid email format.");
        break;
      case "auth/weak-password":
        setError("Password is too weak. Must be at least 6 characters.");
        break;
      case "auth/unauthorized-domain":
        setError("This domain is not authorized. Check Firebase settings.");
        break;
      default:
        setError(error.message || "An error occurred during signup.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-800">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
          Sign Up
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"
        />
        <button
          onClick={handleEmailSignUp}
          className="bg-green-500 text-white px-4 py-2 rounded-md w-full mb-4"
        >
          Sign Up with Email
        </button>
        <button
          onClick={handleGoogleSignUp}
          className="bg-red-500 text-white px-4 py-2 rounded-md w-full mb-4 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.917v3.416h5.604c-.228,1.208-.957,2.229-1.916,2.938v2.438h3.104c1.812-1.667,2.854-4.125,2.854-7.083c0-.688-.083-1.354-.229-1.979h-9.417z"
            />
            <path
              fill="currentColor"
              d="M12,21c2.604,0,4.854-1.083,6.562-2.854l-3.104-2.438c-.896,.604-2.021,.979-3.458,.979c-2.688,0-4.938-1.812-5.729-4.229H3.104v2.438C4.812,18.688,8.313,21,12,21z"
            />
            <path
              fill="currentColor"
              d="M6.271,11.271c-.208-.688-.208-1.438,0-2.125V6.708H3.104C2.375,8.229,2,9.938,2,11.708s.375,3.479,1.104,5L6.271,14.396C6.062,13.708,6.062,11.958,6.271,11.271z"
            />
            <path
              fill="currentColor"
              d="M12,5.708c1.396,0,2.646,.521,3.604,1.354l2.708-2.708C16.604,2.688,14.354,1.708,12,1.708c-3.5,0-6.979,2.313-8.688,5.979l3.167,2.438C7.271,7.708,9.521,5.708,12,5.708z"
            />
          </svg>
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}

export default SignUp;

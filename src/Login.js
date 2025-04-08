import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email/Password Login
  const handleLogin = async () => {
    setError("");
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      switch (error.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        default:
          setError(error.message || "An error occurred during login.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-800">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-slate-50">
          Login
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
        <p className="text-center text-gray-600 dark:text-slate-300 mb-4">
          Inventory System App Beta 1 powered by{" "}
          <a
            href="http://www.hamagardy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            @hamagardy
          </a>
        </p>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;

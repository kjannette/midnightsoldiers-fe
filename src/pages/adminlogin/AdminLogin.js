import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInAdmin,
  onAuthStateChange,
  testFirebaseConfig,
} from "../../firebase/services";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated and test Firebase config
  useEffect(() => {
    // Test Firebase configuration on component mount
    testFirebaseConfig().then((result) => {
      console.log("Firebase config test result:", result);
    });

    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is signed in, redirect to admin dashboard
        navigate("/admin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use Firebase Authentication
      await signInAdmin(credentials.username, credentials.password);
      // Navigation will be handled by the useEffect hook
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of auth errors
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No admin account found with this username.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid username format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "Authentication service is not properly configured. Please contact the administrator.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid login credentials. Please check your username and password.";
      }

      setError(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-background"></div>
      <div className="admin-login-content">
        <div className="login-form-container">
          <h1>Admin Login</h1>
          <p>Access restricted to authorized personnel only</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

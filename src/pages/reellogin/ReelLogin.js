import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../../firebase/services";
import "./ReelLogin.css";

const ReelLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      // Use Firebase authentication
      const user = await signInAdmin(credentials.username, credentials.password);
      console.log("Login successful:", user);
      
      // Store authentication state
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userEmail", user.email);
      
      // Successful login - redirect to videoinfo page
      navigate("/videoinfo");
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific Firebase auth errors
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please check your username.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid username or password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reel-login-container">
      <div className="reel-login-wrapper">
        <div className="reel-login-card">
          <div className="reel-login-header">
            <h1>Reel Login</h1>
            <p>Access your video management dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reel-login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="reel-login-footer">
            <p>Use your admin credentials (username: admin, gallery, midnight, or sj)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelLogin;

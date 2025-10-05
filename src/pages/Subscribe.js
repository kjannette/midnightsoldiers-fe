import React, { useState } from "react";
import {
  saveSubscription,
  saveNewsletterSubscription,
} from "../firebase/services";
import "./Subscribe.css";

const Subscribe = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    telephone: "",
    email: "",
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [newsletterError, setNewsletterError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await saveSubscription(formData);
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        streetAddress: "",
        streetAddress2: "",
        city: "",
        state: "",
        telephone: "",
        email: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting subscription:", error);
      setSubmitError("Failed to submit subscription. Please try again.");

      // Hide error message after 5 seconds
      setTimeout(() => {
        setSubmitError("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsNewsletterSubmitting(true);
    setNewsletterError("");
    setNewsletterSuccess(false);

    try {
      await saveNewsletterSubscription(newsletterEmail);
      setNewsletterSuccess(true);
      setNewsletterEmail("");

      // Hide success message after 5 seconds
      setTimeout(() => {
        setNewsletterSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting newsletter subscription:", error);
      setNewsletterError(
        "Failed to subscribe to newsletter. Please try again."
      );

      // Hide error message after 5 seconds
      setTimeout(() => {
        setNewsletterError("");
      }, 5000);
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  return (
    <div className="subscribe">
      <div className="subscribe-container">
        <h1>SUBSCRIBE</h1>
        <p className="subscribe-description">
          Stay up-to-date on Midnight Soldiers news, artists, and events.
        </p>

        <form className="subscribe-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="streetAddress">Street Address</label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="(optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="streetAddress2">Street Address 2</label>
            <input
              type="text"
              id="streetAddress2"
              name="streetAddress2"
              value={formData.streetAddress2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="(optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="(optional)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telephone">Tel</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="(optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {submitSuccess && (
            <div
              className="success-message"
              style={{
                margin: "20px 0",
                padding: "10px",
                backgroundColor: "#d4edda",
                color: "#155724",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
              }}
            >
              ✅ Thank you for subscribing! We'll be in touch soon.
            </div>
          )}

          {submitError && (
            <div
              className="error-message"
              style={{
                margin: "20px 0",
                padding: "10px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
              }}
            >
              ❌ {submitError}
            </div>
          )}

          <div className="button-container">
            <button
              type="submit"
              className="subscribe-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </form>

        <div className="newsletter-divider"></div>

        <div className="newsletter-section">
          <p className="newsletter-description">
            Stay up-to-date on artists, news, and events.
            <br />
            Receive our weekly newsletter every Monday.
          </p>

          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <div className="form-group">
              <label htmlFor="newsletterEmail">Email *</label>
              <input
                type="email"
                id="newsletterEmail"
                name="newsletterEmail"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
            </div>

            {/* Newsletter Success/Error Messages */}
            {newsletterSuccess && (
              <div
                className="success-message"
                style={{
                  margin: "20px 0",
                  padding: "10px",
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  border: "1px solid #c3e6cb",
                  borderRadius: "4px",
                }}
              >
                ✅ Thank you for subscribing to our newsletter!
              </div>
            )}

            {newsletterError && (
              <div
                className="error-message"
                style={{
                  margin: "20px 0",
                  padding: "10px",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                }}
              >
                ❌ {newsletterError}
              </div>
            )}

            <div className="button-container">
              <button
                type="submit"
                className="subscribe-button"
                disabled={isNewsletterSubmitting}
              >
                {isNewsletterSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;

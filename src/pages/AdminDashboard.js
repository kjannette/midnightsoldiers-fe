import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllArtists,
  getAllSubscriptions,
  getAllContactForms,
  onAuthStateChange,
  signOutAdmin,
} from "../firebase/services";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("artists");
  const [artists, setArtists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [contactForms, setContactForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        navigate("/adminlogin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artistsData, subscriptionsData, contactFormsData] =
          await Promise.all([
            getAllArtists(),
            getAllSubscriptions(),
            getAllContactForms(),
          ]);

        setArtists(artistsData);
        setSubscriptions(subscriptionsData);
        setContactForms(contactFormsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const logout = async () => {
    try {
      await signOutAdmin();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-background"></div>
        <div className="admin-dashboard-content">
          <div className="loading-message">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-background"></div>
        <div className="admin-dashboard-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-background"></div>
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate("/artistinfo")}
              className="action-button primary"
            >
              Add New Artist
            </button>
            <button onClick={logout} className="action-button secondary">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Artists</h3>
            <div className="stat-number">{artists.length}</div>
          </div>
          <div className="stat-card">
            <h3>Subscriptions</h3>
            <div className="stat-number">{subscriptions.length}</div>
          </div>
          <div className="stat-card">
            <h3>Contact Forms</h3>
            <div className="stat-number">{contactForms.length}</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === "artists" ? "active" : ""}`}
            onClick={() => setActiveTab("artists")}
          >
            Artists ({artists.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "subscriptions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions ({subscriptions.length})
          </button>
          <button
            className={`tab-button ${activeTab === "contacts" ? "active" : ""}`}
            onClick={() => setActiveTab("contacts")}
          >
            Contact Forms ({contactForms.length})
          </button>
        </div>

        <div className="dashboard-content-area">
          {activeTab === "artists" && (
            <div className="data-section">
              <h2>Artists</h2>
              {artists.length === 0 ? (
                <p>No artists submitted yet.</p>
              ) : (
                <div className="data-table">
                  {artists.map((artist) => (
                    <div key={artist.id} className="data-card">
                      <div className="card-header">
                        <h3>{artist.artistName}</h3>
                        <small>Added: {formatDate(artist.createdAt)}</small>
                      </div>
                      <div className="card-content">
                        <p>
                          <strong>Exhibition:</strong> {artist.exhibitionName}
                        </p>
                        <p>
                          <strong>Dates:</strong> {artist.exhibitionStartDate} -{" "}
                          {artist.exhibitionEndDate}
                        </p>
                        <p>
                          <strong>Bio:</strong>{" "}
                          {artist.artistBio?.substring(0, 100)}...
                        </p>
                        <p>
                          <strong>Photos:</strong>{" "}
                          {artist.exemplaryWorksUrls?.length || 0} works
                        </p>
                        {artist.artistPhotoUrl && (
                          <p>
                            <strong>Profile Photo:</strong> ✓
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "subscriptions" && (
            <div className="data-section">
              <h2>Subscriptions</h2>
              {subscriptions.length === 0 ? (
                <p>No subscriptions yet.</p>
              ) : (
                <div className="data-table">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="data-card">
                      <div className="card-header">
                        <h3>
                          {subscription.type === "newsletter_only"
                            ? subscription.email
                            : `${subscription.firstName} ${subscription.lastName}`}
                        </h3>
                        <small>
                          Subscribed: {formatDate(subscription.createdAt)}
                        </small>
                      </div>
                      <div className="card-content">
                        <p>
                          <strong>Type:</strong> {subscription.type}
                        </p>
                        <p>
                          <strong>Email:</strong> {subscription.email}
                        </p>
                        {subscription.type === "full_subscription" && (
                          <>
                            <p>
                              <strong>Address:</strong>{" "}
                              {subscription.streetAddress}, {subscription.city},{" "}
                              {subscription.state}
                            </p>
                            <p>
                              <strong>Phone:</strong> {subscription.telephone}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="data-section">
              <h2>Contact Forms</h2>
              {contactForms.length === 0 ? (
                <p>No contact forms submitted yet.</p>
              ) : (
                <div className="data-table">
                  {contactForms.map((contact) => (
                    <div key={contact.id} className="data-card">
                      <div className="card-header">
                        <h3>{contact.name || contact.email}</h3>
                        <small>
                          Submitted: {formatDate(contact.createdAt)}
                        </small>
                      </div>
                      <div className="card-content">
                        <p>
                          <strong>Email:</strong> {contact.email}
                        </p>
                        <p>
                          <strong>Subject:</strong> {contact.subject}
                        </p>
                        <p>
                          <strong>Message:</strong> {contact.message}
                        </p>
                        <p>
                          <strong>Status:</strong> {contact.status || "unread"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


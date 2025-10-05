import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMidnightSoldiers } from "../firebase/services";
import "./Artists.css";

const Artists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBackground, setShowBackground] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsData = await getAllMidnightSoldiers();
        setArtists(artistsData);
      } catch (error) {
        console.error("Error fetching artists:", error);
        setError("Failed to load artists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Hide background gif and show content after 2 seconds
    const backgroundTimer = setTimeout(() => {
      setShowBackground(false);
      setShowContent(true);
    }, 2000);

    fetchArtists();

    // Cleanup timer on component unmount
    return () => {
      clearTimeout(backgroundTimer);
    };
  }, []);

  // Handle clicking on artist ID to navigate to ReelInfo page with populated data
  const handleArtistIdClick = (artist) => {
    // Store the artist data in sessionStorage so ReelInfo can access it
    sessionStorage.setItem("selectedArtist", JSON.stringify(artist));
    // Navigate to the reel info page
    navigate("/artistinfo");
  };

  if (loading) {
    return (
      <div className="artists">
        <div className="artists-content">
          <div className="artists-content-inner">
            <h1 className="">Artists</h1>
            <div className="loading-message">Loading artists...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artists">
        <div className="artists-content">
          <div className="artists-content-inner">
            <h1>Artists</h1>
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artists">
      {showBackground && <div className="artists-background"></div>}
      <div className="artists-content">
        <div className="artists-content-inner">
          <h1>Artists</h1>

          {!showContent ? (
            <div className="loading-message">Loading artists...</div>
          ) : artists.length === 0 ? (
            <div className="no-artists">
              <p>No artists have been added yet.</p>
            </div>
          ) : showContent ? (
            <div className="artists-grid">
              {artists.map((artist) => (
                <div key={artist.id} className="artist-card">
                  <div className="artist-header">
                    {artist.artistPhotoURL && (
                      <img
                        src={artist.artistPhotoURL}
                        alt={artist.artistName}
                        className="artist-photo"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="artist-info">
                      <h2 className="artist-name">{artist.artistName}</h2>
                      <div className="exhibition-info">
                        <h3 className="exhibition-name">
                          {artist.exhibitionName} –{" "}
                          <span className="exhibition-dates">
                            {new Date(
                              artist.exhibitionStartDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              artist.exhibitionEndDate
                            ).toLocaleDateString()}
                          </span>
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="artist-bio">
                    <p>{artist.artistBio}</p>
                  </div>

                  {artist.exemplaryWorksURLs &&
                    artist.exemplaryWorksURLs.length > 0 && (
                      <div className="artist-works">
                        <h4>Recent Works</h4>
                        <div className="works-gallery">
                          {artist.exemplaryWorksURLs.map((workUrl, index) => (
                            <img
                              key={index}
                              src={workUrl}
                              alt={`Work ${index + 1} by ${artist.artistName}`}
                              className="work-image"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Exiting Artists Section */}
          {showContent && artists.length > 0 && (
            <div className="exiting-artists-section">
              <h2>Exiting Artists</h2>
              <div className="exiting-artists-list">
                {artists.map((artist) => (
                  <div key={artist.id} className="exiting-artist-item">
                    <span className="exiting-artist-name">
                      {artist.artistName}
                    </span>
                    <button
                      className="exiting-artist-id-button"
                      onClick={() => handleArtistIdClick(artist)}
                      type="button"
                    >
                      {artist.id}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artists;

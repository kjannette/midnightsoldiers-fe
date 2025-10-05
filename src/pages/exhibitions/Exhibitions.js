import React, { useState, useEffect } from "react";
import { getAllArtists } from "../../firebase/services";
import "./Exhibitions.css";

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const artistsData = await getAllArtists();

        // Transform artist data into exhibition data
        const exhibitionData = artistsData.map((artist) => ({
          id: artist.id,
          name: artist.exhibitionName,
          artist: artist.artistName,
          artistBio: artist.artistBio,
          startDate: artist.exhibitionStartDate,
          endDate: artist.exhibitionEndDate,
          artistPhotoUrl: artist.artistPhotoUrl,
          worksUrls: artist.exemplaryWorksUrls || [],
          createdAt: artist.createdAt,
        }));

        // Sort by start date (most recent first)
        exhibitionData.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );

        setExhibitions(exhibitionData);
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
        setError("Failed to load exhibitions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const isCurrentExhibition = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const isUpcomingExhibition = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    return now < start;
  };

  if (loading) {
    return (
      <div className="exhibitions">
        <div className="exhibitions-background"></div>
        <div className="exhibitions-content">
          <div className="exhibitions-content-inner">
            <h1>Exhibitions</h1>
            <div className="loading-message">Loading exhibitions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exhibitions">
        <div className="exhibitions-background"></div>
        <div className="exhibitions-content">
          <div className="exhibitions-content-inner">
            <h1>Exhibitions</h1>
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentExhibitions = exhibitions.filter((ex) =>
    isCurrentExhibition(ex.startDate, ex.endDate)
  );
  const upcomingExhibitions = exhibitions.filter((ex) =>
    isUpcomingExhibition(ex.startDate)
  );
  const pastExhibitions = exhibitions.filter(
    (ex) =>
      !isCurrentExhibition(ex.startDate, ex.endDate) &&
      !isUpcomingExhibition(ex.startDate)
  );

  return (
    <div className="exhibitions">
      <div className="exhibitions-background"></div>
      <div className="exhibitions-content">
        <div className="exhibitions-content-inner">
          <h1>Exhibitions</h1>

          {exhibitions.length === 0 ? (
            <div className="no-exhibitions">
              <p>No exhibitions scheduled at this time.</p>
            </div>
          ) : (
            <>
              {/* Current Exhibitions */}
              {currentExhibitions.length > 0 && (
                <section className="exhibition-section">
                  <h2 className="section-title current">Current Exhibitions</h2>
                  <div className="exhibitions-grid">
                    {currentExhibitions.map((exhibition) => (
                      <div
                        key={exhibition.id}
                        className="exhibition-card current"
                      >
                        <div className="exhibition-status">Now Showing</div>
                        <div className="exhibition-header">
                          {exhibition.artistPhotoUrl && (
                            <img
                              src={exhibition.artistPhotoUrl}
                              alt={exhibition.artist}
                              className="artist-photo"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="exhibition-info">
                            <h3 className="exhibition-name">
                              {exhibition.name}
                            </h3>
                            <h4 className="artist-name">
                              by {exhibition.artist}
                            </h4>
                            <p className="exhibition-dates">
                              {new Date(
                                exhibition.startDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                exhibition.endDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="artist-bio">
                          <p>{exhibition.artistBio}</p>
                        </div>

                        {exhibition.worksUrls &&
                          exhibition.worksUrls.length > 0 && (
                            <div className="exhibition-works">
                              <h5>Featured Works</h5>
                              <div className="works-gallery">
                                {exhibition.worksUrls
                                  .slice(0, 3)
                                  .map((workUrl, index) => (
                                    <img
                                      key={index}
                                      src={workUrl}
                                      alt={`Work ${index + 1} from ${
                                        exhibition.name
                                      }`}
                                      className="work-image"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ))}
                                {exhibition.worksUrls.length > 3 && (
                                  <div className="more-works">
                                    +{exhibition.worksUrls.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Exhibitions */}
              {upcomingExhibitions.length > 0 && (
                <section className="exhibition-section">
                  <h2 className="section-title upcoming">
                    Upcoming Exhibitions
                  </h2>
                  <div className="exhibitions-grid">
                    {upcomingExhibitions.map((exhibition) => (
                      <div
                        key={exhibition.id}
                        className="exhibition-card upcoming"
                      >
                        <div className="exhibition-status">Coming Soon</div>
                        <div className="exhibition-header">
                          {exhibition.artistPhotoUrl && (
                            <img
                              src={exhibition.artistPhotoUrl}
                              alt={exhibition.artist}
                              className="artist-photo"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="exhibition-info">
                            <h3 className="exhibition-name">
                              {exhibition.name}
                            </h3>
                            <h4 className="artist-name">
                              by {exhibition.artist}
                            </h4>
                            <p className="exhibition-dates">
                              {new Date(
                                exhibition.startDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                exhibition.endDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="artist-bio">
                          <p>{exhibition.artistBio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Past Exhibitions */}
              {pastExhibitions.length > 0 && (
                <section className="exhibition-section">
                  <h2 className="section-title past">Past Exhibitions</h2>
                  <div className="exhibitions-grid">
                    {pastExhibitions.slice(0, 6).map((exhibition) => (
                      <div key={exhibition.id} className="exhibition-card past">
                        <div className="exhibition-header">
                          {exhibition.artistPhotoUrl && (
                            <img
                              src={exhibition.artistPhotoUrl}
                              alt={exhibition.artist}
                              className="artist-photo"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="exhibition-info">
                            <h3 className="exhibition-name">
                              {exhibition.name}
                            </h3>
                            <h4 className="artist-name">
                              by {exhibition.artist}
                            </h4>
                            <p className="exhibition-dates">
                              {new Date(
                                exhibition.startDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                exhibition.endDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pastExhibitions.length > 6 && (
                    <p className="more-exhibitions">
                      And {pastExhibitions.length - 6} more past exhibitions...
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exhibitions;

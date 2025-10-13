import React, { useState, useEffect } from "react";
import { getAllReels } from "../../firebase/services";
import "./News.css";

const News = () => {
  const [videoArray, setVideoArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Fetch videos from Firebase on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getAllReels();
        // Get only the latest 3 videos
        const latestVideos = data.slice(0, 3);
        setVideoArray(latestVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        // Set empty array on error to show no videos
        setVideoArray([]);
      }
    };

    fetchVideos();
  }, []);

  // Handle loading state and minimum loading time
  useEffect(() => {
    const minimumLoadingTime = 1500; // 1.5 seconds
    const startTime = Date.now();

    const handleLoadingComplete = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
        // Show content after a brief delay for smooth transition
        setTimeout(() => {
          setShowContent(true);
        }, 100);
      }, remainingTime);
    };

    // If videoArray is already populated (API call completed), start the timer
    if (videoArray.length > 0) {
      handleLoadingComplete();
    }
  }, [videoArray]);

  // Update loading text based on state
  const getLoadingText = () => {
    return "Loading News";
  };

  return (
    <div className="news">
      <div className={`news-background ${showContent ? 'hidden' : ''}`}></div>
      <div className="news-content">
        {isLoading ? (
          <div className="news-content-inner">
            <h1>News</h1>
            <p>{getLoadingText()}</p>
          </div>
        ) : (
          <div className={`video-container ${showContent ? 'visible' : ''}`}>
            {videoArray.map((video, index) => (
              <div key={video.id || index} className="video-item">
                <h2 className="video-title">{video.reelName || 'Untitled'}</h2>
                <div className="video-wrapper">
                  {video.reelVideoUrl ? (
                    <video
                      controls
                      className="news-video"
                      src={video.reelVideoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="video-placeholder">
                      <p>Video not available</p>
                    </div>
                  )}
                </div>
                <p className="video-description">
                  {video.reelDescription || 'No description available'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;

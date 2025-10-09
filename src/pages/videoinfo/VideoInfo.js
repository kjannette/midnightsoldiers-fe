import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./VideoInfo.css";
import { collection, setDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { uploadImageToStorage, getAllReels } from "../../firebase/services";
import { postReel } from "../../api/api";

const VideoInfo = () => {
  const [formData, setFormData] = useState({
    videoName: "",
    videoDescription: "",
    videoFile: null,
    videoUrl: "",
    id: null,
  });

  const [dragStates, setDragStates] = useState({
    videoFile: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentVideos, setCurrentVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoSize, setVideoSize] = useState(null);

  // Fetch current videos on component mount and check for selected video
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log("Fetching videos...");
        const videos = await getAllReels(); // Reusing the same function for now
        console.log("Fetched videos:", videos);
        setCurrentVideos(videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  // Handle clicking on video ID to populate form
  const handleVideoIdClick = (video) => {
    // Clear any existing errors and success messages
    setErrors({});
    setSubmitSuccess(false);

    // Populate form data with the video's existing data
    setFormData({
      videoName: video.reelName || "",
      videoDescription: video.reelDescription || "",
      videoFile: null, // Will be set to null since we're loading existing data
      // Store the existing URLs for reference
      videoUrl: video.reelVideoUrl || "",
      // Store the video ID so we can update instead of create
      id: video.id,
    });

    // Scroll to top of the form so user can see the populated data
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Method to calculate file size in MB
  const calculateFileSizeInMB = (file) => {
    const sizeInBytes = file.size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return parseFloat(sizeInMB);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle description character limit
    if (name === "videoDescription" && value.length > 2500) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDragOver = (e, fieldName) => {
    e.preventDefault();
    setDragStates((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleDragLeave = (e, fieldName) => {
    e.preventDefault();
    setDragStates((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDragStates((prev) => ({
      ...prev,
      [fieldName]: false,
    }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0], fieldName);
    }
  };

  const handleFileSelection = (file, fieldName) => {
    // Validate file type for video
    if (fieldName === "videoFile") {
      const allowedTypes = [
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/webm",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Please select a valid video file (MP4, MOV, AVI, WEBM)",
        }));
        return;
      }

      // Calculate and set file size
      const fileSizeInMB = calculateFileSizeInMB(file);
      setVideoSize(fileSizeInMB);

      // Check file size (limit to 100MB for videos)
      if (fileSizeInMB > 100) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Video file size must be less than 100MB",
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleFileInputChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file, fieldName);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.videoName.trim()) {
      newErrors.videoName = "Video name is required";
    }

    if (!formData.videoDescription.trim()) {
      newErrors.videoDescription = "Video description is required";
    }

    if (!formData.id && !formData.videoFile) {
      newErrors.videoFile = "Video file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress("Preparing submission...");

    try {
      let videoUrl = formData.videoUrl;

      // Upload video file if a new one was selected
      if (formData.videoFile) {
        setSubmitProgress("Uploading video file...");
        videoUrl = await uploadImageToStorage(formData.videoFile, "videos");
      }

      const videoData = {
        videoName: formData.videoName,
        videoDescription: formData.videoDescription,
        videoUrl: videoUrl,
        videoSize: videoSize,
        createdAt: formData.id ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.id) {
        // Update existing video
        setSubmitProgress("Updating video information...");
        const videoRef = doc(db, "reels", formData.id); // Using same collection for now
        await updateDoc(videoRef, videoData);
        console.log("Video updated successfully");
      } else {
        // Create new video
        setSubmitProgress("Saving video information...");
        const videoId = uuidv4();
        const videoRef = doc(db, "reels", videoId); // Using same collection for now
        await setDoc(videoRef, { ...videoData, id: videoId });
        console.log("Video created successfully");
      }

      // Send to backend API
      setSubmitProgress("Processing video...");
      const apiData = {
        reelName: formData.videoName,
        reelDescription: formData.videoDescription,
        reelVideoUrl: videoUrl,
        reelSize: videoSize,
      };

      const response = await postReel(apiData);
      console.log("Backend response:", response);

      setSubmitSuccess(true);
      setSubmitProgress("Video submitted successfully!");

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          videoName: "",
          videoDescription: "",
          videoFile: null,
          videoUrl: "",
          id: null,
        });
        setVideoSize(null);
        setSubmitSuccess(false);
        setSubmitProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting video:", error);
      setErrors({ submit: "Failed to submit video. Please try again." });
      setSubmitProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="video-info-container">
      <div className="video-info-header">
        <h1>Video Information</h1>
        <p>Upload and manage your video content</p>
      </div>

      <div className="video-info-content">
        <div className="video-form-section">
          <form onSubmit={handleSubmit} className="video-form">
            {/* Video Name */}
            <div className="form-group">
              <label htmlFor="videoName">Video Name *</label>
              <input
                type="text"
                id="videoName"
                name="videoName"
                value={formData.videoName}
                onChange={handleInputChange}
                placeholder="Enter video name"
                className={errors.videoName ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.videoName && (
                <span className="error-message">{errors.videoName}</span>
              )}
            </div>

            {/* Video Description */}
            <div className="form-group">
              <label htmlFor="videoDescription">
                Video Description *
                <span className="char-count">
                  ({formData.videoDescription.length}/2500)
                </span>
              </label>
              <textarea
                id="videoDescription"
                name="videoDescription"
                value={formData.videoDescription}
                onChange={handleInputChange}
                placeholder="Enter video description..."
                rows="6"
                className={errors.videoDescription ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.videoDescription && (
                <span className="error-message">{errors.videoDescription}</span>
              )}
            </div>

            {/* Video File Upload */}
            <div className="form-group">
              <label>Video File *</label>
              <div
                className={`file-upload-area ${
                  dragStates.videoFile ? "drag-over" : ""
                } ${errors.videoFile ? "error" : ""}`}
                onDragOver={(e) => handleDragOver(e, "videoFile")}
                onDragLeave={(e) => handleDragLeave(e, "videoFile")}
                onDrop={(e) => handleDrop(e, "videoFile")}
              >
                <input
                  type="file"
                  id="videoFile"
                  accept="video/*"
                  onChange={(e) => handleFileInputChange(e, "videoFile")}
                  className="file-input"
                  disabled={isSubmitting}
                />
                <div className="file-upload-content">
                  {formData.videoFile ? (
                    <div className="file-selected">
                      <span className="file-icon">🎬</span>
                      <span className="file-name">
                        {formData.videoFile.name}
                      </span>
                      {videoSize && (
                        <span className="file-size">({videoSize} MB)</span>
                      )}
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>
                        Drag & drop video file here or click to browse
                      </span>
                      <span className="file-types">
                        Supports: MP4, MOV, AVI, WEBM
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {errors.videoFile && (
                <span className="error-message">{errors.videoFile}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              {errors.submit && (
                <div className="error-message submit-error">
                  {errors.submit}
                </div>
              )}

              {submitProgress && (
                <div className="progress-message">{submitProgress}</div>
              )}

              {submitSuccess && (
                <div className="success-message">
                  ✅ Video submitted successfully!
                </div>
              )}

              <button
                type="submit"
                className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    {formData.id ? "Updating..." : "Submitting..."}
                  </>
                ) : formData.id ? (
                  "Update Video"
                ) : (
                  "Submit Video"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Current Videos List */}
        <div className="videos-list-section">
          <h2>Current Videos</h2>
          {loadingVideos ? (
            <div className="loading-message">Loading videos...</div>
          ) : currentVideos.length > 0 ? (
            <div className="videos-grid">
              {currentVideos.map((video) => (
                <div
                  key={video.id}
                  className="video-card"
                  onClick={() => handleVideoIdClick(video)}
                >
                  <div className="video-card-header">
                    <h3>{video.reelName || "Untitled Video"}</h3>
                    <span className="video-id">ID: {video.id}</span>
                  </div>
                  <div className="video-card-content">
                    <p>{video.reelDescription || "No description"}</p>
                    {video.reelVideoUrl && (
                      <div className="video-preview">
                        <span>📹 Video available</span>
                      </div>
                    )}
                  </div>
                  <div className="video-card-footer">
                    <span className="click-hint">Click to edit</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-videos-message">
              No videos found. Create your first video above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./ReelInfo.css";
import { collection, setDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  uploadImageToStorage,
  uploadMultipleImages,
  getAllMidnightSoldiers,
} from "../../firebase/services";

const ReelInfo = () => {
  const [formData, setFormData] = useState({
    artistName: "",
    artistBio: "",
    artistPhoto: null,
    artistPhotoURL: "",
    id: null,
  });

  const [dragStates, setDragStates] = useState({
    artistPhoto: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentArtists, setCurrentArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  // Fetch current artists on component mount and check for selected artist
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        console.log("Fetching artists...");
        const artists = await getAllMidnightSoldiers();
        console.log("Fetched artists:", artists);
        setCurrentArtists(artists);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, []);

  // Handle clicking on artist ID to populate form
  const handleArtistIdClick = (artist) => {
    // Clear any existing errors and success messages
    setErrors({});
    setSubmitSuccess(false);

    // Populate form data with the artist's existing data
    setFormData({
      artistName: artist.artistName || "",
      artistBio: artist.artistBio || "",
      artistPhoto: null, // Will be set to null since we're loading existing data
      // Store the existing URLs for reference
      artistPhotoURL: artist.artistPhotoURL || "",
      // Store the artist ID so we can update instead of create
      id: artist.id,
    });

    // Scroll to top of the form so user can see the populated data
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle bio character limit
    if (name === "artistBio" && value.length > 2500) {
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

    if (fieldName === "artistPhoto") {
      // Only accept one video file for reel video
      if (files.length > 0) {
        const file = files[0];
        const allowedVideoTypes = [
          "video/mp4",
          "video/quicktime",
          "video/x-msvideo",
        ];
        const allowedExtensions = [".mp4", ".mov", ".avi"];

        // Check file type and extension
        const fileExtension = file.name
          .toLowerCase()
          .substring(file.name.lastIndexOf("."));
        const isValidType =
          allowedVideoTypes.includes(file.type) ||
          allowedExtensions.includes(fileExtension);

        if (isValidType) {
          // Clear any previous errors
          setErrors((prev) => ({
            ...prev,
            artistPhoto: "",
          }));

          setFormData((prev) => ({
            ...prev,
            artistPhoto: file,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            artistPhoto: "Please select a valid video file (MP4, MOV, or AVI)",
          }));
        }
      }
    }
  };

  const handleFileInput = (e, fieldName) => {
    const files = Array.from(e.target.files);

    if (fieldName === "artistPhoto" && files.length > 0) {
      const file = files[0];
      const allowedVideoTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
      ];
      const allowedExtensions = [".mp4", ".mov", ".avi"];

      // Check file type and extension
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      const isValidType =
        allowedVideoTypes.includes(file.type) ||
        allowedExtensions.includes(fileExtension);

      if (!isValidType) {
        setErrors((prev) => ({
          ...prev,
          artistPhoto: "Please select a valid video file (MP4, MOV, or AVI)",
        }));
        return;
      }

      // Clear any previous errors
      setErrors((prev) => ({
        ...prev,
        artistPhoto: "",
      }));

      setFormData((prev) => ({
        ...prev,
        artistPhoto: file,
      }));
    }
  };

  const removeFile = (fieldName, index = null) => {
    if (fieldName === "artistPhoto") {
      setFormData((prev) => ({
        ...prev,
        artistPhoto: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.artistName.trim()) {
      newErrors.artistName = "Artist name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitProgress({ stage: "Validating...", progress: 0 });

    try {
      setSubmitSuccess(true);
      setSubmitProgress({ stage: "Success!", progress: 100 });

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          artistName: "",
          artistBio: "",
          artistPhoto: null,
          artistPhotoURL: "",
          id: null,
        });
        setSubmitSuccess(false);
        setSubmitProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting artist info:", error);
      setSubmitProgress({
        stage: "Error: " + (error.message || "Submission failed"),
        progress: 0,
        error: true,
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitProgress(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleFuckYouSubmit(e) {
    console.log("handleFuckYouSubmit was called");
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress({ stage: "Validating form...", progress: 10 });

    const uuidName = uuidv4();

    try {
      let artistPhotoURL = null;

      // Upload artist photo if provided
      if (formData.artistPhoto) {
        setSubmitProgress({ stage: "Uploading artist photo...", progress: 30 });
        const artistPhotoPath = `artists/${uuidName}/photo/${formData.artistPhoto.name}`;
        artistPhotoURL = await uploadImageToStorage(
          formData.artistPhoto,
          artistPhotoPath,
          (progress) => {
            setSubmitProgress({
              stage: "Uploading artist photo...",
              progress: 30 + progress * 0.3, // 30-60% of progress bar
            });
          }
        );
        console.log("Artist photo uploaded:", artistPhotoURL);
      }

      // Prepare data for Firestore
      setSubmitProgress({ stage: "Saving to database...", progress: 85 });
      const data = {
        artistName: formData.artistName,
        artistBio: formData.artistBio,
        artistPhotoURL: artistPhotoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const documentsRef = collection(db, "midnightsoldiers");
      await setDoc(doc(documentsRef, `${uuidName}`), data);

      setSubmitProgress({ stage: "Success!", progress: 100 });
      setSubmitSuccess(true);

      console.log("Artist data saved successfully with ID:", uuidName);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          artistName: "",
          artistBio: "",
          artistPhoto: null,
          artistPhotoURL: "",
          id: null,
        });
        setSubmitSuccess(false);
        setSubmitProgress(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving artist data:", err);
      setSubmitProgress({
        stage: "Error: " + (err.message || "Submission failed"),
        progress: 0,
        error: true,
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitProgress(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="artist-info">
      <div className="artist-info-background"></div>
      <div className="artist-info-content">
        <div className="form-header">
          <h1>Reel Information Form</h1>
        </div>

        <form className="artist-form">
          {/* Artist Name */}
          <div className="form-group">
            <label htmlFor="artistName">Reel Name *</label>
            <input
              type="text"
              id="artistName"
              name="artistName"
              value={formData.artistName}
              onChange={handleInputChange}
              className={errors.artistName ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.artistName && (
              <span className="error-text">{errors.artistName}</span>
            )}
          </div>

          {/* Artist Bio */}
          <div className="form-group">
            <label htmlFor="artistBio">
              Reel Description ({formData.artistBio.length}/2500 characters)
            </label>
            <textarea
              id="artistBio"
              name="artistBio"
              value={formData.artistBio}
              onChange={handleInputChange}
              rows="6"
              className={errors.artistBio ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.artistBio && (
              <span className="error-text">{errors.artistBio}</span>
            )}
          </div>

          {/* Reel Video */}
          <div className="form-group">
            <label>Reel Video File</label>
            <div
              className={`file-drop-zone ${
                dragStates.artistPhoto ? "drag-over" : ""
              } ${isSubmitting ? "disabled" : ""}`}
              onDragOver={(e) =>
                !isSubmitting && handleDragOver(e, "artistPhoto")
              }
              onDragLeave={(e) =>
                !isSubmitting && handleDragLeave(e, "artistPhoto")
              }
              onDrop={(e) => !isSubmitting && handleDrop(e, "artistPhoto")}
            >
              <input
                type="file"
                accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                onChange={(e) => handleFileInput(e, "artistPhoto")}
                style={{ display: "none" }}
                id="artistPhoto"
                disabled={isSubmitting}
              />
              <label htmlFor="artistPhoto" className="file-input-label">
                {formData.artistPhoto ? (
                  <div className="file-preview">
                    <span>{formData.artistPhoto.name}</span>
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={() => removeFile("artistPhoto")}
                        className="remove-file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="drop-message">
                    <p>Drag and drop a video file here or click to select</p>
                    <p className="file-formats">
                      Supported formats: MP4, MOV, AVI
                    </p>
                  </div>
                )}
              </label>
            </div>
            {errors.artistPhoto && (
              <span className="error-text">{errors.artistPhoto}</span>
            )}
          </div>

          {/* Progress Display */}
          {submitProgress && (
            <div
              className={`progress-container ${
                submitProgress.error ? "error" : ""
              }`}
            >
              <div className="progress-text">{submitProgress.stage}</div>
              {!submitProgress.error && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${submitProgress.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="success-message">
              ✅ Reel information submitted successfully to Firebase!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            onClick={handleFuckYouSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Reel Information"}
          </button>
        </form>

        {/* Current Artists Section */}
        <div className="current-artists-section">
          <h2>Current Reels</h2>
          {loadingArtists ? (
            <p>Loading reels...</p>
          ) : currentArtists.length === 0 ? (
            <p>No reels found.</p>
          ) : (
            <div className="artists-list">
              <p style={{ color: "white", marginBottom: "10px" }}>
                Found {currentArtists.length} reels:
              </p>
              {currentArtists.map((artist) => (
                <div key={artist.id} className="artist-item">
                  <span className="artist-name">{artist.artistName}</span>
                  <span className="artist-separator">.</span>
                  <button
                    className="artist-id-button"
                    onClick={() => handleArtistIdClick(artist)}
                    type="button"
                  >
                    {artist.id}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelInfo;

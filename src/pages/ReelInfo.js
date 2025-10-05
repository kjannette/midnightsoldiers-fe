import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./ReelInfo.css";
import { collection, setDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  uploadImageToStorage,
  uploadMultipleImages,
  getAllMidnightSoldiers,
} from "../firebase/services";
const ReelInfo = () => {
  const [formData, setFormData] = useState({
    artistName: "",
    artistBio: "",
    facebookProfile: "",
    twitterProfile: "",
    instagramProfile: "",
    otherProfile: "",
    artistPhoto: null,
    exhibitionName: "",
    exhibitionStartDate: "",
    exhibitionEndDate: "",
    exemplaryWorks: [],
    artistPhotoURL: "",
    exemplaryWorksURLs: [],
    id: null,
  });

  const [dragStates, setDragStates] = useState({
    artistPhoto: false,
    exemplaryWorks: false,
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

    // Check if there's a selected artist from sessionStorage
    const selectedArtistData = sessionStorage.getItem("selectedArtist");
    if (selectedArtistData) {
      try {
        const artist = JSON.parse(selectedArtistData);
        handleArtistIdClick(artist);
        // Clear the sessionStorage after using it
        sessionStorage.removeItem("selectedArtist");
      } catch (error) {
        console.error("Error parsing selected artist data:", error);
      }
    }

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
      facebookProfile: artist.facebookProfile || "",
      twitterProfile: artist.twitterProfile || "",
      instagramProfile: artist.instagramProfile || "",
      otherProfile: artist.otherProfile || "",
      artistPhoto: null, // Will be set to null since we're loading existing data
      exhibitionName: artist.exhibitionName || "",
      exhibitionStartDate: artist.exhibitionStartDate || "",
      exhibitionEndDate: artist.exhibitionEndDate || "",
      exemplaryWorks: [], // Will be set to empty since we're loading existing data
      // Store the existing URLs for reference
      artistPhotoURL: artist.artistPhotoURL || "",
      exemplaryWorksURLs: artist.exemplaryWorksURLs || [],
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
      // Only accept one file for artist photo
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        setFormData((prev) => ({
          ...prev,
          artistPhoto: files[0],
        }));
      }
    } else if (fieldName === "exemplaryWorks") {
      // Accept up to 5 files for exemplary works
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const currentWorks = formData.exemplaryWorks || [];
      const totalFiles = currentWorks.length + imageFiles.length;

      if (totalFiles <= 5) {
        setFormData((prev) => ({
          ...prev,
          exemplaryWorks: [...currentWorks, ...imageFiles],
        }));
      } else {
        const remainingSlots = 5 - currentWorks.length;
        setFormData((prev) => ({
          ...prev,
          exemplaryWorks: [
            ...currentWorks,
            ...imageFiles.slice(0, remainingSlots),
          ],
        }));
      }
    }
  };

  const handleFileInput = (e, fieldName) => {
    const files = Array.from(e.target.files);

    if (fieldName === "artistPhoto" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        artistPhoto: files[0],
      }));
    } else if (fieldName === "exemplaryWorks") {
      const currentWorks = formData.exemplaryWorks || [];
      const totalFiles = currentWorks.length + files.length;

      if (totalFiles <= 5) {
        setFormData((prev) => ({
          ...prev,
          exemplaryWorks: [...currentWorks, ...files],
        }));
      } else {
        const remainingSlots = 5 - currentWorks.length;
        setFormData((prev) => ({
          ...prev,
          exemplaryWorks: [...currentWorks, ...files.slice(0, remainingSlots)],
        }));
      }
    }
  };

  const removeFile = (fieldName, index = null) => {
    if (fieldName === "artistPhoto") {
      setFormData((prev) => ({
        ...prev,
        artistPhoto: null,
      }));
    } else if (fieldName === "exemplaryWorks" && index !== null) {
      setFormData((prev) => ({
        ...prev,
        exemplaryWorks: prev.exemplaryWorks.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    if (!formData.artistName.trim()) {
      newErrors.artistName = "Artist name is required";
    }

    if (!formData.artistBio.trim()) {
      newErrors.artistBio = "Artist bio is required";
    }

    if (!formData.exhibitionName.trim()) {
      newErrors.exhibitionName = "Exhibition name is required";
    }

    if (!formData.exhibitionStartDate) {
      newErrors.exhibitionStartDate = "Exhibition start date is required";
    } else {
      // Check if start date is in the past
      const startDate = new Date(formData.exhibitionStartDate);
      if (startDate < today) {
        newErrors.exhibitionStartDate =
          "Exhibition start date cannot be in the past";
      }
    }

    if (!formData.exhibitionEndDate) {
      newErrors.exhibitionEndDate = "Exhibition end date is required";
    }

    if (formData.exhibitionStartDate && formData.exhibitionEndDate) {
      const startDate = new Date(formData.exhibitionStartDate);
      const endDate = new Date(formData.exhibitionEndDate);

      if (endDate <= startDate) {
        newErrors.exhibitionEndDate = "End date must be after start date";
      }
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
          facebookProfile: "",
          twitterProfile: "",
          instagramProfile: "",
          otherProfile: "",
          artistPhoto: null,
          exhibitionName: "",
          exhibitionStartDate: "",
          exhibitionEndDate: "",
          exemplaryWorks: [],
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
      let exemplaryWorksURLs = [];

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

      // Upload exemplary works if provided
      if (formData.exemplaryWorks && formData.exemplaryWorks.length > 0) {
        setSubmitProgress({
          stage: "Uploading artwork images...",
          progress: 60,
        });
        const worksBasePath = `artists/${uuidName}/works/`;
        exemplaryWorksURLs = await uploadMultipleImages(
          formData.exemplaryWorks,
          worksBasePath,
          (progress) => {
            setSubmitProgress({
              stage: "Uploading artwork images...",
              progress: 60 + progress * 0.25, // 60-85% of progress bar
            });
          }
        );
        console.log("Exemplary works uploaded:", exemplaryWorksURLs);
      }

      // Prepare data for Firestore
      setSubmitProgress({ stage: "Saving to database...", progress: 85 });
      const data = {
        artistName: formData.artistName,
        artistBio: formData.artistBio,
        facebookProfile: formData.facebookProfile,
        twitterProfile: formData.twitterProfile,
        instagramProfile: formData.instagramProfile,
        otherProfile: formData.otherProfile,
        exhibitionName: formData.exhibitionName,
        exhibitionStartDate: formData.exhibitionStartDate,
        exhibitionEndDate: formData.exhibitionEndDate,
        artistPhotoURL: artistPhotoURL,
        exemplaryWorksURLs: exemplaryWorksURLs,
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
          facebookProfile: "",
          twitterProfile: "",
          instagramProfile: "",
          otherProfile: "",
          artistPhoto: null,
          exhibitionName: "",
          exhibitionStartDate: "",
          exhibitionEndDate: "",
          exemplaryWorks: [],
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
          <h1>Artist Information Form</h1>
        </div>

        <form className="artist-form">
          {/* Artist Name */}
          <div className="form-group">
            <label htmlFor="artistName">Artist Name *</label>
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
              Artist Bio * ({formData.artistBio.length}/2500 characters)
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

          {/* Social Media Profiles */}
          <div className="form-group">
            <label htmlFor="facebookProfile">Facebook Profile Link</label>
            <input
              type="url"
              id="facebookProfile"
              name="facebookProfile"
              value={formData.facebookProfile}
              onChange={handleInputChange}
              placeholder="https://www.facebook.com/artist-profile"
              className={errors.facebookProfile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.facebookProfile && (
              <span className="error-text">{errors.facebookProfile}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="twitterProfile">Twitter Profile Link</label>
            <input
              type="url"
              id="twitterProfile"
              name="twitterProfile"
              value={formData.twitterProfile}
              onChange={handleInputChange}
              placeholder="https://twitter.com/artist-handle"
              className={errors.twitterProfile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.twitterProfile && (
              <span className="error-text">{errors.twitterProfile}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="instagramProfile">Instagram Profile Link</label>
            <input
              type="url"
              id="instagramProfile"
              name="instagramProfile"
              value={formData.instagramProfile}
              onChange={handleInputChange}
              placeholder="https://www.instagram.com/artist-handle"
              className={errors.instagramProfile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.instagramProfile && (
              <span className="error-text">{errors.instagramProfile}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="otherProfile">Other Profile Link</label>
            <input
              type="url"
              id="otherProfile"
              name="otherProfile"
              value={formData.otherProfile}
              onChange={handleInputChange}
              placeholder="https://artist-website.com or other social media"
              className={errors.otherProfile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.otherProfile && (
              <span className="error-text">{errors.otherProfile}</span>
            )}
          </div>

          {/* Artist Photo */}
          <div className="form-group">
            <label>Artist Personal Photograph</label>
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
                accept="image/*"
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
                    <p>Drag and drop an image here or click to select</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Exhibition Name */}
          <div className="form-group">
            <label htmlFor="exhibitionName">Exhibition Name *</label>
            <input
              type="text"
              id="exhibitionName"
              name="exhibitionName"
              value={formData.exhibitionName}
              onChange={handleInputChange}
              className={errors.exhibitionName ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.exhibitionName && (
              <span className="error-text">{errors.exhibitionName}</span>
            )}
          </div>

          {/* Exhibition Dates */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exhibitionStartDate">
                Exhibition Start Date *
              </label>
              <input
                type="date"
                id="exhibitionStartDate"
                name="exhibitionStartDate"
                value={formData.exhibitionStartDate}
                onChange={handleInputChange}
                className={errors.exhibitionStartDate ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.exhibitionStartDate && (
                <span className="error-text">{errors.exhibitionStartDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="exhibitionEndDate">Exhibition End Date *</label>
              <input
                type="date"
                id="exhibitionEndDate"
                name="exhibitionEndDate"
                value={formData.exhibitionEndDate}
                onChange={handleInputChange}
                className={errors.exhibitionEndDate ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.exhibitionEndDate && (
                <span className="error-text">{errors.exhibitionEndDate}</span>
              )}
            </div>
          </div>

          {/* Exemplary Works */}
          <div className="form-group">
            <label>Exemplary Works (Up to 5 images)</label>
            <div
              className={`file-drop-zone multiple ${
                dragStates.exemplaryWorks ? "drag-over" : ""
              } ${isSubmitting ? "disabled" : ""}`}
              onDragOver={(e) =>
                !isSubmitting && handleDragOver(e, "exemplaryWorks")
              }
              onDragLeave={(e) =>
                !isSubmitting && handleDragLeave(e, "exemplaryWorks")
              }
              onDrop={(e) => !isSubmitting && handleDrop(e, "exemplaryWorks")}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileInput(e, "exemplaryWorks")}
                style={{ display: "none" }}
                id="exemplaryWorks"
                disabled={isSubmitting}
              />
              <label htmlFor="exemplaryWorks" className="file-input-label">
                {formData.exemplaryWorks.length > 0 ? (
                  <div className="files-preview">
                    {formData.exemplaryWorks.map((file, index) => (
                      <div key={index} className="file-preview">
                        <span>{file.name}</span>
                        {!isSubmitting && (
                          <button
                            type="button"
                            onClick={() => removeFile("exemplaryWorks", index)}
                            className="remove-file"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.exemplaryWorks.length < 5 && !isSubmitting && (
                      <div className="add-more">+ Add more images</div>
                    )}
                  </div>
                ) : (
                  <div className="drop-message">
                    <p>Drag and drop up to 5 images here or click to select</p>
                  </div>
                )}
              </label>
            </div>
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
              ✅ Artist information submitted successfully to Firebase!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            onClick={handleFuckYouSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Artist Information"}
          </button>
        </form>

        {/* Current Artists Section */}
        <div className="current-artists-section">
          <h2>Current Artists</h2>
          {loadingArtists ? (
            <p>Loading artists...</p>
          ) : currentArtists.length === 0 ? (
            <p>No artists found.</p>
          ) : (
            <div className="artists-list">
              <p style={{ color: "white", marginBottom: "10px" }}>
                Found {currentArtists.length} artists:
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

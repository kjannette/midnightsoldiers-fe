import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./ReelInfo.css";
import { collection, setDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { uploadImageToStorage, getAllReels } from "../../firebase/services";
import { postReel } from "../../api/api";

// Import API URL configuration
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_DEV || "http://localhost:3200"
    : process.env.REACT_APP_API_PROD || "https://www.midnightsoldiers.com:3200";

const ReelInfo = () => {
  const [formData, setFormData] = useState({
    reelName: "",
    reelDescription: "",
    reelVideo: null,
    reelVideoUrl: "",
    id: null,
  });

  const [dragStates, setDragStates] = useState({
    reelVideo: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentreels, setCurrentreels] = useState([]);
  const [loadingreels, setLoadingreels] = useState(true);
  const [reelSize, setReelSize] = useState(null);

  // Fetch current reels on component mount and check for selected reel
  useEffect(() => {
    const fetchreels = async () => {
      try {
        console.log("Fetching reels...");
        const reels = await getAllReels();
        console.log("Fetched reels:", reels);
        setCurrentreels(reels);
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        setLoadingreels(false);
      }
    };

    fetchreels();
  }, []);

  // Handle clicking on reel ID to populate form
  const handlereelIdClick = (reel) => {
    // Clear any existing errors and success messages
    setErrors({});
    setSubmitSuccess(false);

    // Populate form data with the reel's existing data
    setFormData({
      reelName: reel.reelName || "",
      reelDescription: reel.reelDescription || "",
      reelVideo: null, // Will be set to null since we're loading existing data
      // Store the existing URLs for reference
      reelVideoUrl: reel.reelVideoUrl || "",
      // Store the reel ID so we can update instead of create
      id: reel.id,
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

    // Handle description character limit (Instagram limit is 2200)
    if (name === "reelDescription" && value.length > 2200) {
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

    if (fieldName === "reelVideo") {
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
          // Calculate and store file size
          const fileSizeInMB = calculateFileSizeInMB(file);
          setReelSize(fileSizeInMB);
          console.log(`Reel video file size: ${fileSizeInMB} MB`);

          // Clear any previous errors
          setErrors((prev) => ({
            ...prev,
            reelVideo: "",
          }));

          setFormData((prev) => ({
            ...prev,
            reelVideo: file,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            reelVideo: "Please select a valid video file (MP4, MOV, or AVI)",
          }));
        }
      }
    }
  };

  const handleFileInput = (e, fieldName) => {
    const files = Array.from(e.target.files);

    if (fieldName === "reelVideo" && files.length > 0) {
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
          reelVideo: "Please select a valid video file (MP4, MOV, or AVI)",
        }));
        return;
      }

      // Calculate and store file size
      const fileSizeInMB = calculateFileSizeInMB(file);
      setReelSize(fileSizeInMB);
      console.log(`Reel video file size: ${fileSizeInMB} MB`);

      // Clear any previous errors
      setErrors((prev) => ({
        ...prev,
        reelVideo: "",
      }));

      setFormData((prev) => ({
        ...prev,
        reelVideo: file,
      }));
    }
  };

  const removeFile = (fieldName, index = null) => {
    if (fieldName === "reelVideo") {
      setFormData((prev) => ({
        ...prev,
        reelVideo: null,
      }));
      // Clear the file size when file is removed
      setReelSize(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reelName.trim()) {
      newErrors.reelName = "reel name is required";
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
          reelName: "",
          reelDescription: "",
          reelVideo: null,
          reelVideoUrl: "",
          id: null,
        });
        setReelSize(null); // Clear file size
        setSubmitSuccess(false);
        setSubmitProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting reel info:", error);
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
      let reelVideoUrl = null;

      // Upload reel photo if provided
      if (formData.reelVideo) {
        setSubmitProgress({ stage: "Uploading reel video...", progress: 30 });
        const reelVideoPath = `reels/${uuidName}/photo/${formData.reelVideo.name}`;
        reelVideoUrl = await uploadImageToStorage(
          formData.reelVideo,
          reelVideoPath,
          (progress) => {
            setSubmitProgress({
              stage: "Uploading reel video...",
              progress: 30 + progress * 0.3, // 30-60% of progress bar
            });
          }
        );
        console.log("Reel video uploaded:", reelVideoUrl);
      }

      // Prepare data for Firestore
      setSubmitProgress({ stage: "Saving to database...", progress: 85 });
      const data = {
        reelName: formData.reelName,
        reelDescription: formData.reelDescription,
        reelVideoUrl: reelVideoUrl,
        reelSize: reelSize,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore with error handling
      try {
        const documentsRef = collection(db, "midnightsoldiers");
        await setDoc(doc(documentsRef, `${uuidName}`), data);
        console.log("Successfully saved to Firebase:", uuidName);
      } catch (firebaseError) {
        console.error("Firebase save error:", firebaseError);
        throw new Error(
          `Failed to save to database: ${firebaseError.message}`
        );
      }

      // Send reel data to backend API for social media posting
      setSubmitProgress({ stage: "Posting to social media...", progress: 90 });
      try {
        // Send PUT request to trigger Facebook and Instagram posting
        const socialMediaData = {
          reelName: formData.reelName,
          reelDescription: formData.reelDescription,
          reelVideoUrl: reelVideoUrl,
          reelSize: reelSize,
          reelId: uuidName,
        };

        const putResponse = await fetch(
          `${apiUrl}/api/post-to-social/${uuidName}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(socialMediaData),
          }
        );

        if (putResponse.ok) {
          const putResult = await putResponse.json();
          console.log("Social media posting initiated:", putResult);
        } else {
          console.error(
            "Failed to initiate social media posting:",
            putResponse.statusText
          );
        }
      } catch (apiError) {
        console.error("Error sending reel data to backend:", apiError);
        // Continue with success even if API call fails (Firebase save succeeded)
      }

      setSubmitProgress({ stage: "Success!", progress: 100 });
      setSubmitSuccess(true);

      console.log("Reel data saved successfully with ID:", uuidName);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          reelName: "",
          reelDescription: "",
          reelVideo: null,
          reelVideoUrl: "",
          id: null,
        });
        setReelSize(null); // Clear file size
        setSubmitSuccess(false);
        setSubmitProgress(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving reel data:", err);
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
    <div className="reel-info">
      <div className="reel-info-background"></div>
      <div className="reel-info-content">
        <div className="form-header">
          <h1>Reel Information Form</h1>
        </div>

        <form className="reel-form">
          {/* reel Name */}
          <div className="form-group">
            <label htmlFor="reelName">Reel Name *</label>
            <input
              type="text"
              id="reelName"
              name="reelName"
              value={formData.reelName}
              onChange={handleInputChange}
              className={errors.reelName ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.reelName && (
              <span className="error-text">{errors.reelName}</span>
            )}
          </div>

          {/* reel Bio */}
          <div className="form-group">
            <label htmlFor="reelDescription">
              Reel Description ({formData.reelDescription.length}/2200
              characters)
            </label>
            <textarea
              id="reelDescription"
              name="reelDescription"
              value={formData.reelDescription}
              onChange={handleInputChange}
              rows="6"
              className={errors.reelDescription ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.reelDescription && (
              <span className="error-text">{errors.reelDescription}</span>
            )}
          </div>

          {/* Reel Video */}
          <div className="form-group">
            <label>Reel Video File</label>
            <div
              className={`file-drop-zone ${
                dragStates.reelVideo ? "drag-over" : ""
              } ${isSubmitting ? "disabled" : ""}`}
              onDragOver={(e) =>
                !isSubmitting && handleDragOver(e, "reelVideo")
              }
              onDragLeave={(e) =>
                !isSubmitting && handleDragLeave(e, "reelVideo")
              }
              onDrop={(e) => !isSubmitting && handleDrop(e, "reelVideo")}
            >
              <input
                type="file"
                accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                onChange={(e) => handleFileInput(e, "reelVideo")}
                style={{ display: "none" }}
                id="reelVideo"
                disabled={isSubmitting}
              />
              <label htmlFor="reelVideo" className="file-input-label">
                {formData.reelVideo ? (
                  <div className="file-preview">
                    <span>{formData.reelVideo.name}</span>
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={() => removeFile("reelVideo")}
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
            {errors.reelVideo && (
              <span className="error-text">{errors.reelVideo}</span>
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
              Reel information submitted successfully to Firebase!
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

        {/* Current reels Section */}
        <div className="current-reels-section">
          <h2>Current Reels</h2>
          {loadingreels ? (
            <p>Loading reels...</p>
          ) : currentreels.length === 0 ? (
            <p>No reels found.</p>
          ) : (
            <div className="reels-list">
              <p style={{ color: "white", marginBottom: "10px" }}>
                Found {currentreels.length} reels:
              </p>
              {currentreels.map((reel) => (
                <div key={reel.id} className="reel-item">
                  <span className="reel-name">{reel.reelName}</span>
                  <span className="reel-separator">.</span>
                  <button
                    className="reel-id-button"
                    onClick={() => handlereelIdClick(reel)}
                    type="button"
                  >
                    {reel.id}
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

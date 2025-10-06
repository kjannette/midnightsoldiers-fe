import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  setDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage, auth } from "./config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
/**
 * Upload a single image to Firebase Cloud Storage
 * @param {File} file - The image file to upload
 * @param {string} path - The storage path (e.g., 'artists/picasso/photo.jpg')
 * @param {function} onProgress - Optional callback for upload progress
 * @returns {Promise<string>} - Returns the download URL
 */
export const uploadImageToStorage = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);

    if (onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Upload multiple images to Firebase Cloud Storage
 * @param {File[]} files - Array of image files to upload
 * @param {string} basePath - Base storage path (e.g., 'artists/picasso/works/')
 * @param {function} onProgress - Optional callback for overall progress
 * @returns {Promise<string[]>} - Returns array of download URLs
 */
export const uploadMultipleImages = async (
  files,
  basePath,
  onProgress = null
) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Create unique filename to prevent conflicts
      const timestamp = Date.now();
      const fileName = `${timestamp}_${index}_${file.name}`;
      const path = `${basePath}${fileName}`;

      return uploadImageToStorage(file, path, (progress) => {
        if (onProgress) {
          // Calculate overall progress across all files
          const overallProgress =
            ((index + progress / 100) / files.length) * 100;
          onProgress(Math.min(overallProgress, 100));
        }
      });
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

/**
 * Save artist information to Firestore
 * @param {Object} artistData - The artist data object
 * @returns {Promise<string>} - Returns the document ID
 */

/*
export const saveArtistToFirestore = async (artistData) => {
  console.log("artistData", artistData);
  try {
    const docRef = await addDoc(collection(db, "midnightsoldiers"), {
      ...artistData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Artist document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding artist document: ", error);
    throw error;
  }
};
*/

/**
 * Get all artists from Firestore (for future use)
 * @returns {Promise<Array>} - Returns array of artist documents
 */
export const getAllArtists = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "midnightsoldiers"));
    const artists = [];
    querySnapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });
    return artists;
  } catch (error) {
    console.error("Error getting artists:", error);
    throw error;
  }
};

/**
 * Get all artists from the 'midnightsoldiers' collection
 * @returns {Promise<Array>} - Returns array of artist documents from midnightsoldiers collection
 */
export const getAllMidnightSoldiers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "midnightsoldiers"));
    const artists = [];
    querySnapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });

    // Sort by exhibition start date (chronological order)
    artists.sort((a, b) => {
      const dateA = new Date(a.exhibitionStartDate || "9999-12-31");
      const dateB = new Date(b.exhibitionStartDate || "9999-12-31");
      return dateA - dateB;
    });

    return artists;
  } catch (error) {
    console.error("Error getting midnight soldiers:", error);
    throw error;
  }
};

// ===== AUTHENTICATION SERVICES =====

/**
 * Test Firebase configuration and authentication setup
 * @returns {Promise<Object>} - Returns configuration status
 */
export const testFirebaseConfig = async () => {
  try {
    console.log("Testing Firebase configuration...");
    console.log("Auth object:", auth);
    console.log("Auth app:", auth?.app);
    console.log("Auth app options:", auth?.app?.options);
    console.log("Project ID:", auth?.app?.options?.projectId);
    console.log("Auth domain:", auth?.app?.options?.authDomain);
    console.log("API Key:", auth?.app?.options?.apiKey);

    // Test if we can access the auth service
    const currentUser = auth.currentUser;
    console.log("Current user:", currentUser);

    return {
      success: true,
      authInitialized: !!auth,
      appInitialized: !!auth?.app,
      projectId: auth?.app?.options?.projectId,
      authDomain: auth?.app?.options?.authDomain,
      currentUser: currentUser,
    };
  } catch (error) {
    console.error("Firebase configuration test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Username to email mapping for admin accounts
const adminUserMap = {
  admin: "sj@sjdev.co",
  gallery: "sj@sjdev.co",
  midnight: "sj@sjdev.co",
  sj: "sj@sjdev.co",
};

/**
 * Sign in admin user with username/email and password
 * @param {string} usernameOrEmail - Admin username or email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - Returns user object
 */
export const signInAdmin = async (usernameOrEmail, password) => {
  try {
    // Check if Firebase Auth is properly initialized
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    // Check if it's a username that needs to be mapped to an email
    let emailToUse = usernameOrEmail;

    // If it doesn't contain @ symbol, treat it as a username and map it
    if (!usernameOrEmail.includes("@")) {
      const mappedEmail = adminUserMap[usernameOrEmail.toLowerCase()];
      if (mappedEmail) {
        emailToUse = mappedEmail;
      } else {
        // If username not found in mapping, throw error
        const error = new Error("User not found");
        error.code = "auth/user-not-found";
        throw error;
      }
    }

    console.log("Attempting to sign in with email:", emailToUse);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailToUse,
      password
    );

    console.log("Sign in successful:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);

    // Handle configuration errors specifically
    if (error.code === "auth/configuration-not-found") {
      console.error(
        "Firebase Authentication is not properly configured. Please check:"
      );
      console.error(
        "1. Firebase Authentication is enabled in the Firebase console"
      );
      console.error("2. Email/Password provider is enabled");
      console.error("3. Firebase project configuration is correct");
    }

    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Create a new admin user (for initial setup)
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - Returns user object
 */
export const createAdminUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// ===== SUBSCRIPTION SERVICES =====

/**
 * Save subscription data to Firestore
 * @param {Object} subscriptionData - The subscription form data
 * @returns {Promise<string>} - Returns the document ID
 */
export const saveSubscription = async (subscriptionData) => {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      type: "full_subscription",
    });

    console.log("Subscription document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding subscription document: ", error);
    throw error;
  }
};

/**
 * Save newsletter subscription to Firestore
 * @param {string} email - Newsletter email
 * @returns {Promise<string>} - Returns the document ID
 */
export const saveNewsletterSubscription = async (email) => {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      email: email,
      createdAt: serverTimestamp(),
      type: "newsletter_only",
    });

    console.log("Newsletter subscription written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding newsletter subscription: ", error);
    throw error;
  }
};

/**
 * Get all subscriptions from Firestore
 * @returns {Promise<Array>} - Returns array of subscription documents
 */
export const getAllSubscriptions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "subscriptions"));
    const subscriptions = [];
    querySnapshot.forEach((doc) => {
      subscriptions.push({ id: doc.id, ...doc.data() });
    });
    return subscriptions;
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    throw error;
  }
};

// ===== CONTACT FORM SERVICES =====

/**
 * Save contact form submission to Firestore
 * @param {Object} contactData - The contact form data
 * @returns {Promise<string>} - Returns the document ID
 */
export const saveContactForm = async (contactData) => {
  try {
    const docRef = await addDoc(collection(db, "contact_forms"), {
      ...contactData,
      createdAt: serverTimestamp(),
      status: "unread",
    });

    console.log("Contact form written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding contact form: ", error);
    throw error;
  }
};

/**
 * Get all contact form submissions
 * @returns {Promise<Array>} - Returns array of contact form documents
 */
export const getAllContactForms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "contact_forms"));
    const contacts = [];
    querySnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    return contacts;
  } catch (error) {
    console.error("Error getting contact forms:", error);
    throw error;
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser } from '../firebase/services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage for existing auth state on mount
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    const storedEmail = sessionStorage.getItem('userEmail');
    
    if (storedAuth === 'true' && storedEmail) {
      setIsAuthenticated(true);
      setUser({ email: storedEmail });
    }

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUser(firebaseUser);
        // Sync with sessionStorage
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userEmail', firebaseUser.email);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // Clear sessionStorage
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userEmail');
      }
      setLoading(false);
    });

    // If no Firebase user after initial check, finish loading
    setTimeout(() => setLoading(false), 1000);

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userEmail', userData.email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


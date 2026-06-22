import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default token headers
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auction_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('auction_token');
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auction_token');
      if (token) {
        setAuthHeader(token);
        try {
          const response = await axios.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            setAuthHeader(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register User
  const register = async (name, email, password, role) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password, role });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        setAuthHeader(token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Signup failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error occurred during registration',
      };
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        setAuthHeader(token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Invalid response format' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error occurred during login',
      };
    }
  };

  // Logout User
  const logout = () => {
    setAuthHeader(null);
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (name, password) => {
    try {
      const response = await axios.put('/auth/profile', { name, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        setAuthHeader(token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error occurred during profile update',
      };
    }
  };

  // Manage Watchlist
  const toggleWatchlist = async (productId) => {
    if (!user) return { success: false, message: 'Must be logged in' };
    try {
      const response = await axios.post(`/auth/watchlist/${productId}`);
      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          watchlist: response.data.watchlist,
        }));
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Failed to update watchlist' };
    } catch (err) {
      return { success: false, message: 'Error updating watchlist' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        toggleWatchlist,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

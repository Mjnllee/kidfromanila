import React, { createContext, useState, useContext, useEffect } from 'react';
import FirebaseService from '../services/firebaseService';

// Create the Auth Context
const AuthContext = createContext({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  register: () => {},
  login: () => {},
  logout: () => {},
  clearError: () => {},
});

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        setIsLoading(true);
        const { user } = await FirebaseService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAuth();
  }, []);
  
  // Register new user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await FirebaseService.registerUser(userData);
      
      if (result.error) {
        setError(result.error);
        return false;
      }
      
      // Auto-login after registration
      await login(userData.email, userData.password);
      return true;
    } catch (error) {
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await FirebaseService.loginUser(email, password);
      
      if (result.error) {
        setError(result.error);
        return false;
      }
      
      setUser(result.user);
      return {success: true, user: result.user};
    } catch (error) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      await FirebaseService.logoutUser();
      setUser(null);
      return true;
    } catch (error) {
      setError('Logout failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear any error messages
  const clearError = () => {
    setError(null);
  };
  
  // The context value
  const contextValue = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    error,
    register,
    login,
    logout,
    clearError,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setCurrentUser(data.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError('');
      const { data } = await axios.post('/api/auth/register', userData);
      
      // Auto-login after registration
      const { token } = data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUser();
      toast.success('Registration successful! Please check your email to confirm your account.');
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError('');
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      // Check if 2FA is required
      if (data.twoFactorRequired) {
        return { twoFactorRequired: true, email };
      }
      
      // Handle regular login
      const { token } = data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUser();
      toast.success('Login successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verify 2FA code
  const verify2FA = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-2fa', { email, code });
      const { token } = data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUser();
      toast.success('2FA verification successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || '2FA verification failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/login');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgotpassword', { email });
      toast.success('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      await axios.put(`/api/auth/resetpassword/${token}`, { password: newPassword });
      toast.success('Password reset successful. You can now login with your new password.');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/api/auth/updatedetails', userData);
      setCurrentUser(data.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/updatepassword', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Toggle 2FA
  const toggle2FA = async () => {
    try {
      const { data } = await axios.put('/api/auth/toggle-2fa');
      await fetchUser();
      const status = data.data.twoFactorEnable ? 'enabled' : 'disabled';
      toast.success(`Two-factor authentication ${status} successfully`);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update 2FA settings';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    verify2FA,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    toggle2FA,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

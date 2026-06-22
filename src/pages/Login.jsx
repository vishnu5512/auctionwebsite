import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaGavel } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');
    if (!email) {
      setError('Please enter your email address first so we can reset it.');
      return;
    }
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setResetMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing forgot password simulator.');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel p-5 border border-secondary shadow-lg w-100" style={{ maxWidth: '480px' }}>
        
        {/* Brand Icon Header */}
        <div className="text-center mb-5">
          <FaGavel className="text-info fs-1 mb-2 animate-bounce" />
          <h2 className="text-white fw-bold">Welcome Back</h2>
          <p className="text-secondary small">Access your personalized auction portal</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger-subtle border-danger text-danger small p-3 rounded-3 mb-4" role="alert">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="alert alert-success bg-success-subtle border-success text-success small p-3 rounded-3 mb-4" role="alert">
            {resetMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control form-control-custom ps-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <label className="form-label text-secondary small fw-semibold mb-0">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="btn btn-link p-0 text-decoration-none text-info small"
                style={{ fontSize: '0.8rem' }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                <FaLock />
              </span>
              <input
                type="password"
                className="form-control form-control-custom ps-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-premium w-100 py-2.5 mb-4">
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-secondary small mt-3">
          Don't have an account?{' '}
          <Link to="/register" className="text-info text-decoration-none fw-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

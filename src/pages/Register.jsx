import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaGavel, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // buyer by default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel p-5 border border-secondary shadow-lg w-100" style={{ maxWidth: '500px' }}>
        
        {/* Header */}
        <div className="text-center mb-5">
          <FaGavel className="text-info fs-1 mb-2" />
          <h2 className="text-white fw-bold">Create Account</h2>
          <p className="text-secondary small">Register to start bidding and listing items</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger-subtle border-danger text-danger small p-3 rounded-3 mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control form-control-custom ps-2"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Password (6+ characters)</label>
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

          {/* Role selector buttons */}
          <div className="mb-4">
            <label className="form-label text-secondary small fw-semibold d-block">Select Account Role</label>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`btn w-100 py-2 d-flex align-items-center justify-content-center border ${
                    role === 'buyer'
                      ? 'btn-outline-info text-info border-info bg-info bg-opacity-10'
                      : 'btn-outline-secondary text-secondary border-secondary'
                  }`}
                >
                  {role === 'buyer' && <FaCheckCircle className="me-2 text-info" />}
                  I'm a Buyer
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`btn w-100 py-2 d-flex align-items-center justify-content-center border ${
                    role === 'seller'
                      ? 'btn-outline-info text-info border-info bg-info bg-opacity-10'
                      : 'btn-outline-secondary text-secondary border-secondary'
                  }`}
                >
                  {role === 'seller' && <FaCheckCircle className="me-2 text-info" />}
                  I'm a Seller
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-premium w-100 py-2.5 mb-4">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-secondary small mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-info text-decoration-none fw-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

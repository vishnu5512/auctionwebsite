import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaKey, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name) {
      setError('Name field cannot be left blank.');
      setLoading(false);
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const res = await updateProfile(name, password || undefined);
    if (res.success) {
      setSuccess('Profile details successfully updated!');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(res.message || 'Failed to update profile.');
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="glass-panel p-5 border border-secondary shadow-lg">
            
            {/* Header info */}
            <div className="d-flex align-items-center mb-5 gap-3 border-bottom border-secondary pb-4">
              <FaUserCircle className="text-info display-1" />
              <div>
                <h2 className="text-white fw-bold mb-1">{user?.name}</h2>
                <span className="badge bg-secondary text-info text-uppercase">{user?.role} Portal</span>
                <span className="text-muted d-block small mt-2">Member since: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger bg-danger-subtle border-danger text-danger small p-3 rounded-3 mb-4">
                <FaExclamationCircle className="me-2" /> {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success bg-success-subtle border-success text-success small p-3 rounded-3 mb-4">
                <FaCheckCircle className="me-2" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Email (Readonly) */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Email Address (Locked)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-custom ps-2"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <hr className="border-secondary my-4 w-100" />
                <h5 className="text-white fw-bold mb-2">Change Password</h5>
                <p className="text-muted small mt-0 mb-3">Leave blank if you do not want to alter passwords.</p>

                {/* Password */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">New Password (6+ chars)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                      <FaKey />
                    </span>
                    <input
                      type="password"
                      className="form-control form-control-custom ps-2"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary text-secondary">
                      <FaKey />
                    </span>
                    <input
                      type="password"
                      className="form-control form-control-custom ps-2"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-top border-secondary d-flex justify-content-end">
                <button type="submit" disabled={loading} className="btn btn-premium px-5 py-2.5">
                  {loading ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { FaBell, FaUser, FaSignOutAlt, FaGavel, FaTrophy, FaCalendarCheck } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(SocketContext);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif._id);
    setShowNotif(false);
    // Optionally redirect based on type, e.g. details page
    if (notif.type === 'bid' || notif.type === 'outbid' || notif.type === 'won') {
      // Find clean link if matches
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top px-lg-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-3" to="/">
          <FaGavel className="text-info me-2 fs-4" />
          <span className="text-gradient">BidSphere</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/auctions">
                Auctions
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/winners">
                Winners
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/contact">
                Contact Us
              </NavLink>
            </li>

            {/* Dashboard link based on role */}
            {isAuthenticated && (
              <li className="nav-item">
                {user.role === 'admin' && (
                  <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/admin-dashboard">
                    Admin Panel
                  </NavLink>
                )}
                {user.role === 'seller' && (
                  <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/seller-dashboard">
                    Seller Dashboard
                  </NavLink>
                )}
                {user.role === 'buyer' && (
                  <NavLink className={({ isActive }) => `nav-link nav-link-custom mx-2 ${isActive ? 'active' : ''}`} to="/buyer-dashboard">
                    Buyer Dashboard
                  </NavLink>
                )}
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center justify-content-center mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="position-relative me-4" style={{ cursor: 'pointer' }}>
                  <div onClick={() => setShowNotif(!showNotif)}>
                    <FaBell className="text-secondary fs-4 hover-info transition-smooth" style={{ transition: 'color 0.2s' }} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.6rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {showNotif && (
                    <div className="position-absolute end-0 mt-3 notif-dropdown glass-panel shadow" style={{ zIndex: 1050 }}>
                      <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-gradient">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="btn btn-link btn-sm text-info p-0 text-decoration-none" style={{ fontSize: '0.8rem' }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="py-1">
                        {notifications.length === 0 ? (
                          <div className="text-center text-muted p-4">No notifications yet</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotifClick(notif)}
                              className={`notif-item ${!notif.read ? 'unread' : ''}`}
                            >
                              <div>{notif.message}</div>
                              <div className="notif-time d-flex align-items-center">
                                <FaCalendarCheck className="me-1" />
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Profile */}
                <Link to="/profile" className="d-flex align-items-center text-decoration-none me-3 text-secondary">
                  <FaUser className="text-info me-2" />
                  <span className="d-none d-md-inline-block fw-semibold">{user.name}</span>
                  <span className="badge bg-dark border border-secondary text-secondary ms-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </Link>

                {/* Logout Button */}
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center py-2 px-3">
                  <FaSignOutAlt className="me-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-custom me-2 px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn btn-premium px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

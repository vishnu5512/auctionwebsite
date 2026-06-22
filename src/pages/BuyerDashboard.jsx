import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { FaHeart, FaGavel, FaTrophy, FaBell, FaInfoCircle, FaClock } from 'react-icons/fa';

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { notifications, markAsRead } = useContext(SocketContext);
  
  const [watchlist, setWatchlist] = useState([]);
  const [wins, setWins] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch won auctions
      const winsRes = await axios.get('/winners/my-wins');
      if (winsRes.data.success) {
        setWins(winsRes.data.wins);
      }

      // 2. Fetch all products to filter current active bids where user is involved
      const prodRes = await axios.get('/products');
      if (prodRes.data.success) {
        // Filter products where user is the current highest bidder
        const userActiveBids = prodRes.data.products.filter(
          (p) => p.status === 'active' && p.currentBidder?._id === user.id
        );
        setActiveBids(userActiveBids);
      }

      // 3. Fetch current profile watchlist populated
      const profileRes = await axios.get('/auth/profile');
      if (profileRes.data.success) {
        setWatchlist(profileRes.data.user.watchlist || []);
      }
    } catch (err) {
      console.error('Error fetching buyer dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-white fw-bold">Buyer Console</h2>
          <p className="text-secondary">Welcome back, {user?.name}! Track your bids, watchlists, and winnings.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Side: Winnings and Watchlist */}
        <div className="col-lg-8">
          
          {/* Won Items Section */}
          <div className="glass-panel p-4 border border-secondary mb-4 shadow">
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center">
              <FaTrophy className="text-warning me-2" /> Auctions Won
            </h4>

            {wins.length === 0 ? (
              <div className="text-center text-muted p-4">
                <FaInfoCircle className="fs-3 mb-2 text-secondary" />
                <p className="mb-0">You haven't won any auctions yet. Start bidding!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle border border-secondary">
                  <thead>
                    <tr className="border-secondary text-secondary">
                      <th>Item</th>
                      <th>Category</th>
                      <th>Winning Bid</th>
                      <th>Seller Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wins.map((win) => (
                      <tr key={win._id} className="border-secondary">
                        <td>
                          <div className="fw-semibold text-white">{win.product?.title}</div>
                        </td>
                        <td>
                          <span className="badge bg-secondary text-info text-uppercase">{win.product?.category}</span>
                        </td>
                        <td className="text-info fw-bold">${win.winningBid?.toLocaleString()}</td>
                        <td className="small">{win.product?.seller?.email || 'N/A'}</td>
                        <td>
                          <Link to={`/products/${win.product?._id}`} className="btn btn-outline-info btn-sm">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Bids Section */}
          <div className="glass-panel p-4 border border-secondary mb-4 shadow">
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center">
              <FaGavel className="text-info me-2" /> Leading Bids (Active)
            </h4>

            {activeBids.length === 0 ? (
              <div className="text-center text-muted p-4">
                <p className="mb-0">You are not currently the highest bidder on any live items.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle border border-secondary">
                  <thead>
                    <tr className="border-secondary text-secondary">
                      <th>Product</th>
                      <th>Current Bid</th>
                      <th>Increment</th>
                      <th>Ends In</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBids.map((bid) => (
                      <tr key={bid._id} className="border-secondary">
                        <td className="fw-semibold text-white">{bid.title}</td>
                        <td className="text-info fw-bold">${bid.currentBid?.toLocaleString()}</td>
                        <td className="small">${bid.bidIncrement}</td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-warning">
                            {new Date(bid.endDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <Link to={`/products/${bid._id}`} className="btn btn-premium btn-sm">
                            Bid Page
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Watchlist Section */}
          <div className="glass-panel p-4 border border-secondary shadow">
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center">
              <FaHeart className="text-danger me-2" /> Watchlist Items
            </h4>

            {watchlist.length === 0 ? (
              <div className="text-center text-muted p-4">
                <p className="mb-0">Your watchlist is currently empty.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {watchlist.map((prod) => (
                  <div className="col" key={prod._id}>
                    <div className="card bg-dark border border-secondary p-3 d-flex flex-row align-items-center gap-3">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80'}
                        alt={prod.title}
                        className="rounded"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="text-white text-truncate mb-1">{prod.title}</h6>
                        <span className="text-info fw-semibold d-block small">${prod.currentBid}</span>
                        <span className="text-muted tiny" style={{ fontSize: '0.7rem' }}>
                          Status: <strong className={prod.status === 'active' ? 'text-success' : 'text-danger'}>{prod.status}</strong>
                        </span>
                      </div>
                      <Link to={`/products/${prod._id}`} className="btn btn-outline-info btn-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Notification Feed */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 border border-secondary shadow sticky-top" style={{ top: '90px' }}>
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center">
              <FaBell className="text-info me-2" /> System Notifications
            </h4>
            
            <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
              {notifications.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-0">No notifications found.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`list-group-item bg-transparent border-bottom border-secondary text-secondary py-3 px-0 ${
                        !notif.read ? 'text-white border-start border-3 border-info ps-2' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="small">{notif.message}</div>
                      <div className="tiny text-muted mt-2 d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                        <FaClock className="me-1" />
                        {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;

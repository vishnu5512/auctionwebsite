import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserShield, FaUsers, FaBoxOpen, FaGavel, FaHandHoldingUsd, FaTrash, FaUserCheck, FaUndo } from 'react-icons/fa';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users, products, bids

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes, productsRes] = await Promise.all([
        axios.get('/admin/analytics'),
        axios.get('/admin/users'),
        axios.get('/products?status=active'), // fetch active products to manage
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (productsRes.data.success) setProducts(productsRes.data.products);

      // Fetch some bids across all products to show in active bids retraction log
      // For simplicity, we can fetch bids history of the active products
      const activeProducts = productsRes.data.products || [];
      const bidsPromises = activeProducts.map((p) => axios.get(`/bids/${p._id}`));
      const bidsResponses = await Promise.all(bidsPromises);
      
      let allActiveBids = [];
      bidsResponses.forEach((res, index) => {
        if (res.data.success) {
          const productTitle = activeProducts[index].title;
          const productBids = res.data.bids.map((b) => ({
            ...b,
            productTitle,
          }));
          allActiveBids = [...allActiveBids, ...productBids];
        }
      });
      // Sort all bids by date
      allActiveBids.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentBids(allActiveBids);

    } catch (err) {
      console.error('Error fetching admin panels data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(`/admin/users/${userId}`, { role: newRole });
      if (response.data.success) {
        alert('User role updated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their listings/bids?')) {
      try {
        const response = await axios.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          alert('User deleted successfully.');
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to terminate/delete this product?')) {
      try {
        const response = await axios.delete(`/products/${productId}`);
        if (response.data.success) {
          alert('Listing deleted successfully.');
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleRetractBid = async (bidId) => {
    if (window.confirm('Are you sure you want to retract/delete this bid? The product pricing will automatically revert to the previous highest bid.')) {
      try {
        const response = await axios.delete(`/admin/bids/${bidId}`);
        if (response.data.success) {
          alert('Bid successfully retracted.');
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to retract bid.');
      }
    }
  };

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
        <div className="col-12 d-flex align-items-center">
          <FaUserShield className="text-info fs-2 me-3" />
          <div>
            <h2 className="text-white fw-bold mb-0">System Control Console</h2>
            <p className="text-secondary mb-0">Monitor user enrollments, moderate active auctions, and retract invalid bids.</p>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
        <div className="col">
          <div className="card glass-panel border border-secondary p-4 d-flex flex-row align-items-center gap-3">
            <div className="p-3 rounded-3 bg-info bg-opacity-10 text-info">
              <FaUsers className="fs-3" />
            </div>
            <div>
              <span className="text-secondary small d-block">Total Registrations</span>
              <strong className="text-white fs-4">{analytics?.totalUsers}</strong>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card glass-panel border border-secondary p-4 d-flex flex-row align-items-center gap-3">
            <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success">
              <FaBoxOpen className="fs-3" />
            </div>
            <div>
              <span className="text-secondary small d-block">Active Listings</span>
              <strong className="text-white fs-4">{analytics?.activeProducts}</strong>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card glass-panel border border-secondary p-4 d-flex flex-row align-items-center gap-3">
            <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning">
              <FaGavel className="fs-3" />
            </div>
            <div>
              <span className="text-secondary small d-block">Bids Submitted</span>
              <strong className="text-white fs-4">{analytics?.totalBids}</strong>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card glass-panel border border-secondary p-4 d-flex flex-row align-items-center gap-3">
            <div className="p-3 rounded-3 bg-danger bg-opacity-10 text-danger">
              <FaHandHoldingUsd className="fs-3" />
            </div>
            <div>
              <span className="text-secondary small d-block">Gross Volume</span>
              <strong className="text-white fs-4">${analytics?.totalVolume?.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="row g-4">
        <div className="col-md-3">
          <div className="glass-panel p-3 border border-secondary">
            <button
              onClick={() => setActiveTab('users')}
              className={`btn w-100 text-start dashboard-nav-item border-0 ${activeTab === 'users' ? 'active' : ''}`}
            >
              <FaUsers className="dashboard-nav-icon" /> Manage Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`btn w-100 text-start dashboard-nav-item border-0 ${activeTab === 'products' ? 'active' : ''}`}
            >
              <FaBoxOpen className="dashboard-nav-icon" /> Moderate Listings ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`btn w-100 text-start dashboard-nav-item border-0 ${activeTab === 'bids' ? 'active' : ''}`}
            >
              <FaGavel className="dashboard-nav-icon" /> Retract Bids ({recentBids.length})
            </button>
          </div>
        </div>

        <div className="col-md-9">
          <div className="glass-panel p-4 border border-secondary shadow">
            
            {/* Manage Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h4 className="text-white fw-bold mb-4">Users Database</h4>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border border-secondary">
                    <thead>
                      <tr className="border-secondary text-secondary text-uppercase small">
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered</th>
                        <th>Role</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-secondary">
                          <td className="fw-semibold text-white">{u.name}</td>
                          <td>{u.email}</td>
                          <td className="small">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="form-select form-control-custom py-1 px-2 border-secondary small"
                              style={{ width: '110px', fontSize: '0.8rem' }}
                            >
                              <option value="buyer">buyer</option>
                              <option value="seller">seller</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Moderate Listings Tab */}
            {activeTab === 'products' && (
              <div>
                <h4 className="text-white fw-bold mb-4">Moderate Active Auctions</h4>
                {products.length === 0 ? (
                  <p className="text-muted mb-0">No active products to moderate.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle border border-secondary">
                      <thead>
                        <tr className="border-secondary text-secondary text-uppercase small">
                          <th>Title</th>
                          <th>Category</th>
                          <th>Current Bid</th>
                          <th>Seller ID</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p._id} className="border-secondary">
                            <td className="fw-semibold text-white">{p.title}</td>
                            <td>{p.category}</td>
                            <td className="text-info fw-bold">${p.currentBid}</td>
                            <td className="small text-muted">{p.seller?.name || p.seller}</td>
                            <td className="text-end">
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="btn btn-outline-danger btn-sm"
                                title="Terminate & Delete Auction"
                              >
                                <FaTrash /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Retract Bids Tab */}
            {activeTab === 'bids' && (
              <div>
                <h4 className="text-white fw-bold mb-4">Active Bids Log</h4>
                {recentBids.length === 0 ? (
                  <p className="text-muted mb-0">No bids records found for active products.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle border border-secondary">
                      <thead>
                        <tr className="border-secondary text-secondary text-uppercase small">
                          <th>Product</th>
                          <th>Bidder</th>
                          <th>Amount</th>
                          <th>Time</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBids.map((b) => (
                          <tr key={b._id} className="border-secondary">
                            <td className="fw-semibold text-white">{b.productTitle}</td>
                            <td>{b.bidder?.name || 'Buyer'}</td>
                            <td className="text-info fw-bold">${b.amount}</td>
                            <td className="small">{new Date(b.timestamp).toLocaleString()}</td>
                            <td className="text-end">
                              <button
                                onClick={() => handleRetractBid(b._id)}
                                className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-end ms-auto"
                                title="Retract Bid"
                              >
                                <FaUndo className="me-1" /> Retract
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaGavel, FaEye, FaCalendarAlt, FaTag, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Categories = ['Electronics', 'Fashion', 'Collectibles', 'Art'];

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formStartingPrice, setFormStartingPrice] = useState('');
  const [formBidIncrement, setFormBidIncrement] = useState('1');
  const [formImages, setFormImages] = useState(''); // Comma separated urls
  const [formEndDate, setFormEndDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // View bids popup states
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [focusedProductBids, setFocusedProductBids] = useState([]);
  const [focusedProductTitle, setFocusedProductTitle] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setFormError('');
    try {
      const response = await axios.post('/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormImages(response.data.url);
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products/seller/my-products');
      if (response.data.success) {
        setMyProducts(response.data.products);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your product listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedProductId(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('Electronics');
    setFormStartingPrice('');
    setFormBidIncrement('1');
    setFormImages('');
    setFormEndDate('');
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prod) => {
    if (prod.bidsCount > 0) {
      alert('Sellers cannot edit auctions that already have active bids.');
      return;
    }
    setIsEditMode(true);
    setSelectedProductId(prod._id);
    setFormTitle(prod.title);
    setFormDesc(prod.description);
    setFormCategory(prod.category);
    setFormStartingPrice(prod.startingPrice.toString());
    setFormBidIncrement(prod.bidIncrement.toString());
    setFormImages(prod.images ? prod.images.join(', ') : '');
    
    // Format date string to fit datetime-local input value
    const dateObj = new Date(prod.endDate);
    const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
    setFormEndDate(localISOTime);
    
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formTitle || !formDesc || !formStartingPrice || !formEndDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const price = parseFloat(formStartingPrice);
    const increment = parseFloat(formBidIncrement);
    if (isNaN(price) || price < 0 || isNaN(increment) || increment <= 0) {
      setFormError('Price and Bidding Increment values must be positive numbers.');
      return;
    }

    setSubmitting(true);
    const imageArray = formImages
      ? formImages.split(',').map((url) => url.trim()).filter((url) => url !== '')
      : [];

    const body = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      startingPrice: price,
      bidIncrement: increment,
      images: imageArray,
      endDate: formEndDate,
    };

    try {
      if (isEditMode) {
        const response = await axios.put(`/products/${selectedProductId}`, body);
        if (response.data.success) {
          setFormSuccess('Auction listing successfully updated!');
          fetchMyProducts();
          setTimeout(() => setShowFormModal(false), 1500);
        }
      } else {
        const response = await axios.post('/products', body);
        if (response.data.success) {
          setFormSuccess('Auction listing successfully created & published!');
          fetchMyProducts();
          setTimeout(() => setShowFormModal(false), 1500);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving auction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, bidsCount) => {
    if (bidsCount > 0) {
      alert('Sellers cannot delete auctions that already have active bids.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this listing? This action is permanent.')) {
      try {
        const response = await axios.delete(`/products/${id}`);
        if (response.data.success) {
          fetchMyProducts();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete listing.');
      }
    }
  };

  const handleViewBids = async (productId, title) => {
    setFocusedProductTitle(title);
    try {
      const response = await axios.get(`/products/${productId}`);
      if (response.data.success) {
        setFocusedProductBids(response.data.bids || []);
        setShowBidsModal(true);
      }
    } catch (err) {
      alert('Failed to retrieve bids for this item.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="text-white fw-bold">Seller Dashboard</h2>
          <p className="text-secondary mb-0">Publish auctions, manage active listings, and check bid logs.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-premium py-2 px-4 d-flex align-items-center">
          <FaPlus className="me-2" /> Add Auction Product
        </button>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger-subtle border-danger text-danger p-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : myProducts.length === 0 ? (
        <div className="text-center py-5 glass-panel border border-secondary p-5">
          <FaGavel className="text-muted fs-1 mb-3" />
          <h5 className="text-muted">You haven't listed any auctions yet</h5>
          <p className="text-secondary small mb-4">Create your first listings to start receiving bids from buyers!</p>
          <button onClick={handleOpenCreateModal} className="btn btn-premium px-4">
            Create First Listing
          </button>
        </div>
      ) : (
        <div className="glass-panel p-4 border border-secondary shadow">
          <h4 className="text-white fw-bold mb-4">My Auction Listings</h4>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle border border-secondary">
              <thead>
                <tr className="border-secondary text-secondary">
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Starting Price</th>
                  <th>Current Bid</th>
                  <th>Total Bids</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((prod) => {
                  const isActive = prod.status === 'active' && new Date(prod.endDate) > new Date();
                  let imageUrl = prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80';
                  if (imageUrl.startsWith('/uploads/')) {
                    imageUrl = `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
                  }
                  
                  return (
                    <tr key={prod._id} className="border-secondary">
                      <td>
                        <img src={imageUrl} alt={prod.title} className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      </td>
                      <td>
                        <div className="fw-semibold text-white">{prod.title}</div>
                      </td>
                      <td>
                        <span className="badge bg-secondary text-info text-uppercase">{prod.category}</span>
                      </td>
                      <td>${prod.startingPrice?.toLocaleString()}</td>
                      <td className="text-info fw-bold">${prod.currentBid?.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => handleViewBids(prod._id, prod.title)}
                          className="btn btn-link btn-sm text-info p-0 text-decoration-none d-flex align-items-center"
                        >
                          <FaEye className="me-1" /> {prod.bidsCount || 0} Bids
                        </button>
                      </td>
                      <td className="small">{new Date(prod.endDate).toLocaleDateString()}</td>
                      <td>
                        {isActive ? (
                          <span className="badge bg-success bg-opacity-20 text-success border border-success">Active</span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-20 text-danger border border-danger">Ended</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            disabled={prod.bidsCount > 0}
                            className="btn btn-outline-info btn-sm d-flex align-items-center"
                            title={prod.bidsCount > 0 ? 'Cannot edit: bids exist' : 'Edit Listing'}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id, prod.bidsCount)}
                            disabled={prod.bidsCount > 0}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center"
                            title={prod.bidsCount > 0 ? 'Cannot delete: bids exist' : 'Delete Listing'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog Modal */}
      {showFormModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-75" style={{ zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-panel border border-secondary p-4 bg-secondary">
              <div className="modal-header border-0 pb-0 justify-content-between">
                <h4 className="modal-title text-gradient fw-bold">
                  {isEditMode ? 'Edit Auction Listing' : 'Publish New Auction'}
                </h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFormModal(false)}></button>
              </div>
              
              <div className="modal-body pt-4">
                {formError && (
                  <div className="alert alert-danger bg-danger-subtle border-danger text-danger small p-2.5 mb-3">
                    <FaExclamationCircle className="me-2" /> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="alert alert-success bg-success-subtle border-success text-success small p-2.5 mb-3">
                    <FaCheckCircle className="me-2" /> {formSuccess}
                  </div>
                )}

                <form onSubmit={handleFormSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label text-secondary small fw-semibold">Product Title *</label>
                      <input
                        type="text"
                        className="form-control form-control-custom"
                        placeholder="e.g. Vintage Leica Camera body"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary small fw-semibold">Category *</label>
                      <select
                        className="form-select form-control-custom"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        {Categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-secondary small fw-semibold">Detailed Description *</label>
                      <textarea
                        className="form-control form-control-custom"
                        rows="4"
                        placeholder="Provide specifications, wear condition, and details included in shipment..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Starting Price ($) *</label>
                      <input
                        type="number"
                        className="form-control form-control-custom"
                        placeholder="200"
                        value={formStartingPrice}
                        onChange={(e) => setFormStartingPrice(e.target.value)}
                        disabled={isEditMode}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Minimum Bid Increment ($) *</label>
                      <input
                        type="number"
                        className="form-control form-control-custom"
                        placeholder="10"
                        value={formBidIncrement}
                        onChange={(e) => setFormBidIncrement(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label text-secondary small fw-semibold">Product Image *</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-custom"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      
                      {uploading && (
                        <div className="mt-2 text-info small d-flex align-items-center">
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading image...
                        </div>
                      )}
                      
                      {formImages && (
                        <div className="mt-3 position-relative d-inline-block border border-secondary rounded p-1 bg-dark bg-opacity-25" style={{ maxWidth: '150px' }}>
                          <img
                            src={formImages.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${formImages}` : formImages}
                            alt="Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: '100px', objectFit: 'contain' }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormImages('')}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 px-2 py-0.5"
                            style={{ fontSize: '0.65rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <span className="tiny text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                        Upload a high-quality image of the item (JPG, PNG, WebP).
                      </span>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label text-secondary small fw-semibold">Auction Expiry Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control form-control-custom"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" className="btn btn-outline-secondary text-secondary px-4" onClick={() => setShowFormModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn btn-premium px-4">
                      {submitting ? 'Saving changes...' : 'Publish Listing'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bids History Modal */}
      {showBidsModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-75" style={{ zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-panel border border-secondary p-4 bg-secondary">
              <div className="modal-header border-0 pb-0 justify-content-between">
                <h5 className="modal-title text-white fw-bold">Bids Log: {focusedProductTitle}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBidsModal(false)}></button>
              </div>
              <div className="modal-body pt-4">
                {focusedProductBids.length === 0 ? (
                  <div className="text-center text-muted p-3">No bids placed on this product yet.</div>
                ) : (
                  <div className="list-group list-group-flush max-height-300 overflow-y-auto" style={{ maxHeight: '350px' }}>
                    {focusedProductBids.map((bid, idx) => (
                      <div key={bid._id} className="list-group-item bg-transparent border-bottom border-secondary text-light px-0 py-2.5 d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-white">
                            {bid.bidder?.name || 'Buyer'}
                            {idx === 0 && <span className="badge bg-success bg-opacity-20 text-success ms-2 small">Winner/Leading</span>}
                          </strong>
                          <span className="text-muted small">
                            {new Date(bid.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className="fw-bold text-info">${bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;

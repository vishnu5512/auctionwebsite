import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import CountdownTimer from '../components/CountdownTimer';
import { FaGavel, FaHeart, FaRegHeart, FaArrowLeft, FaInfoCircle, FaCalendarAlt, FaHistory, FaTag } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, toggleWatchlist, isAuthenticated } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Bidding form states
  const [bidAmount, setBidAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newBidId, setNewBidId] = useState(null); // Track new bid for flash animations

  // Fetch initial details via REST API
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
        setBids(response.data.bids);
        
        // Suggest a starting bid value in input
        const startingPrice = response.data.product.startingPrice;
        const currentBid = response.data.product.currentBid;
        const increment = response.data.product.bidIncrement;
        const defaultBid = response.data.product.currentBidder 
          ? currentBid + increment 
          : startingPrice;
        setBidAmount(defaultBid.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Handle Socket.io room joins & bid updates
  useEffect(() => {
    if (socket && product) {
      // Join Room
      socket.emit('joinRoom', { productId: product._id });

      // Listen for updates
      socket.on('bidUpdate', (data) => {
        setProduct((prevProd) => ({
          ...prevProd,
          currentBid: data.currentBid,
          currentBidder: data.currentBidder,
        }));
        setBids(data.bids);

        // Flash animation trigger on the new highest bid
        if (data.bids.length > 0) {
          setNewBidId(data.bids[0]._id);
          setTimeout(() => setNewBidId(null), 2000);
        }
      });

      // Listen for end triggers
      socket.on('auctionEnded', (data) => {
        setProduct((prevProd) => ({
          ...prevProd,
          status: 'ended',
          currentBidder: data.winner ? { _id: data.winner.id, name: data.winner.name } : null,
          currentBid: data.winningBid,
        }));
      });

      // Cleanup
      return () => {
        socket.emit('leaveRoom', { productId: product._id });
        socket.off('bidUpdate');
        socket.off('auctionEnded');
      };
    }
  }, [socket, product?._id]);

  const handlePlaceBid = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isAuthenticated) {
      setFormError('You must be logged in to place a bid.');
      return;
    }

    if (user.role !== 'buyer' && user.role !== 'admin') {
      setFormError('Only users with Buyer accounts can place bids.');
      return;
    }

    if (product.seller._id === user.id || product.seller === user.id) {
      setFormError('Sellers cannot place bids on their own products.');
      return;
    }

    const numericAmount = parseFloat(bidAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid positive bidding amount.');
      return;
    }

    const minRequired = product.currentBidder
      ? product.currentBid + product.bidIncrement
      : product.startingPrice;

    if (numericAmount < minRequired) {
      setFormError(`Your bid must be at least $${minRequired.toFixed(2)}`);
      return;
    }

    setSubmitting(true);

    // Emit live bid via Socket
    socket.emit(
      'placeBid',
      {
        productId: product._id,
        bidderId: user.id,
        amount: numericAmount,
      },
      (response) => {
        setSubmitting(false);
        if (response.success) {
          setFormSuccess(response.message);
          // Auto fill next bid recommendation
          setBidAmount((response.currentBid + product.bidIncrement).toString());
        } else {
          setFormError(response.message);
        }
      }
    );
  };

  const handleWatchlistClick = () => {
    if (!isAuthenticated) return;
    toggleWatchlist(product._id);
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

  if (error || !product) {
    return (
      <div className="container py-5 text-center bg-primary">
        <div className="alert alert-danger bg-danger-subtle border-danger text-danger py-4 shadow glass-panel">
          <FaInfoCircle className="fs-3 mb-2" />
          <h5>{error || 'Product not found.'}</h5>
          <Link to="/auctions" className="btn btn-outline-light mt-3">
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const isWatched = user?.watchlist?.some(
    (item) => item === product._id || item._id === product._id
  );

  const isActive = product.status === 'active' && new Date(product.endDate) > new Date();
  const minRequiredBid = product.currentBidder
    ? product.currentBid + product.bidIncrement
    : product.startingPrice;

  return (
    <div className="container py-5">
      <Link to="/auctions" className="btn btn-outline-secondary text-secondary mb-4 d-inline-flex align-items-center">
        <FaArrowLeft className="me-2" /> Back to Catalog
      </Link>

      <div className="row g-5">
        {/* Images & Description Column */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 border border-secondary mb-4 shadow">
            <div className="text-center rounded-3 bg-dark overflow-hidden mb-3" style={{ height: '420px' }}>
              <img
                src={
                  product.images?.[0]
                    ? (product.images[0].startsWith('/uploads/') ? `http://localhost:5000${product.images[0]}` : product.images[0])
                    : 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.title}
                className="w-100 h-100"
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            {/* Gallery thumbs if multiple */}
            {product.images && product.images.length > 1 && (
              <div className="d-flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="border border-secondary rounded overflow-hidden bg-dark" style={{ width: '80px', height: '60px', flexShrink: 0 }}>
                    <img
                      src={img.startsWith('/uploads/') ? `http://localhost:5000${img}` : img}
                      alt="Thumbnail"
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-4 border border-secondary shadow">
            <h4 className="text-white fw-bold mb-3 d-flex align-items-center">
              <FaTag className="text-info me-2 fs-5" /> Product Description
            </h4>
            <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
            <hr className="border-secondary my-4" />
            
            <div className="row text-secondary small g-3">
              <div className="col-md-6 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-info" />
                <span>Listed: {new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="col-md-6 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-info" />
                <span>Category: <strong className="text-white text-uppercase">{product.category}</strong></span>
              </div>
              <div className="col-12 d-flex align-items-center">
                <span className="me-2">Listed by:</span>
                <strong className="text-white">{product.seller?.name || 'Seller'} ({product.seller?.email})</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Live Bidding Console Column */}
        <div className="col-lg-5">
          {/* Main Console */}
          <div className="glass-panel p-4 border border-secondary mb-4 shadow">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="text-white fw-bold mb-1">{product.title}</h2>
                <span className="badge bg-secondary text-info text-uppercase">{product.category}</span>
              </div>
              {isAuthenticated && user?.role === 'buyer' && (
                <button
                  onClick={handleWatchlistClick}
                  className="btn btn-outline-secondary p-2.5 rounded-circle d-flex align-items-center justify-content-center"
                >
                  {isWatched ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-secondary" />}
                </button>
              )}
            </div>

            <div className="p-3 bg-dark bg-opacity-50 border border-secondary rounded-3 mb-4">
              <div className="row align-items-center">
                <div className="col-6 border-end border-secondary">
                  <span className="text-muted small d-block mb-1">Current Bid</span>
                  <span className="text-info fw-bold fs-3">${product.currentBid?.toLocaleString()}</span>
                  {product.currentBidder && (
                    <span className="text-muted small d-block">
                      by {product.currentBidder.name}
                    </span>
                  )}
                </div>
                <div className="col-6 text-center">
                  <span className="text-muted small d-block mb-2">Time Remaining</span>
                  <CountdownTimer endDate={product.endDate} />
                </div>
              </div>
            </div>

            {isActive ? (
              <div className="border border-secondary rounded-3 p-3">
                <h5 className="text-white fw-bold mb-3 d-flex align-items-center">
                  <FaGavel className="text-info me-2" /> Place Live Bid
                </h5>

                {formError && (
                  <div className="alert alert-danger bg-danger-subtle border-danger text-danger small p-2.5 mb-3" role="alert">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="alert alert-success bg-success-subtle border-success text-success small p-2.5 mb-3" role="alert">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handlePlaceBid}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-secondary small mb-2">
                      <span>Starting Bid: ${product.startingPrice}</span>
                      <span>Min Bid Required: <strong>${minRequiredBid}</strong></span>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary border-secondary text-white">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-custom"
                        placeholder={minRequiredBid.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="text-muted small mt-1">
                      Min increment: ${product.bidIncrement}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-premium w-100 py-2.5 d-flex align-items-center justify-content-center"
                  >
                    <FaGavel className="me-2 animate-pulse" />
                    {submitting ? 'Submitting Bid...' : 'Place Highest Bid'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="alert alert-warning bg-warning-subtle border-warning text-warning p-4 rounded-3 text-center mb-0">
                <h5 className="fw-bold mb-2">Auction Ended</h5>
                {product.currentBidder ? (
                  <p className="mb-0 small">
                    Congratulations to <strong>{product.currentBidder.name}</strong> for winning this item with a bid of <strong>${product.currentBid.toLocaleString()}</strong>!
                  </p>
                ) : (
                  <p className="mb-0 small">This listing closed without receiving any valid bids.</p>
                )}
              </div>
            )}
          </div>

          {/* Bid History list */}
          <div className="glass-panel p-4 border border-secondary shadow">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center">
              <FaHistory className="text-info me-2" /> Live Bidding History
            </h5>
            
            <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
              {bids.length === 0 ? (
                <div className="text-center text-muted p-4">No bids placed yet. Be the first!</div>
              ) : (
                <div className="list-group list-group-flush bg-transparent">
                  {bids.map((bid, index) => {
                    const isNew = bid._id === newBidId;
                    return (
                      <div
                        key={bid._id}
                        className={`list-group-item bg-transparent border-bottom border-secondary text-light px-0 py-2.5 d-flex justify-content-between align-items-center ${
                          isNew ? 'bid-item-new' : ''
                        }`}
                      >
                        <div>
                          <strong className="d-block text-white">
                            {bid.bidder?.name || 'Buyer'}
                            {index === 0 && (
                              <span className="badge bg-success bg-opacity-20 text-success border border-success ms-2" style={{ fontSize: '0.65rem' }}>
                                Highest
                              </span>
                            )}
                          </strong>
                          <span className="text-muted small">
                            {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <span className="fw-bold text-info">${bid.amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

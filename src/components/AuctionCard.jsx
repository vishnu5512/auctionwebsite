import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import CountdownTimer from './CountdownTimer';
import { FaHeart, FaRegHeart, FaGavel, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AuctionCard = ({ product }) => {
  const { user, toggleWatchlist, isAuthenticated } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [localCurrentBid, setLocalCurrentBid] = useState(product.currentBid || product.startingPrice);
  const [localCurrentBidder, setLocalCurrentBidder] = useState(product.currentBidder);
  
  const minRequiredBid = localCurrentBidder
    ? localCurrentBid + product.bidIncrement
    : product.startingPrice;

  const [bidAmount, setBidAmount] = useState(minRequiredBid.toString());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync min bid amount on local state updates or initial load
  useEffect(() => {
    const minBid = localCurrentBidder
      ? localCurrentBid + product.bidIncrement
      : product.startingPrice;
    setBidAmount(minBid.toString());
  }, [localCurrentBid, localCurrentBidder, product.startingPrice, product.bidIncrement]);

  // Handle Socket.io real-time bid updates
  useEffect(() => {
    if (socket && product._id) {
      // Join Room
      socket.emit('joinRoom', { productId: product._id });

      // Listen for updates
      const handleBidUpdate = (data) => {
        setLocalCurrentBid(data.currentBid);
        setLocalCurrentBidder(data.currentBidder);
      };

      socket.on('bidUpdate', handleBidUpdate);

      // Cleanup
      return () => {
        socket.emit('leaveRoom', { productId: product._id });
        socket.off('bidUpdate', handleBidUpdate);
      };
    }
  }, [socket, product._id]);

  const isWatched = user?.watchlist?.some(
    (item) => item === product._id || item._id === product._id
  );

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleWatchlist(product._id);
  };

  const isActive = product.status === 'active' && new Date(product.endDate) > new Date();

  // Use a fallback image if no product images exist
  let imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80';
  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
  }

  const handlePlaceBid = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer' && user.role !== 'admin') {
      setError('Only buyers can place bids.');
      return;
    }

    if (product.seller === user.id || product.seller?._id === user.id) {
      setError('Sellers cannot bid on their own items.');
      return;
    }

    const numericAmount = parseFloat(bidAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    if (numericAmount < minRequiredBid) {
      setError(`Bid must be at least $${minRequiredBid}`);
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
          setSuccess(response.message);
          setLocalCurrentBid(response.currentBid);
          // Set current bidder locally to trigger increment logic
          setLocalCurrentBidder({ _id: user.id, name: user.name });
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.message);
          setTimeout(() => setError(''), 4000);
        }
      }
    );
  };

  return (
    <div className="card glass-panel glass-panel-hover auction-card h-100 shadow-sm border border-secondary">
      <div className="auction-image-container">
        <span className="auction-badge-category">{product.category}</span>
        
        {isActive ? (
          <span className="auction-badge-status badge-active">Live</span>
        ) : (
          <span className="auction-badge-status badge-ended">Ended</span>
        )}

        <Link to={`/products/${product._id}`}>
          <img src={imageUrl} alt={product.title} className="auction-image" />
        </Link>
        
        {isAuthenticated && user?.role === 'buyer' && (
          <button
            onClick={handleWatchlistClick}
            className="position-absolute btn border-0 p-2"
            style={{
              top: '12px',
              right: isActive ? '75px' : '90px',
              backgroundColor: 'rgba(9, 10, 15, 0.75)',
              borderRadius: '50%',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            {isWatched ? (
              <FaHeart className="text-danger" style={{ fontSize: '1rem' }} />
            ) : (
              <FaRegHeart className="text-secondary" style={{ fontSize: '1rem' }} />
            )}
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title text-white mb-2 line-clamp-1">
          <Link to={`/products/${product._id}`} className="text-white text-decoration-none" style={{ transition: 'color 0.2s' }}>
            {product.title}
          </Link>
        </h5>
        
        <p className="card-text text-secondary mb-3 text-muted small text-truncate-2" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '40px'
        }}>
          {product.description}
        </p>

        <div className="mt-auto">
          {/* Prices & Countdown Grid */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="text-muted small d-block">Current Bid</span>
              <span className="text-info fw-bold fs-4">${localCurrentBid.toLocaleString()}</span>
            </div>
            {isActive && (
              <div className="text-end">
                <span className="text-muted small d-block mb-1">Ends In</span>
                <CountdownTimer endDate={product.endDate} />
              </div>
            )}
          </div>

          {/* Inline Bidding Form (Only if active) */}
          {isActive ? (
            <form onSubmit={handlePlaceBid} className="mt-3 p-3 border border-secondary rounded bg-dark bg-opacity-25">
              <div className="mb-2">
                <label className="text-secondary small fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Your Name</label>
                <input
                  type="text"
                  className="form-control form-control-custom py-1.5 px-2.5 small"
                  value={user ? user.name : 'Guest (Login to bid)'}
                  disabled
                  readOnly
                  style={{ fontSize: '0.8rem', opacity: 0.7 }}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.75rem' }}>
                  <span>Min Bid: ${minRequiredBid}</span>
                  <span>Increment: ${product.bidIncrement}</span>
                </div>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-secondary border-secondary text-white py-1 px-2.5">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-custom py-1 px-2.5"
                    style={{ fontSize: '0.85rem' }}
                    placeholder={minRequiredBid.toString()}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={!isAuthenticated || user?.role !== 'buyer'}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-danger small mb-2 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                  <FaExclamationCircle className="me-1" /> {error}
                </div>
              )}
              {success && (
                <div className="text-success small mb-2 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                  <FaCheckCircle className="me-1" /> {success}
                </div>
              )}

              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-premium btn-sm w-100 py-2">
                  Login to Bid
                </Link>
              ) : user?.role === 'seller' ? (
                <button type="button" disabled className="btn btn-outline-secondary btn-sm w-100 py-2 text-muted" style={{ fontSize: '0.8rem' }}>
                  Sellers Cannot Bid
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-premium btn-sm w-100 py-2 d-flex align-items-center justify-content-center"
                >
                  <FaGavel className="me-1.5" />
                  {submitting ? 'Placing Bid...' : 'Place Bid'}
                </button>
              )}
            </form>
          ) : (
            <Link
              to={`/products/${product._id}`}
              className="btn btn-outline-secondary text-secondary w-100 d-flex align-items-center justify-content-center py-2.5 mt-3"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaCalendarCheck, FaGavel, FaTag } from 'react-icons/fa';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    try {
      const response = await axios.get('/winners');
      if (response.data.success) {
        setWinners(response.data.winners);
      }
    } catch (err) {
      console.error('Error fetching winners log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <FaTrophy className="text-warning fs-1 mb-2" />
        <h2 className="text-white fw-bold">Winner Announcements</h2>
        <p className="text-secondary">Celebrating recent winning bids on BidSphere platform listings.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : winners.length === 0 ? (
        <div className="text-center py-5 glass-panel border border-secondary p-5">
          <h5 className="text-muted">No winners announced yet</h5>
          <p className="text-secondary small mb-0">Winnings will appear here automatically when live active auctions expire.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {winners.map((win) => {
            const product = win.product || {};
            let imageUrl = product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80';
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }

            return (
              <div className="col" key={win._id}>
                <div className="card glass-panel h-100 border border-secondary p-3 shadow-sm">
                  {/* Photo container */}
                  <div className="rounded overflow-hidden bg-dark mb-3" style={{ height: '180px' }}>
                    <img src={imageUrl} alt={product.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                  
                  <div className="card-body px-1 py-0 d-flex flex-column">
                    <span className="text-info text-uppercase small d-flex align-items-center mb-1">
                      <FaTag className="me-1" style={{ fontSize: '0.7rem' }} /> {product.category}
                    </span>
                    <h5 className="text-white fw-semibold mb-2 line-clamp-1">{product.title || 'Unknown Product'}</h5>
                    
                    <div className="p-3 bg-dark bg-opacity-30 border border-secondary rounded-3 mt-auto my-3 text-center">
                      <span className="text-muted small d-block mb-1">Winner</span>
                      <strong className="text-white fs-5 d-block">{win.winner?.name || 'Buyer'}</strong>
                      <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary text-secondary small">
                        <span>Final Price:</span>
                        <strong className="text-info">${win.winningBid?.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="tiny text-muted d-flex align-items-center justify-content-center" style={{ fontSize: '0.75rem' }}>
                      <FaCalendarCheck className="me-1" />
                      Closed on {new Date(win.announcedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Winners;

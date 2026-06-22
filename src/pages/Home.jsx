import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { FaSearch, FaArrowRight, FaLaptop, FaTshirt, FaGem, FaPalette, FaFire } from 'react-icons/fa';

const Categories = [
  { name: 'All', icon: <FaFire /> },
  { name: 'Electronics', icon: <FaLaptop /> },
  { name: 'Fashion', icon: <FaTshirt /> },
  { name: 'Collectibles', icon: <FaGem /> },
  { name: 'Art', icon: <FaPalette /> },
];

const Home = () => {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const [liveRes, featuredRes] = await Promise.all([
          axios.get('/products/live'),
          axios.get('/products/featured'),
        ]);

        if (liveRes.data.success) setLiveAuctions(liveRes.data.products);
        if (featuredRes.data.success) setFeaturedAuctions(featuredRes.data.products);
      } catch (err) {
        console.error('Error fetching dashboard products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${searchQuery}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/auctions?category=${categoryName}`);
  };

  return (
    <div className="pb-5">
      {/* Hero Section */}
      <section className="hero-container text-center text-lg-start border-bottom border-secondary">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 text-white fw-extrabold mb-3" style={{ fontSize: '3.5rem', lineHeight: 1.15 }}>
                Discover, Bid, and Win <br />
                <span className="text-gradient">Rare Collectibles</span>
              </h1>
              <p className="lead text-secondary mb-5">
                Join the ultimate real-time auction marketplace. Bid on premium photography gear, holographic cards, modern art, and authenticated fashion items in seconds.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="input-group mb-4 shadow glass-panel p-1 rounded-pill" style={{ maxWidth: '500px' }}>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 text-dark px-4"
                  placeholder="Search live auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ boxShadow: 'none' }}
                />
                <button className="btn btn-premium rounded-pill px-4 d-flex align-items-center" type="submit">
                  <FaSearch className="me-2" /> Search
                </button>
              </form>

              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 mt-4">
                <Link to="/auctions" className="btn btn-premium px-4 py-2.5 d-flex align-items-center">
                  Explore Catalog <FaArrowRight className="ms-2" />
                </Link>
                <Link to="/register" className="btn btn-outline-custom px-4 py-2.5">
                  Become a Seller
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6 d-none d-lg-block text-center position-relative">
              {/* Artistic Graphic Representation of Bidding */}
              <div
                className="glass-panel mx-auto p-4 border border-secondary"
                style={{
                  width: '400px',
                  height: '420px',
                  borderRadius: '24px',
                  transform: 'rotate(2deg)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  background: 'radial-gradient(circle at 10% 10%, rgba(114, 9, 183, 0.4) 0%, rgba(19, 21, 32, 0.9) 80%)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"
                  alt="Feature Item"
                  className="img-fluid rounded-4 mb-3 w-100"
                  style={{ height: '240px', objectFit: 'cover' }}
                />
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-1">PSA 8 Charizard Holographic</h6>
                    <span className="text-info fw-bold">$550</span>
                  </div>
                  <span className="badge bg-danger text-white rounded-pill px-3 py-2 fs-6">Live Auction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container py-5 my-3">
        <h3 className="text-white mb-4 fw-bold text-center text-lg-start">Browse by Category</h3>
        <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
          {Categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="category-pill d-flex align-items-center fs-6"
            >
              <span className="me-2 text-info">{cat.icon}</span>
              {cat.name}
            </div>
          ))}
        </div>
      </section>

      {/* Live Auctions Section */}
      <section className="container py-5 border-top border-secondary">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="text-white fw-bold mb-1">
              <span className="text-gradient">Live & Active</span> Auctions
            </h2>
            <p className="text-muted small mb-0">Place your bids before the countdown clocks hit zero</p>
          </div>
          <Link to="/auctions" className="btn btn-outline-custom btn-sm">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : liveAuctions.length === 0 ? (
          <div className="text-center py-5 glass-panel border border-secondary p-5">
            <h5 className="text-muted mb-0">No active auctions listed right now</h5>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {liveAuctions.map((product) => (
              <div className="col" key={product._id}>
                <AuctionCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Auctions Section */}
      <section className="container py-5 border-top border-secondary">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="text-white fw-bold mb-1">
              <span className="text-gradient-green">Featured</span> Listings
            </h2>
            <p className="text-muted small mb-0">Discover top-tier auctions recommended by our team</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : featuredAuctions.length === 0 ? (
          <div className="text-center py-5 glass-panel border border-secondary p-5">
            <h5 className="text-muted mb-0">No featured products right now</h5>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {featuredAuctions.map((product) => (
              <div className="col" key={product._id}>
                <AuctionCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

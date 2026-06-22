import React from 'react';
import { Link } from 'react-router-dom';
import { FaGavel, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-secondary border-top border-secondary py-5 mt-auto">
      <div className="container">
        <div className="row justify-content-between g-4">
          <div className="col-lg-4 col-md-6">
            <Link className="d-flex align-items-center fw-bold fs-3 text-decoration-none mb-3" to="/">
              <FaGavel className="text-info me-2 fs-4" />
              <span className="text-gradient">BidSphere</span>
            </Link>
            <p className="text-secondary small">
              A premium, production-ready real-time bidding & auction platform designed for buyers and sellers worldwide. Discover, bid, and win with ease.
            </p>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3 text-uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>Platform</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/auctions" className="text-secondary text-decoration-none hover-white">All Auctions</Link></li>
              <li className="mb-2"><Link to="/winners" className="text-secondary text-decoration-none hover-white">Winners Board</Link></li>
              <li className="mb-2"><Link to="/about" className="text-secondary text-decoration-none hover-white">How it Works</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3 text-uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/about" className="text-secondary text-decoration-none hover-white">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-secondary text-decoration-none hover-white">Contact Support</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white mb-3 text-uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>Newsletter</h6>
            <p className="text-secondary small mb-3">Subscribe to get notified about featured items.</p>
            <div className="input-group">
              <input type="email" className="form-control form-control-custom" placeholder="Your email" />
              <button className="btn btn-premium px-3" type="button">Go</button>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">&copy; {new Date().getFullYear()} BidSphere Inc. All rights reserved.</p>
          <p className="mb-0 mt-2 mt-sm-0">
            Made with <FaHeart className="text-danger mx-1" /> for production scaling.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

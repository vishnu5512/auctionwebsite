import React from 'react';
import { FaGavel, FaShieldAlt, FaUsers, FaChartLine } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="text-white fw-bold display-4">About <span className="text-gradient">BidSphere</span></h1>
        <p className="text-secondary lead">Empowering collectors, creators, and enthusiasts through real-time open auctions.</p>
      </div>

      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="glass-panel p-5 border border-secondary shadow">
            <h3 className="text-white fw-bold mb-4">Our Vision</h3>
            <p className="text-secondary">
              BidSphere is a state-of-the-art Online Auction & Bidding platform designed to make buying and selling high-value, rare, and unique collectibles seamless, secure, and instant. We bridge the gap between passionate sellers and avid buyers by offering a live, socket-driven bidding arena where prices reflect true market demand.
            </p>
            <p className="text-secondary mb-0">
              Whether you are listing vintage Leica cameras, authenticated retro fashion items, or holographic card slabs, our platform guarantees real-time transparency, instant notifications, and automated, fair winner selection processes.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-md-4">
          <div className="card glass-panel border border-secondary p-4 h-100 text-center">
            <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle mx-auto mb-3" style={{ width: 'fit-content' }}>
              <FaShieldAlt className="fs-3" />
            </div>
            <h5 className="text-white fw-bold mb-2">Secure Transactions</h5>
            <p className="text-secondary small mb-0">
              Comprehensive authentication rules and moderate controls protect your bids and secure item allocations.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-panel border border-secondary p-4 h-100 text-center">
            <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle mx-auto mb-3" style={{ width: 'fit-content' }}>
              <FaUsers className="fs-3" />
            </div>
            <h5 className="text-white fw-bold mb-2">Engaged Community</h5>
            <p className="text-secondary small mb-0">
              Thousands of verified buyers and professional sellers interacting directly through instant bid communications.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-panel border border-secondary p-4 h-100 text-center">
            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle mx-auto mb-3" style={{ width: 'fit-content' }}>
              <FaChartLine className="fs-3" />
            </div>
            <h5 className="text-white fw-bold mb-2">Real-Time Market</h5>
            <p className="text-secondary small mb-0">
              Driven by Socket.io, watch highest bids update instantly on screen with dynamic countdown transitions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

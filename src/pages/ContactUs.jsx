import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle } from 'react-icons/fa';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="text-white fw-bold display-4">Contact <span className="text-gradient">Support</span></h1>
        <p className="text-secondary lead">Have questions? Get in touch with our security and operations team.</p>
      </div>

      <div className="row g-5">
        {/* Info Grid */}
        <div className="col-lg-5">
          <div className="glass-panel p-5 border border-secondary shadow h-100">
            <h4 className="text-white fw-bold mb-4">Contact Information</h4>
            
            <div className="d-flex align-items-center mb-4 text-secondary">
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-3 me-3">
                <FaEnvelope />
              </div>
              <div>
                <span className="small d-block text-muted">Email Support</span>
                <strong className="text-white">support@bidsphere.com</strong>
              </div>
            </div>

            <div className="d-flex align-items-center mb-4 text-secondary">
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 me-3">
                <FaPhoneAlt />
              </div>
              <div>
                <span className="small d-block text-muted">Phone Hotline</span>
                <strong className="text-white">+1 (800) 555-GAVEL</strong>
              </div>
            </div>

            <div className="d-flex align-items-center text-secondary">
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3 me-3">
                <FaMapMarkerAlt />
              </div>
              <div>
                <span className="small d-block text-muted">Corporate Office</span>
                <strong className="text-white">100 Market St, San Francisco, CA</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-lg-7">
          <div className="glass-panel p-5 border border-secondary shadow">
            <h4 className="text-white fw-bold mb-4">Send us a Message</h4>

            {success && (
              <div className="alert alert-success bg-success-subtle border-success text-success small p-3 rounded-3 mb-4">
                <FaCheckCircle className="me-2" /> Message sent successfully! Our team will respond shortly.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Name</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Message</label>
                <textarea
                  className="form-control form-control-custom"
                  rows="5"
                  placeholder="How can we help you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-premium px-5 py-2.5 w-100">
                Send Support Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

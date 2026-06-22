import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { FaSlidersH, FaSearch, FaFilter } from 'react-icons/fa';

const Categories = ['All', 'Electronics', 'Fashion', 'Collectibles', 'Art'];

const Auctions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'active');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('ending-soon');

  // Trigger fetch when parameters or filter triggers change
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (status) params.status = status;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const response = await axios.get('/products', { params });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync filter states from URL query parameters (useful when arriving from Home page links)
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    const urlStatus = searchParams.get('status') || 'active';
    
    setSearch(urlSearch);
    setCategory(urlCategory);
    setStatus(urlStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sort]); // Fetch on URL params or sorting changes

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category && category !== 'All') newParams.category = category;
    if (status) newParams.status = status;
    
    setSearchParams(newParams);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('active');
    setMinPrice('');
    setMaxPrice('');
    setSort('ending-soon');
    setSearchParams({});
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Filters Sidebar */}
        <div className="col-lg-3">
          <div className="glass-panel p-4 border border-secondary sticky-top" style={{ top: '90px' }}>
            <div className="d-flex align-items-center mb-4 text-gradient">
              <FaSlidersH className="me-2" />
              <h5 className="mb-0 fw-bold">Filter Products</h5>
            </div>

            <form onSubmit={handleApplyFilters}>
              {/* Keyword Search */}
              <div className="mb-3">
                <label className="text-secondary small mb-2 fw-semibold">Keywords</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    placeholder="e.g. Leica, Jordan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="text-secondary small mb-2 fw-semibold">Category</label>
                <select
                  className="form-select form-control-custom"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {Categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="text-secondary small mb-2 fw-semibold">Auction Status</label>
                <select
                  className="form-select form-control-custom"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active (Live)</option>
                  <option value="ended">Ended (Completed)</option>
                </select>
              </div>

              {/* Price Ranges */}
              <div className="mb-4">
                <label className="text-secondary small mb-2 fw-semibold">Price Range ($)</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control form-control-custom"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control form-control-custom"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-premium py-2 d-flex align-items-center justify-content-center">
                  <FaFilter className="me-2" /> Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-outline-secondary text-secondary py-2"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Catalog Main Panel */}
        <div className="col-lg-9">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h2 className="text-white fw-bold mb-1">Auction Catalog</h2>
              <p className="text-muted small mb-0">Found {products.length} matching auctions</p>
            </div>
            
            {/* Sorting controls */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small text-nowrap">Sort By:</span>
              <select
                className="form-select form-control-custom py-1 px-3"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="ending-soon">Ending Soon</option>
                <option value="newest">New Listings</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 glass-panel border border-secondary p-5">
              <h5 className="text-muted mb-3">No matching listings found</h5>
              <p className="text-secondary small mb-0">Try clearing filters or keyword queries to expand your search.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {products.map((product) => (
                <div className="col" key={product._id}>
                  <AuctionCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auctions;

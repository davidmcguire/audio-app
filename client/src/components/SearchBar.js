import React, { useState } from 'react';
import api from '../config/api';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      onSearch(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="search-input"
      />
      <button type="submit" disabled={loading} className="search-button">
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <div className="search-error">{error}</div>}
    </form>
  );
};

export default SearchBar; 
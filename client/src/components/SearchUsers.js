import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaDollarSign, FaUser, FaMicrophone } from 'react-icons/fa';
import api from '../utils/api';
import './SearchUsers.css';

const SearchUsers = ({ users }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Memoize the performSearch function
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowResults(true);
    }
  };
  
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setSearchQuery('');
  };
  
  const handlePricingClick = (userId, e) => {
    e.stopPropagation(); // Prevent triggering the parent click
    navigate(`/profile/${userId}#pricing`);
    setShowResults(false);
    setSearchQuery('');
  };
  
  // Add this new function to handle key press events
  const handleKeyPress = (e) => {
    // If Enter key is pressed and we have search results
    if (e.key === 'Enter' && searchResults.length > 0) {
      // Navigate to the first result's profile
      handleUserClick(searchResults[0]._id);
    }
  };
  
  return (
    <div className="search-users-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search Podcasts"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={handleKeyPress}
        />
      </div>
      
      {showResults && (
        <div className="search-results">
          {isLoading ? (
            <div className="search-loading">Searching...</div>
          ) : error ? (
            <div className="search-error">{error}</div>
          ) : searchResults.length === 0 ? (
            <div className="search-no-results">
              {searchQuery.trim().length >= 2 ? 'No users found' : 'Type at least 2 characters to search'}
            </div>
          ) : (
            <div className="search-users">
              {searchResults.map(user => (
                <Link to={`/profile/${user._id}`} key={user._id} className="search-user-item">
                  <div className="search-user-avatar">
                    {user.picture ? (
                      <img src={user.picture} alt={`${user.name}'s avatar`} />
                    ) : (
                      <div className="avatar-placeholder">{user.name[0]}</div>
                    )}
                  </div>
                  <div className="search-user-info">
                    <h3 className="search-user-name">{user.name}</h3>
                    <p className="search-user-bio">{user.bio || 'No bio available'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers; 
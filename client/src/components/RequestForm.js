import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './RequestForm.css';

const RequestForm = () => {
  const { userId, optionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    message: '',
    instructions: '',
    isRush: false,
  });
  const [option, setOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const response = await api.get(`/options/${optionId}`);
        setOption(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load request option. Please try again.');
        setLoading(false);
      }
    };

    fetchOption();
  }, [optionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        recipientId: userId,
        optionId,
      };

      await api.post('/requests/create', requestData);
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="request-form-container">Loading...</div>;
  }

  if (error) {
    return <div className="request-form-container error">{error}</div>;
  }

  if (!option) {
    return <div className="request-form-container error">Request option not found.</div>;
  }

  return (
    <div className="request-form-container">
      <h2>New Audio Request</h2>
      <div className="option-details">
        <h3>{option.title}</h3>
        <p className="price">${option.price}</p>
        <p className="description">{option.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label htmlFor="message">Message to Creator</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="What would you like the creator to say?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Special Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Any specific instructions or preferences?"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isRush"
              checked={formData.isRush}
              onChange={handleChange}
            />
            Rush Delivery (Additional fee applies)
          </label>
        </div>

        <div className="total-section">
          <p>Total: ${option.price + (formData.isRush ? option.rushFee : 0)}</p>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestForm; 
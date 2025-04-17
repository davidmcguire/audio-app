import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './AudioHistory.css';

const AudioHistory = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/recordings/my-recordings');
        setRecordings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recordings');
        console.error('Error loading recordings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const handleDelete = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      await api.delete(`/recordings/${recordingId}`);
      setRecordings(recordings.filter(rec => rec._id !== recordingId));
    } catch (err) {
      console.error('Error deleting recording:', err);
      alert(err.response?.data?.message || 'Failed to delete recording');
    }
  };

  if (loading) {
    return <div>Loading your recordings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="audio-history">
      <h2>Your Recordings</h2>
      {recordings.length === 0 ? (
        <p>No recordings found</p>
      ) : (
        <div className="recordings-grid">
          {recordings.map(recording => (
            <div key={recording._id} className="recording-card">
              <div className="recording-header">
                <h3>{recording.title}</h3>
                <button
                  onClick={() => handleDelete(recording._id)}
                  className="delete-btn"
                  aria-label="Delete recording"
                >
                  ×
                </button>
              </div>
              <p className="recording-date">
                {new Date(recording.createdAt).toLocaleDateString()}
              </p>
              {recording.description && (
                <p className="recording-description">{recording.description}</p>
              )}
              <audio controls src={recording.url} className="audio-player" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioHistory; 
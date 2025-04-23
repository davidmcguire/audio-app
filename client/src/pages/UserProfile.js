import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import './Profile.css'; // Reuse the Profile CSS

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        const [userResponse, recordingsResponse] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/recordings/user/${userId}`)
        ]);

        setUser(userResponse.data);
        setRecordings(recordingsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user profile');
        console.error('Error loading user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="profile-container loading">Loading user profile...</div>;
  }

  if (error) {
    return <div className="profile-container error">{error}</div>;
  }

  if (!user) {
    return <div className="profile-container error">User not found</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.picture ? (
            <img src={user.picture} alt={`${user.name}'s avatar`} />
          ) : (
            <div className="avatar-placeholder">{user.name[0]}</div>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      <div className="recordings-section">
        <h2>Recordings</h2>
        {recordings.length > 0 ? (
          <div className="recordings-grid">
            {recordings.map(recording => (
              <div key={recording._id} className="recording-card">
                <h3>{recording.title}</h3>
                <p>{recording.description}</p>
                <audio controls src={recording.url} />
              </div>
            ))}
          </div>
        ) : (
          <p>No recordings available</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 
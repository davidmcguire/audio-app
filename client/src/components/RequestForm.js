import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioRecorder from './AudioRecorder';
import './RequestForm.css';

const RequestForm = () => {
  const { podcasterId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    message: '',
    budget: ''
  });
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleRecordingComplete = (blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('podcasterId', podcasterId);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('budget', formData.budget);
      if (audioBlob) {
        formDataToSend.append('audio', audioBlob, 'voice-message.wav');
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="request-form-container">
      <h2>Request a Message</h2>
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label htmlFor="message">Your Message Request:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Describe what you'd like the podcaster to say..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="budget">Your Budget ($):</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
            min="1"
            step="1"
          />
        </div>
        <div className="form-group">
          <label>Record a Voice Message (Optional):</label>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          {audioUrl && (
            <div className="audio-preview">
              <audio src={audioUrl} controls />
              <button
                type="button"
                className="delete-recording"
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                }}
              >
                Delete Recording
              </button>
            </div>
          )}
        </div>
        <button type="submit" className="submit-button">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm; 
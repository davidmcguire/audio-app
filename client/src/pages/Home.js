import React, { useState } from 'react';
import AudioRecorder from '../components/AudioRecorder';
import './Home.css';

const Home = () => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleRecordingComplete = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setAudioBlob(blob);
  };

  const handleDeleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
  };

  return (
    <div className="home-container">
      <h1>VoiceGram</h1>
      <p className="subtitle">Request personalized audio messages from your favorite podcasters</p>
      
      <div className="recording-section">
        <h2>Record Your Message</h2>
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        
        {audioUrl && (
          <div className="audio-preview">
            <h3>Preview Your Recording</h3>
            <audio src={audioUrl} controls className="audio-player" />
            <button 
              onClick={handleDeleteRecording}
              className="delete-button"
            >
              Delete Recording
            </button>
          </div>
        )}
      </div>

      <div className="featured-podcasters">
        <h2>Featured Podcasters</h2>
        <div className="podcaster-grid">
          {/* Placeholder for podcaster list */}
          <div className="empty-state">
            No podcasters available yet. Check back soon!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
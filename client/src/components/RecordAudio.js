import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaMicrophone, FaStop, FaPlay, FaRedo, FaPaperPlane } from 'react-icons/fa';
import api from '../utils/api';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
`;

const RecordingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Timer = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.isRecording ? props.theme.colors.error : props.theme.colors.text};
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: ${props => {
    if (props.variant === 'record') return props.theme.colors.error;
    if (props.variant === 'stop') return props.theme.colors.error;
    if (props.variant === 'send') return props.theme.colors.primary;
    return props.theme.colors.backgroundDark;
  }};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const AudioPlayer = styled.div`
  width: 100%;
  margin-top: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundDark};
  border-radius: 8px;
`;

const RecordAudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        clearInterval(timerRef.current);
        setTimer(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const reRecord = () => {
    setAudioBlob(null);
    setIsPlaying(false);
    setTimer(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await api.post('/api/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle successful upload
      alert('Audio sent successfully!');
      setAudioBlob(null);
      setIsPlaying(false);
      setTimer(0);
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Error sending audio. Please try again.');
    }
  };

  return (
    <Container>
      <Title>Record Your Message</Title>
      
      <RecordingSection>
        <Timer isRecording={isRecording}>
          {formatTime(timer)}
        </Timer>

        {!audioBlob ? (
          <Controls>
            {!isRecording ? (
              <Button variant="record" onClick={startRecording}>
                <FaMicrophone /> Record
              </Button>
            ) : (
              <Button variant="stop" onClick={stopRecording}>
                <FaStop /> Stop
              </Button>
            )}
          </Controls>
        ) : (
          <Controls>
            <Button onClick={togglePlayback}>
              <FaPlay /> {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={reRecord}>
              <FaRedo /> Re-record
            </Button>
            <Button variant="send" onClick={handleSend}>
              <FaPaperPlane /> Send
            </Button>
          </Controls>
        )}
      </RecordingSection>

      {audioBlob && (
        <AudioPlayer>
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioBlob)}
            onEnded={() => setIsPlaying(false)}
          />
        </AudioPlayer>
      )}
    </Container>
  );
};

export default RecordAudio; 
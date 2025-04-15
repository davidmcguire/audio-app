import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const theme = {
  colors: {
    primary: '#8A2BE2',
    secondary: '#FF69B4',
    accent: '#FFD700',
    background: '#FFFFFF',
    text: '#333333',
    error: '#FF4444',
    success: '#00C851'
  },
  fonts: {
    main: "'Poppins', sans-serif"
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px'
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  }
};

function App() {
  return (
    <GoogleOAuthProvider clientId="692081369147-ro1vdfel9e4o45gf3souq0ksa5qp99kn.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App; 
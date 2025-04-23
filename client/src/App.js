import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GoogleOAuthProvider } from '@react-oauth/google';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestAudio from './pages/RequestAudio';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import Requests from './pages/Requests';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';

const AppContent = () => {
  const navigate = useNavigate();
  
  return (
    <AuthProvider navigate={navigate}>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/request/:podcasterId" element={<PrivateRoute><RequestAudio /></PrivateRoute>} />
          <Route path="/payment/:requestId" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
          <Route path="/earnings" element={<PrivateRoute><Earnings /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App; 
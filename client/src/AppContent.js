import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Inbox from './pages/Inbox';
import SentMessages from './pages/SentMessages';
import RequestInbox from './pages/RequestInbox';
import RequestForm from './pages/RequestForm';
import PaymentSettings from './pages/PaymentSettings';
import ChatPage from './pages/ChatPage';

const AppContent = () => {
  const navigate = useNavigate();
  
  return (
    <AuthProvider navigate={navigate}>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/creator-signup" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/inbox" element={
          <PrivateRoute>
            <Inbox />
          </PrivateRoute>
        } />
        <Route path="/sent-messages" element={
          <PrivateRoute>
            <SentMessages />
          </PrivateRoute>
        } />
        <Route path="/requests" element={
          <PrivateRoute>
            <RequestInbox />
          </PrivateRoute>
        } />
        <Route path="/request/:userId/:optionId" element={
          <PrivateRoute>
            <RequestForm />
          </PrivateRoute>
        } />
        <Route path="/payment-settings" element={
          <PrivateRoute>
            <PaymentSettings />
          </PrivateRoute>
        } />
        <Route path="/chat/:chatId?" element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
};

const AppWithRouter = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppWithRouter; 
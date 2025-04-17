import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaInbox, FaMicrophone, FaCog, FaUser, FaMoneyBill } from 'react-icons/fa';
import api from '../utils/api';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const WelcomeText = styled.h1`
  color: ${props => props.theme.colors.primary.main};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[8]};
`;

const DashboardCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};

  svg {
    color: ${props => props.theme.colors.primary.main};
    font-size: ${props => props.theme.typography.fontSizes.xl};
  }

  h2 {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSizes.lg};
    color: ${props => props.theme.colors.text.primary};
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-weight: ${props => props.theme.typography.fontWeights.semiBold};
  }
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const Stat = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};

  h3 {
    margin: 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
  }

  p {
    margin: ${props => props.theme.spacing[2]} 0 0;
    color: ${props => props.theme.colors.gray[600]};
    font-size: ${props => props.theme.typography.fontSizes.sm};
    font-family: ${props => props.theme.typography.fontFamily.primary};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  background: ${props => props.theme.colors.error.light};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedRequests: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if the API is accessible
        const healthCheck = await api.get('/health');
        if (!healthCheck.data || healthCheck.data.status !== 'ok') {
          throw new Error('API server is not responding correctly');
        }

        // Then fetch the dashboard stats
        const response = await api.get('/dashboard/stats');
        
        if (response.data) {
          setStats({
            pendingRequests: response.data.pendingRequests || 0,
            completedRequests: response.data.completedRequests || 0,
            totalEarnings: response.data.totalEarnings || 0,
            pendingEarnings: response.data.pendingEarnings || 0
          });
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <DashboardContainer>
        <WelcomeText>Loading dashboard...</WelcomeText>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeText>Welcome back, {user?.name || 'User'}!</WelcomeText>
        <ActionButton to="/profile">
          <FaUser /> Profile Settings
        </ActionButton>
      </DashboardHeader>

      {error && (
        <ErrorMessage>
          <FaCog />
          {error}
        </ErrorMessage>
      )}

      <DashboardContent>
        <DashboardCard>
          <CardHeader>
            <FaMicrophone />
            <h2>Audio Requests</h2>
          </CardHeader>
          <StatGrid>
            <Stat>
              <h3>{stats.pendingRequests}</h3>
              <p>Pending</p>
            </Stat>
            <Stat>
              <h3>{stats.completedRequests}</h3>
              <p>Completed</p>
            </Stat>
          </StatGrid>
          <ActionButton to="/requests" style={{ marginTop: '1rem' }}>
            View Requests
          </ActionButton>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <FaMoneyBill />
            <h2>Earnings</h2>
          </CardHeader>
          <StatGrid>
            <Stat>
              <h3>${stats.totalEarnings.toFixed(2)}</h3>
              <p>Total Earnings</p>
            </Stat>
            <Stat>
              <h3>${stats.pendingEarnings.toFixed(2)}</h3>
              <p>Pending</p>
            </Stat>
          </StatGrid>
          <ActionButton to="/earnings" style={{ marginTop: '1rem' }}>
            View Details
          </ActionButton>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <FaCog />
            <h2>Settings</h2>
          </CardHeader>
          <StatGrid>
            <Stat>
              <h3>{user?.isVerified ? 'Yes' : 'No'}</h3>
              <p>Verified</p>
            </Stat>
            <Stat>
              <h3>{user?.accountType || 'Basic'}</h3>
              <p>Account Type</p>
            </Stat>
          </StatGrid>
          <ActionButton to="/settings" style={{ marginTop: '1rem' }}>
            Manage Settings
          </ActionButton>
        </DashboardCard>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard; 
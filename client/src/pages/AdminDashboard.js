import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../utils/api';
import './AdminDashboard.css';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatTitle = styled.h3`
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const DisputeList = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
`;

const DisputeItem = styled.div`
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DisputeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const DisputeTitle = styled.h3`
  color: #333;
  margin: 0;
`;

const DisputeStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'under_review': return '#cce5ff';
      case 'resolved': return '#d4edda';
      case 'rejected': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'under_review': return '#004085';
      case 'resolved': return '#155724';
      case 'rejected': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const DisputeDetails = styled.div`
  margin-bottom: 1rem;
`;

const DisputeActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &.primary {
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  }

  &.danger {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }

  &.success {
    background: #28a745;
    color: white;
    &:hover { background: #218838; }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState({
    totalRevenue: { totalAmount: 0, totalPlatformFee: 0, totalCreatorAmount: 0, count: 0 },
    revenueByMethod: [],
    dailyRevenue: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalDisputes: 0,
    pendingDisputes: 0,
    totalRequests: 0,
    totalRevenue: 0
  });
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchRevenueData = useCallback(async () => {
    try {
      console.log('Fetching revenue data with date range:', dateRange);
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/admin/revenue', {
        params: dateRange
      });
      
      console.log('Revenue data received:', response.data);
      setRevenue(response.data);
    } catch (err) {
      console.error('Revenue data error details:', err.response || err);
      setError('Failed to fetch revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered');
    fetchRevenueData();
  }, [fetchRevenueData]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, disputesRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/disputes')
      ]);
      setStats(statsRes.data);
      setDisputes(disputesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert cents to dollars
  };

  // Prepare chart data
  console.log('Preparing chart data with daily revenue:', revenue.dailyRevenue);
  const chartData = {
    labels: revenue.dailyRevenue.map(day => day._id),
    datasets: [
      {
        label: 'Platform Revenue',
        data: revenue.dailyRevenue.map(day => day.totalPlatformFee / 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Platform Revenue'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  const handleResolveDispute = async (disputeId, resolution) => {
    try {
      await axios.post(`/api/admin/disputes/${disputeId}/resolve`, {
        resolution
      });
      setShowModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const handleRejectDispute = async (disputeId) => {
    try {
      await axios.post(`/api/admin/disputes/${disputeId}/reject`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting dispute:', error);
    }
  };

  if (!user?.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <DashboardContainer>
      <Header>Admin Dashboard</Header>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Disputes</StatTitle>
          <StatValue>{stats.totalDisputes}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Pending Disputes</StatTitle>
          <StatValue>{stats.pendingDisputes}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Requests</StatTitle>
          <StatValue>{stats.totalRequests}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Revenue</StatTitle>
          <StatValue>${stats.totalRevenue.toFixed(2)}</StatValue>
        </StatCard>
      </StatsGrid>

      <DisputeList>
        <h2>Active Disputes</h2>
        {disputes.map(dispute => (
          <DisputeItem key={dispute._id}>
            <DisputeHeader>
              <DisputeTitle>Dispute #{dispute._id.slice(-6)}</DisputeTitle>
              <DisputeStatus status={dispute.status}>
                {dispute.status.replace('_', ' ')}
              </DisputeStatus>
            </DisputeHeader>
            <DisputeDetails>
              <p><strong>Requester:</strong> {dispute.requester.name}</p>
              <p><strong>Creator:</strong> {dispute.creator.name}</p>
              <p><strong>Amount:</strong> ${dispute.pricingDetails.price}</p>
              <p><strong>Reason:</strong> {dispute.disputeDetails.reason}</p>
            </DisputeDetails>
            {dispute.status === 'pending' && (
              <DisputeActions>
                <Button 
                  className="primary"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setShowModal(true);
                  }}
                >
                  Resolve
                </Button>
                <Button 
                  className="danger"
                  onClick={() => handleRejectDispute(dispute._id)}
                >
                  Reject
                </Button>
              </DisputeActions>
            )}
          </DisputeItem>
        ))}
      </DisputeList>

      {showModal && (
        <Modal>
          <ModalContent>
            <h2>Resolve Dispute</h2>
            <p>Please provide resolution details:</p>
            <TextArea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution details..."
            />
            <DisputeActions>
              <Button 
                className="success"
                onClick={() => handleResolveDispute(selectedDispute._id, resolution)}
              >
                Submit Resolution
              </Button>
              <Button 
                className="danger"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </DisputeActions>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard; 
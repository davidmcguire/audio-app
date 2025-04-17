import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaCheck, FaTimes, FaClock, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';

const RequestsContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: flex;
  gap: 2rem;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
`;

const StatsContainer = styled.div`
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary.main};
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
    color: ${props => props.theme.colors.text.primary};
  }
  p {
    margin: 0.25rem 0 0;
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: 2rem;
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RequestCard = styled.div`
  background: ${props => props.unread ? props.theme.colors.gray[50] : 'white'};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 4px solid ${props => 
    props.status === 'pending' ? props.theme.colors.warning.main :
    props.status === 'accepted' ? props.theme.colors.success.main :
    props.theme.colors.error.main
  };
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RequesterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RequesterAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const RequesterName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[900]};
`;

const RequestDate = styled.span`
  color: ${props => props.theme.colors.gray[500]};
  font-size: 0.875rem;
`;

const RequestMessage = styled.p`
  color: ${props => props.theme.colors.gray[700]};
  line-height: 1.5;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AcceptButton = styled(ActionButton)`
  background-color: ${props => props.theme.colors.success.main};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.success.dark};
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: ${props => props.theme.colors.error.main};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.error.dark};
  }
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;

  ${props => props.status === 'pending' && `
    background-color: ${props.theme.colors.warning.light};
    color: ${props.theme.colors.warning.dark};
  `}

  ${props => props.status === 'accepted' && `
    background-color: ${props.theme.colors.success.light};
    color: ${props.theme.colors.success.dark};
  `}

  ${props => props.status === 'rejected' && `
    background-color: ${props.theme.colors.error.light};
    color: ${props.theme.colors.error.dark};
  `}
`;

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        
        const healthCheck = await api.get('/health');
        if (!healthCheck.data || healthCheck.data.status !== 'ok') {
          throw new Error('API server is not responding correctly');
        }

        const response = await api.get('/requests');
        
        if (response.data && Array.isArray(response.data)) {
          const transformedRequests = response.data.map(request => ({
            _id: request._id,
            requester: {
              name: request.requester?.name || 'Unknown User',
              picture: request.requester?.picture || null
            },
            message: request.message,
            price: request.price,
            status: request.status,
            createdAt: request.createdAt,
            isRead: request.isRead || false
          }));
          
          setRequests(transformedRequests);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err.message || 'Failed to load requests. Please try again later.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    try {
      setError('');
      await api.put(`/requests/${requestId}/${action}`);
      
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: action } 
            : request
        )
      );
    } catch (err) {
      console.error('Error handling request action:', err);
      setError(`Failed to ${action} request. Please try again.`);
    }
  };

  const totalRequests = requests.length;
  const unreadRequests = requests.filter(request => !request.isRead).length;
  const pendingRequests = requests.filter(request => request.status === 'pending').length;

  if (loading) {
    return (
      <RequestsContainer>
        <Title>Loading requests...</Title>
      </RequestsContainer>
    );
  }

  if (error) {
    return (
      <RequestsContainer>
        <Title>Error</Title>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </RequestsContainer>
    );
  }

  return (
    <RequestsContainer>
      <Sidebar>
        <Title>Messages</Title>
        <StatsContainer>
          <StatCard>
            <StatIcon>
              <FaEnvelope />
            </StatIcon>
            <StatInfo>
              <h3>{totalRequests}</h3>
              <p>Total Messages</p>
            </StatInfo>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FaEnvelopeOpen />
            </StatIcon>
            <StatInfo>
              <h3>{unreadRequests}</h3>
              <p>Unread Messages</p>
            </StatInfo>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FaClock />
            </StatIcon>
            <StatInfo>
              <h3>{pendingRequests}</h3>
              <p>Pending Requests</p>
            </StatInfo>
          </StatCard>
        </StatsContainer>
      </Sidebar>
      <MainContent>
        <RequestList>
          {requests.length > 0 ? (
            requests.map(request => (
              <RequestCard 
                key={request._id} 
                status={request.status}
                unread={!request.isRead}
              >
                <RequestHeader>
                  <RequesterInfo>
                    {request.requester.picture && (
                      <RequesterAvatar 
                        src={request.requester.picture} 
                        alt={request.requester.name} 
                      />
                    )}
                    <RequesterName>{request.requester.name}</RequesterName>
                  </RequesterInfo>
                  <RequestDate>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </RequestDate>
                </RequestHeader>
                <RequestMessage>{request.message}</RequestMessage>
                <RequestHeader>
                  <StatusBadge status={request.status}>
                    {request.status === 'pending' && <FaClock />}
                    {request.status === 'accepted' && <FaCheck />}
                    {request.status === 'rejected' && <FaTimes />}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </StatusBadge>
                  {request.status === 'pending' && (
                    <RequestActions>
                      <AcceptButton
                        onClick={() => handleRequestAction(request._id, 'accepted')}
                      >
                        <FaCheck /> Accept
                      </AcceptButton>
                      <RejectButton
                        onClick={() => handleRequestAction(request._id, 'rejected')}
                      >
                        <FaTimes /> Reject
                      </RejectButton>
                    </RequestActions>
                  )}
                </RequestHeader>
              </RequestCard>
            ))
          ) : (
            <p>No requests found</p>
          )}
        </RequestList>
      </MainContent>
    </RequestsContainer>
  );
};

export default Requests; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';

const RequestContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.error}20;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.success}20;
`;

const PodcasterCard = styled.div`
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 1.5rem;
  background-color: ${props => props.theme.colors.gray[50]};
`;

const PodcasterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PodcasterImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
`;

const PodcasterInfo = styled.div`
  flex: 1;
`;

const PodcasterName = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text.primary};
`;

const PodcasterCategory = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const PodcasterStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const DeliveryInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const DeliveryTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const RequestAudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [podcasters, setPodcasters] = useState([]);
  const [selectedPodcaster, setSelectedPodcaster] = useState(null);
  const [occasion, setOccasion] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPodcasters = async () => {
      try {
        const response = await api.get('/podcasters');
        setPodcasters(response.data);
      } catch (err) {
        setError('Failed to load podcasters. Please try again later.');
      }
    };

    fetchPodcasters();
  }, [user, navigate]);

  const handlePodcasterSelect = (podcasterId) => {
    const podcaster = podcasters.find(p => p.id === podcasterId);
    setSelectedPodcaster(podcaster);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/requests', {
        podcasterId: selectedPodcaster.id,
        occasion,
        instructions,
      });

      setSuccess(true);
      navigate(`/payment/${response.data.requestId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <RequestContainer>
      <Card>
        <h2>Request a Personalized Audio Message</h2>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="podcaster">Select Podcaster</Label>
            <Select
              id="podcaster"
              value={selectedPodcaster?.id || ''}
              onChange={(e) => handlePodcasterSelect(e.target.value)}
              required
            >
              <option value="">Choose a podcaster</option>
              {podcasters.map((podcaster) => (
                <option key={podcaster.id} value={podcaster.id}>
                  {podcaster.name} - ${podcaster.fee}
                </option>
              ))}
            </Select>
          </FormGroup>

          {selectedPodcaster && (
            <PodcasterCard>
              <PodcasterHeader>
                <PodcasterImage src={selectedPodcaster.image} alt={selectedPodcaster.name} />
                <PodcasterInfo>
                  <PodcasterName>{selectedPodcaster.name}</PodcasterName>
                  <PodcasterCategory>{selectedPodcaster.category}</PodcasterCategory>
                  <PodcasterStats>
                    <Stat>
                      <StatValue>{selectedPodcaster.rating}</StatValue>
                      <StatLabel>Rating</StatLabel>
                    </Stat>
                    <Stat>
                      <StatValue>{selectedPodcaster.completedRequests}</StatValue>
                      <StatLabel>Completed</StatLabel>
                    </Stat>
                    <Stat>
                      <StatValue>{selectedPodcaster.responseTime}</StatValue>
                      <StatLabel>Avg. Response</StatLabel>
                    </Stat>
                  </PodcasterStats>
                </PodcasterInfo>
              </PodcasterHeader>
              
              <DeliveryInfo>
                <DeliveryTime>
                  <span>🎯 Delivery Time: {selectedPodcaster.deliveryTime}</span>
                </DeliveryTime>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {selectedPodcaster.description}
                </p>
              </DeliveryInfo>
            </PodcasterCard>
          )}

          <FormGroup>
            <Label htmlFor="occasion">Occasion</Label>
            <Input
              id="occasion"
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g., Birthday, Anniversary, Graduation"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="instructions">Special Instructions</Label>
            <TextArea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide any specific details or instructions for the podcaster..."
              required
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Request submitted successfully! Redirecting to payment...</SuccessMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Form>
      </Card>
    </RequestContainer>
  );
};

export default RequestAudio; 
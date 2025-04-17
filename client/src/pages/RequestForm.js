import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../utils/api';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary.light}33;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.base};
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary.light}33;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-top: 0.5rem;
`;

const PriceDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  text-align: center;
  margin: 1rem 0;
`;

const RequestForm = () => {
  const { userId, optionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestDetails: '',
    occasion: '',
    forWhom: '',
    pronunciation: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pricingOption, setPricingOption] = useState(null);

  useEffect(() => {
    const fetchPricingOption = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pricing-options/${optionId}`);
        setPricingOption(response.data);
      } catch (err) {
        setError('Failed to load pricing option details');
        console.error('Error fetching pricing option:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingOption();
  }, [optionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/audio-requests', {
        ...formData,
        creatorId: userId,
        pricingOptionId: optionId
      });
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <Card.Body>Loading...</Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <Card.Body>
            <ErrorMessage>{error}</ErrorMessage>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>Request Audio Message</h2>
        </Card.Header>
        <Card.Body>
          {pricingOption && (
            <>
              <h3>{pricingOption.title}</h3>
              <p>{pricingOption.description}</p>
              <PriceDisplay>${pricingOption.price.toFixed(2)}</PriceDisplay>
            </>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="requestDetails">Request Details *</Label>
              <TextArea
                id="requestDetails"
                name="requestDetails"
                value={formData.requestDetails}
                onChange={handleChange}
                placeholder="Describe what you'd like the creator to say..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="occasion">Occasion (Optional)</Label>
              <Input
                type="text"
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                placeholder="e.g., Birthday, Anniversary, etc."
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="forWhom">For Whom (Optional)</Label>
              <Input
                type="text"
                id="forWhom"
                name="forWhom"
                value={formData.forWhom}
                onChange={handleChange}
                placeholder="Who is this message for?"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="pronunciation">Pronunciation Notes (Optional)</Label>
              <TextArea
                id="pronunciation"
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleChange}
                placeholder="Add any pronunciation notes for names or specific words..."
              />
            </FormGroup>

            <Button 
              type="submit" 
              $variant="primary"
              $fullWidth
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestForm; 
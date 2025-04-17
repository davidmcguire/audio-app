import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

const PaymentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const PaymentDetails = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
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
  width: 100%;
  
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
  margin-bottom: 1rem;
`;

const PaymentMethods = styled.div`
  margin: 1.5rem 0;
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }
  
  ${props => props.selected && `
    border-color: ${props.theme.colors.primary.main};
    background-color: ${props.theme.colors.primary.main}10;
  `}
`;

const PaymentMethodIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 1rem;
`;

const PaymentMethodInfo = styled.div`
  flex: 1;
`;

const PaymentMethodName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const PaymentMethodDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const PaymentForm = styled.div`
  margin-top: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardInput = styled(Input)`
  flex: 1;
`;

const ExpiryInput = styled(Input)`
  width: 120px;
`;

const CVVInput = styled(Input)`
  width: 100px;
`;

const SecurityInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const Payment = () => {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRequest = async () => {
      try {
        const response = await api.get(`/requests/${requestId}`);
        setRequest(response.data);
      } catch (err) {
        setError('Failed to load request details. Please try again later.');
      }
    };

    fetchRequest();
  }, [requestId, user, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/requests/${requestId}/payment`, {
        paymentMethod: selectedMethod,
        cardNumber,
        expiry,
        cvv,
        name,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !request) {
    return null;
  }

  return (
    <PaymentContainer>
      <Card>
        <h2>Complete Your Payment</h2>
        
        <PaymentDetails>
          <DetailRow>
            <DetailLabel>Podcaster</DetailLabel>
            <DetailValue>{request.podcaster.name}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Occasion</DetailLabel>
            <DetailValue>{request.occasion}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Fee</DetailLabel>
            <DetailValue>${request.podcaster.fee}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Delivery Time</DetailLabel>
            <DetailValue>{request.podcaster.deliveryTime}</DetailValue>
          </DetailRow>
        </PaymentDetails>

        <PaymentMethods>
          <h3>Select Payment Method</h3>
          <PaymentMethod 
            selected={selectedMethod === 'card'}
            onClick={() => setSelectedMethod('card')}
          >
            <PaymentMethodIcon src="/credit-card.svg" alt="Credit Card" />
            <PaymentMethodInfo>
              <PaymentMethodName>Credit/Debit Card</PaymentMethodName>
              <PaymentMethodDescription>Pay with Visa, Mastercard, or American Express</PaymentMethodDescription>
            </PaymentMethodInfo>
          </PaymentMethod>
          
          <PaymentMethod 
            selected={selectedMethod === 'paypal'}
            onClick={() => setSelectedMethod('paypal')}
          >
            <PaymentMethodIcon src="/paypal.svg" alt="PayPal" />
            <PaymentMethodInfo>
              <PaymentMethodName>PayPal</PaymentMethodName>
              <PaymentMethodDescription>Pay with your PayPal account</PaymentMethodDescription>
            </PaymentMethodInfo>
          </PaymentMethod>
        </PaymentMethods>

        {selectedMethod === 'card' && (
          <PaymentForm>
            <FormGroup>
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name on card"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="cardNumber">Card Number</Label>
              <CardInput
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
              />
            </FormGroup>

            <InputGroup>
              <FormGroup>
                <Label htmlFor="expiry">Expiry Date</Label>
                <ExpiryInput
                  id="expiry"
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cvv">CVV</Label>
                <CVVInput
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  required
                />
              </FormGroup>
            </InputGroup>

            <SecurityInfo>
              🔒 Your payment information is encrypted and secure. We never store your full card details.
            </SecurityInfo>
          </PaymentForm>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </Card>
    </PaymentContainer>
  );
};

export default Payment; 
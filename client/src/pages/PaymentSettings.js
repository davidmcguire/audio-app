import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.action.disabledBackground};
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background.light};
  color: ${props => props.theme.colors.text.primary};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: 0.5rem;
`;

const PaymentSettings = () => {
  const { user, token } = useAuth();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/settings`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStripeStatus(response.data.stripe);
        setPaypalStatus(response.data.paypal);
      } catch (err) {
        setError('Failed to load payment settings');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [token]);

  const handleStripeConnect = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/create-stripe-account-link`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to connect Stripe account');
    }
  };

  const handlePayPalConnect = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/create-paypal-account-link`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to connect PayPal account');
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Title>Payment Settings</Title>
      
      <Section>
        <SectionTitle>Stripe</SectionTitle>
        <Button 
          onClick={handleStripeConnect}
          disabled={stripeStatus?.connected}
        >
          {stripeStatus?.connected ? 'Connected' : 'Connect Stripe Account'}
        </Button>
        {stripeStatus?.connected && (
          <Status>
            Stripe account connected. You can now receive payments.
          </Status>
        )}
      </Section>

      <Section>
        <SectionTitle>PayPal</SectionTitle>
        <Button 
          onClick={handlePayPalConnect}
          disabled={paypalStatus?.connected}
        >
          {paypalStatus?.connected ? 'Connected' : 'Connect PayPal Account'}
        </Button>
        {paypalStatus?.connected && (
          <Status>
            PayPal account connected. You can now receive payments.
          </Status>
        )}
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default PaymentSettings; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Section = styled.section`
  background: white;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.gray[900]};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary.light};
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success.main};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const Settings = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/user/profile');
        setUsername(response.data.username);
        if (response.data.bankDetails) {
          setBankDetails(response.data.bankDetails);
        }
      } catch (err) {
        setError('Failed to load user details');
      }
    };

    fetchUserDetails();
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/user/profile', { username });
      setSuccess('Username updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/user/bank-details', bankDetails);
      setSuccess('Bank details updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <Section>
        <Title>Profile Settings</Title>
        <form onSubmit={handleUsernameSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Username'}
          </Button>
        </form>
      </Section>

      <Section>
        <Title>Bank Details</Title>
        <form onSubmit={handleBankDetailsSubmit}>
          <FormGroup>
            <Label htmlFor="accountName">Account Holder Name</Label>
            <Input
              type="text"
              id="accountName"
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              type="text"
              id="bankName"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              type="text"
              id="accountNumber"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              type="text"
              id="routingNumber"
              value={bankDetails.routingNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Bank Details'}
          </Button>
        </form>
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </SettingsContainer>
  );
};

export default Settings; 
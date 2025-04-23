import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaMoneyBillWave, FaHistory } from 'react-icons/fa';

const EarningsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  margin: 0;
`;

const EarningsCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: 2rem;
`;

const TotalEarnings = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Amount = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  color: ${props => props.theme.colors.text.primary};
  margin: 1rem 0;
`;

const Currency = styled.span`
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const Stat = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.md};

  h3 {
    margin: 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
  }

  p {
    margin: 0.5rem 0 0;
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const RecentTransactions = styled.div`
  margin-top: 2rem;
`;

const TransactionList = styled.div`
  margin-top: 1rem;
`;

const Transaction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary.main};
`;

const TransactionDetails = styled.div`
  h4 {
    margin: 0;
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    margin: 0.25rem 0 0;
    color: ${props => props.theme.colors.gray[600]};
    font-size: ${props => props.theme.typography.fontSizes.sm};
  }
`;

const TransactionAmount = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.semiBold};
  color: ${props => props.theme.colors.text.primary};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.gray[600]};
`;

const Earnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    currency: 'USD',
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/earnings');
        if (response.data) {
          setEarnings({
            total: response.data.total || 0,
            pending: response.data.pending || 0,
            currency: response.data.currency || 'USD',
            recentTransactions: response.data.recentTransactions || []
          });
        }
        setError(null);
      } catch (err) {
        setError('Failed to load earnings data');
        console.error('Earnings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <EarningsContainer>
        <LoadingMessage>Loading earnings data...</LoadingMessage>
      </EarningsContainer>
    );
  }

  if (error) {
    return (
      <EarningsContainer>
        <Title>Error</Title>
        <p style={{ color: 'red' }}>{error}</p>
      </EarningsContainer>
    );
  }

  return (
    <EarningsContainer>
      <Header>
        <Title>Earnings</Title>
      </Header>

      <EarningsCard>
        <TotalEarnings>
          <h3>Total Earnings</h3>
          <Amount>
            {earnings.currency} {earnings.total.toFixed(2)}
          </Amount>
          <Currency>All time</Currency>
        </TotalEarnings>

        <StatsGrid>
          <Stat>
            <h3>{earnings.currency} {earnings.pending.toFixed(2)}</h3>
            <p>Pending</p>
          </Stat>
          <Stat>
            <h3>{earnings.currency} {(earnings.total - earnings.pending).toFixed(2)}</h3>
            <p>Available</p>
          </Stat>
        </StatsGrid>

        <RecentTransactions>
          <h3>Recent Transactions</h3>
          <TransactionList>
            {earnings.recentTransactions.length > 0 ? (
              earnings.recentTransactions.map((transaction, index) => (
                <Transaction key={index}>
                  <TransactionInfo>
                    <TransactionIcon>
                      <FaMoneyBillWave />
                    </TransactionIcon>
                    <TransactionDetails>
                      <h4>{transaction.description || 'Payment'}</h4>
                      <p>{new Date(transaction.date).toLocaleDateString()}</p>
                    </TransactionDetails>
                  </TransactionInfo>
                  <TransactionAmount>
                    {earnings.currency} {transaction.amount.toFixed(2)}
                  </TransactionAmount>
                </Transaction>
              ))
            ) : (
              <p>No recent transactions</p>
            )}
          </TransactionList>
        </RecentTransactions>
      </EarningsCard>
    </EarningsContainer>
  );
};

export default Earnings; 
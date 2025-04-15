import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-family: ${props => props.theme.fonts.main};
  margin-bottom: 2rem;
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <DashboardHeader>Welcome to Your Dashboard</DashboardHeader>
      <DashboardContent>
        <DashboardCard>
          <h2>Recent Activity</h2>
          <p>Your recent activity will appear here.</p>
        </DashboardCard>
        <DashboardCard>
          <h2>Statistics</h2>
          <p>Your statistics will appear here.</p>
        </DashboardCard>
        <DashboardCard>
          <h2>Upcoming Tasks</h2>
          <p>Your upcoming tasks will appear here.</p>
        </DashboardCard>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard; 
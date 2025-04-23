import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.gray[50]};
`;

const MainContent = styled.main`
  padding-top: ${props => props.$isAuthenticated ? '5rem' : '0'};
  min-height: calc(100vh - ${props => props.$isAuthenticated ? '5rem' : '0'});
`;

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <LayoutContainer>
      {isAuthenticated && <Navbar />}
      <MainContent $isAuthenticated={isAuthenticated}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 
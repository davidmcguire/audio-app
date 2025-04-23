import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutButtonContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
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

const LogoutButtonComponent = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <LogoutButtonContainer>
      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt /> Log Out
      </LogoutButton>
    </LogoutButtonContainer>
  );
};

export default LogoutButtonComponent; 
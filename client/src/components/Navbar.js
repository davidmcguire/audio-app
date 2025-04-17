import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaMicrophone } from 'react-icons/fa';

const NavbarContainer = styled.nav`
  background: white;
  padding: 1rem 2rem;
  box-shadow: ${props => props.theme.shadows.sm};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.gray[700]};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
    background-color: ${props => props.theme.colors.gray[100]};
  }

  svg {
    font-size: 1.25rem;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.gray[700]};
  background: none;
  border: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.error.main};
    background-color: ${props => props.theme.colors.gray[100]};
  }

  svg {
    font-size: 1.25rem;
  }
`;

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <NavbarContainer>
      <NavContent>
        <NavLinks>
          <NavLink to="/dashboard">
            <FaHome /> Dashboard
          </NavLink>
          <NavLink to="/profile">
            <FaUser /> Profile
          </NavLink>
          <NavLink to="/settings">
            <FaCog /> Settings
          </NavLink>
        </NavLinks>
        <LogoutButton onClick={logout}>
          <FaSignOutAlt /> Logout
        </LogoutButton>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar; 
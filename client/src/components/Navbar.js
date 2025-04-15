import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
`;

const LogoContainer = styled(Link)`
  font-size: 1.5rem;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const NavRight = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const LoginButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const RegisterButton = styled(Link)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  padding: 0.5rem 1.5rem;
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
`;

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <NavbarContainer>
      <NavLeft>
        <LogoContainer to="/">
          Fanswoon
        </LogoContainer>
      </NavLeft>
      <NavRight>
        <LoginButton to="/login">Login</LoginButton>
        <RegisterButton to="/signup">Sign Up</RegisterButton>
      </NavRight>
    </NavbarContainer>
  );
};

export default Navbar; 
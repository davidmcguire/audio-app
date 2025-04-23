import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${props => props.theme.colors.background};
`;

const LoginBox = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2em;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.typography.fontFamily.primary};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 30px;
  font-family: ${props => props.theme.typography.fontFamily.primary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 24px;
  background-color: white;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 15px;

  &:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DirectLoginButton = styled(Button)`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}dd;
  }
`;

const GoogleButton = styled(Button)``;

const GoogleIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: 20px;
  padding: 10px;
  border-radius: ${props => props.theme.borderRadius.base};
  background-color: ${props => props.theme.colors.error}20;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  margin-top: 20px;
  padding: 10px;
  border-radius: ${props => props.theme.borderRadius.base};
  background-color: ${props => props.theme.colors.success}20;
`;

const Login = () => {
  const { login, googleLogin, isGoogleLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleDirectLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await login('test@example.com', 'password');
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    
    try {
      const result = await googleLogin({});
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <LoginContainer>
      <Logo />
      <LoginBox>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to continue</Subtitle>
        
        <DirectLoginButton onClick={handleDirectLogin} disabled={isLoading || isGoogleLoading}>
          {isLoading ? 'Signing in...' : 'Sign in as Test User'}
        </DirectLoginButton>
        
        <GoogleButton onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
          <GoogleIcon src="/google-icon.svg" alt="Google" />
          {isGoogleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
        </GoogleButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </LoginBox>
    </LoginContainer>
  );
};

export default Login; 
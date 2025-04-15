import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Logo from '../components/Logo';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../utils/api';

const LoginContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
`;

const LoginBox = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LoginHeader = styled(Card.Header)`
  text-align: center;
  border-bottom: none;
  padding-bottom: 0;
`;

const LoginTitle = styled.h1`
  font-size: 1.75rem;
  color: ${props => props.theme.colors.text};
  font-weight: 700;
  margin: 0;
`;

const LoginForm = styled.form`
  width: 100%;
`;

const GoogleLoginContainer = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }
  
  span {
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.2);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const GoogleButton = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential, null, true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LoginHeader>
          <Logo size="large" />
          <LoginTitle>Sign In</LoginTitle>
        </LoginHeader>
        
        <Card.Body>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <GoogleLoginContainer>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google login failed. Please try again.');
              }}
              useOneTap
              theme="filled_blue"
            />
          </GoogleLoginContainer>
          
          <Divider>
            <span>OR</span>
          </Divider>
          
          <LoginForm onSubmit={handleSubmit}>
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
            >
              Sign In
            </Button>
          </LoginForm>
          
          <RegisterLink>
            Don't have an account?
            <Link to="/register">Sign Up</Link>
          </RegisterLink>
        </Card.Body>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login; 
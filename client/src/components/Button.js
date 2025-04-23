import React from 'react';
import styled, { css } from 'styled-components';

const ButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$size === 'small' 
    ? '0.4rem 0.8rem' 
    : props.$size === 'large' 
      ? '1rem 2rem' 
      : '0.75rem 1.5rem'};
  font-size: ${props => props.$size === 'small' 
    ? props.theme.typography.fontSizes.sm
    : props.$size === 'large' 
      ? props.theme.typography.fontSizes.lg
      : props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.semiBold};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: ${props => props.theme.typography.fontFamily.primary};
  text-decoration: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.$variant === 'primary' && css`
    background-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.white};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary.dark};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
      outline: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: ${props => props.theme.colors.white};
    color: ${props => props.theme.colors.text.primary};
    border-color: ${props => props.theme.colors.gray[300]};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.gray[100]};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
      outline: none;
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: transparent;
    color: ${props => props.theme.colors.primary.main};
    border-color: ${props => props.theme.colors.primary.main};
    
    &:hover:not(:disabled) {
      background-color: rgba(74, 144, 226, 0.05);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
      outline: none;
    }
  `}
  
  ${props => props.$variant === 'danger' && css`
    background-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.white};
    
    &:hover:not(:disabled) {
      background-color: #ff7875;
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.3);
      outline: none;
    }
  `}
`;

const StyledButton = styled.button`${ButtonStyles}`;
const StyledLink = styled.a`${ButtonStyles}`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  as, 
  href, 
  ...props 
}) => {
  if (as === 'a' || href) {
    return (
      <StyledLink 
        href={href} 
        $variant={variant} 
        $size={size} 
        $fullWidth={fullWidth} 
        {...props}
      >
        {children}
      </StyledLink>
    );
  }
  
  return (
    <StyledButton 
      $variant={variant} 
      $size={size} 
      $fullWidth={fullWidth} 
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane } from 'react-icons/fa';

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.background.paper};
  border-top: 1px solid ${props => props.theme.colors.divider};
`;

const Input = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 0.5rem;
  resize: none;
  min-height: 2.5rem;
  max-height: 6rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  background-color: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.action.disabledBackground};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primary.dark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.action.disabledBackground};
    cursor: not-allowed;
  }
`;

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
      />
      <SendButton type="submit" disabled={!message.trim() || disabled}>
        <FaPaperPlane />
      </SendButton>
    </Form>
  );
};

export default MessageInput; 
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${props => props.theme.colors.background.default};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  color: ${props => props.theme.colors.error.main};
  text-align: center;
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

const Chat = ({ recipientId }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/${recipientId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [recipientId, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || sending) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: user._id,
      recipient: recipientId,
      content,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setSending(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          recipientId,
          content
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? response.data : msg
        )
      );
    } catch (err) {
      setMessages(prev =>
        prev.filter(msg => msg._id !== tempId)
      );
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        Loading messages...
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <div>{error}</div>
        <RetryButton onClick={fetchMessages}>
          Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <MessageList
        messages={messages}
        currentUserId={user._id}
      />
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
      />
    </Container>
  );
};

export default Chat; 
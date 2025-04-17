import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import { FaPaperPlane } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
`;

const ChatContainer = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.$isMine ? props.theme.colors.primary.main : props.theme.colors.gray[100]};
  color: ${props => props.$isMine ? props.theme.colors.white : props.theme.colors.text.primary};
  align-self: ${props => props.$isMine ? 'flex-end' : 'flex-start'};
  position: relative;
  word-wrap: break-word;
`;

const MessageTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 0.25rem;
  display: block;
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  display: flex;
  gap: 1rem;
  background-color: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary.light}33;
  }
`;

const SendButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  text-align: center;
  padding: 1rem;
`;

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds
    return () => clearInterval(interval);
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/chats/${chatId}`);
      setMessages(response.data.messages);
      setChatInfo(response.data.chatInfo);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/api/chats/${chatId}/messages`, {
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <ChatContainer>
          <Card.Body>Loading...</Card.Body>
        </ChatContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ChatContainer>
        <Card.Header>
          <h2>
            {chatInfo ? `Chat with ${chatInfo.otherUser.name}` : 'Chat'}
          </h2>
        </Card.Header>
        
        <MessagesContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {messages.map((message) => (
            <MessageBubble 
              key={message._id} 
              $isMine={message.sender._id === user._id}
            >
              {message.content}
              <MessageTime>{formatTime(message.createdAt)}</MessageTime>
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <form 
            onSubmit={handleSendMessage} 
            style={{ display: 'flex', gap: '1rem', width: '100%' }}
          >
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <SendButton 
              type="submit" 
              $variant="primary"
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane /> Send
            </SendButton>
          </form>
        </InputContainer>
      </ChatContainer>
    </Container>
  );
};

export default ChatPage; 
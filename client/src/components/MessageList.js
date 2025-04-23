import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${props => props.theme.colors.background.paper};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  align-self: ${props => props.isSent ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isSent 
    ? props.theme.colors.primary.main 
    : props.theme.colors.background.default};
  color: ${props => props.isSent 
    ? props.theme.colors.primary.contrastText 
    : props.theme.colors.text.primary};
  box-shadow: ${props => props.theme.shadows[1]};
`;

const MessageText = styled.p`
  margin: 0;
  word-wrap: break-word;
`;

const MessageTime = styled.span`
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.7;
`;

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Container>
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId;
        return (
          <MessageBubble key={message._id} isSent={isSent}>
            <MessageText>{message.text}</MessageText>
            <MessageTime>
              {format(new Date(message.createdAt), 'h:mm a')}
            </MessageTime>
          </MessageBubble>
        );
      })}
      <div ref={bottomRef} />
    </Container>
  );
};

export default MessageList; 
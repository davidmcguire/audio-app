import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FaUser } from 'react-icons/fa';

const MessageContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: ${props => props.isOwn ? props.theme.colors.background.light : '#fff'};
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Name = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Timestamp = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const Text = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Message = ({ message, isOwn }) => {
  const {
    sender,
    content,
    createdAt,
  } = message;

  return (
    <MessageContainer isOwn={isOwn}>
      <Avatar>
        {sender.picture ? (
          <img src={sender.picture} alt={sender.name} />
        ) : (
          <FaUser />
        )}
      </Avatar>
      <Content>
        <Header>
          <Name>{sender.name}</Name>
          <Timestamp>{format(new Date(createdAt), 'MMM d, yyyy h:mm a')}</Timestamp>
        </Header>
        <Text>{content}</Text>
      </Content>
    </MessageContainer>
  );
};

export default Message; 
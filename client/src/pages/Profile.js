import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import styled from 'styled-components';
import Card from '../components/Card';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.theme.colors.primary.main};
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
`;

const ProfileEmail = styled.p`
  margin: 0.5rem 0;
  color: ${props => props.theme.colors.text.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.error}20;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.success}20;
`;

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    displayName: '',
    location: '',
    profession: '',
    profileTheme: 'default',
    acceptsRequests: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setFormData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          displayName: response.data.displayName || '',
          location: response.data.location || '',
          profession: response.data.profession || '',
          profileTheme: response.data.profileTheme || 'default',
          acceptsRequests: response.data.acceptsRequests !== false
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.patch('/users/profile', formData);
      setUser(response.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProfileContainer>
      <Card>
        <ProfileHeader>
          <ProfileImage src={user.picture || '/default-avatar.png'} alt={user.name} />
          <ProfileInfo>
            <ProfileName>{user.name}</ProfileName>
            <ProfileEmail>{user.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <TextArea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              name="profession"
              type="text"
              value={formData.profession}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                name="acceptsRequests"
                checked={formData.acceptsRequests}
                onChange={handleChange}
              />
              Accept Audio Requests
            </Label>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Profile updated successfully!</SuccessMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Form>
      </Card>
    </ProfileContainer>
  );
};

export default Profile; 
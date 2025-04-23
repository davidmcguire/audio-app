import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main} 0%, ${props => props.theme.colors.secondary.main} 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/waveform.svg') repeat-x;
    opacity: 0.1;
    animation: float 20s linear infinite;
  }

  @keyframes float {
    from { background-position: 0 0; }
    to { background-position: 100% 0; }
  }
`;

const Title = styled.h1`
  font-size: 4em;
  margin: 0;
  font-family: ${props => props.theme.typography.fontFamily.primary};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 1.5em;
  margin: 20px 0 40px;
  font-family: ${props => props.theme.typography.fontFamily.primary};
`;

const AuthButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
`;

const AuthButton = styled.button`
  background: ${props => props.$variant === 'primary' ? props.theme.colors.accent.main : props.theme.colors.primary.main};
  color: white;
  padding: 20px 30px;
  border-radius: 30px;
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: 1.2em;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-family: ${props => props.theme.typography.fontFamily.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GoogleIcon = styled.span`
  font-size: 1.5em;
`;

const Section = styled.section`
  padding: 80px 20px;
  text-align: center;
  background-color: ${props => props.theme.colors.background};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureItem = styled.li`
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.1em;
  color: ${props => props.theme.colors.text.primary};
`;

const CTA = styled.div`
  background: ${props => props.theme.colors.accent.main};
  padding: 60px 20px;
  text-align: center;
  border-radius: 20px;
  margin: 40px;
  color: ${props => props.theme.colors.white};
`;

const Footer = styled.footer`
  background: ${props => props.theme.colors.gray[900]};
  color: white;
  padding: 40px 20px;
  text-align: center;
`;

const LandingPage = () => {
  const { googleLogin, isGoogleLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = async (isNewUser = false) => {
    try {
      // First complete the Google authentication
      const user = await googleLogin();
      
      // Only after successful authentication, check if we need to redirect to profile
      if (isNewUser || !user?.profileComplete) {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div>
      <HeroSection>
        <Title>Fanswoon</Title>
        <Subtitle>Where voices meet hearts.</Subtitle>
        <AuthButtonGroup>
          <AuthButton 
            onClick={() => handleGoogleAuth(true)}
            disabled={isGoogleLoading}
            $variant="primary"
          >
            <GoogleIcon>G</GoogleIcon>
            {isGoogleLoading ? 'Signing in...' : 'Sign up with Google'}
          </AuthButton>
          <AuthButton 
            onClick={() => handleGoogleAuth(false)}
            disabled={isGoogleLoading}
          >
            <GoogleIcon>G</GoogleIcon>
            {isGoogleLoading ? 'Signing in...' : 'Login with Google'}
          </AuthButton>
        </AuthButtonGroup>
      </HeroSection>

      <Section>
        <h2>❤️ For Superfans: Closer Than Ever to Your Favorites</h2>
        <p>Turn love into action.</p>
        <FeatureList>
          <FeatureItem>🎵 Personalized Audio Magic: Commission custom voice messages, secret episode insights, or a shoutout just for you.</FeatureItem>
          <FeatureItem>💬 Direct Access: Chat with hosts, vote on episode topics, or get early access to recordings.</FeatureItem>
          <FeatureItem>🌟 Join the Inner Circle: Unlock badges, exclusive Discord channels, and fan-only live Q&As.</FeatureItem>
        </FeatureList>
        <Card>
          <p>"I got my favorite host to narrate my proposal—it was unforgettable!"</p>
          <p>- Sarah, Fanswoon Superfan</p>
        </Card>
      </Section>

      <Section>
        <h2>🎙️ For Podcasters: Fuel Your Passion, Grow Your Tribe</h2>
        <p>Turn your voice into a thriving community.</p>
        <FeatureList>
          <FeatureItem>🎵 Bespoke Audio Shop: Sell custom content at your price</FeatureItem>
          <FeatureItem>💝 Deepen Loyalty: Reward top fans with behind-the-mic access</FeatureItem>
          <FeatureItem>💰 Keep 90% of Earnings: Low fees, instant payouts</FeatureItem>
        </FeatureList>
        <Card>
          <p>"Fanswoon helped me quit my day job. My fans fund my creativity directly."</p>
          <p>- Jay, True Crime Podcaster</p>
        </Card>
      </Section>

      <Section>
        <h2>How It Works</h2>
        <Grid>
          <Card>
            <h3>🎉 For Fans</h3>
            <p>1. Find your favorite podcast<br />2. Choose a custom audio tier<br />3. Get a unique piece of magic!</p>
          </Card>
          <Card>
            <h3>⚡ For Creators</h3>
            <p>1. Set up your audio shop in minutes<br />2. Share with your audience<br />3. Earn while you create!</p>
          </Card>
          <Card>
            <h3>💌 For Everyone</h3>
            <p>No ads. No algorithms. Just pure, unfiltered connection.</p>
          </Card>
        </Grid>
      </Section>

      <CTA>
        <h2>Ready to Fall in Love with Podcasting Again?</h2>
        <p>Whether you're a fan or a creator, Fanswoon turns passion into connection.</p>
        <AuthButtonGroup>
          <AuthButton 
            onClick={() => handleGoogleAuth(true)}
            disabled={isGoogleLoading}
            $variant="primary"
          >
            <GoogleIcon>G</GoogleIcon>
            {isGoogleLoading ? 'Signing in...' : 'Sign up with Google'}
          </AuthButton>
          <AuthButton 
            onClick={() => handleGoogleAuth(false)}
            disabled={isGoogleLoading}
          >
            <GoogleIcon>G</GoogleIcon>
            {isGoogleLoading ? 'Signing in...' : 'Login with Google'}
          </AuthButton>
        </AuthButtonGroup>
      </CTA>

      <Footer>
        <p>© 2024 Fanswoon. Made for fans, by fans.</p>
        <div>
          <a href="#" style={{ margin: '0 10px', color: 'white' }}>TikTok</a>
          <a href="#" style={{ margin: '0 10px', color: 'white' }}>Instagram</a>
          <a href="#" style={{ margin: '0 10px', color: 'white' }}>Spotify</a>
        </div>
      </Footer>
    </div>
  );
};

export default LandingPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchBar = styled.div`
  margin-bottom: 30px;
  
  input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    
    &:focus {
      border-color: #FF4D4D;
      outline: none;
    }
  }
`;

const CreatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
`;

const CreatorCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CreatorImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CreatorInfo = styled.div`
  padding: 20px;
`;

const CreatorName = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: #333;
`;

const CreatorBio = styled.p`
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const PricingSection = styled.div`
  border-top: 1px solid #eee;
  padding: 15px 20px;
`;

const PricingOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const RequestButton = styled.button`
  background: #FF4D4D;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #FF3333;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: ${props => props.active ? '#FF4D4D' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #FF4D4D;
    color: #FF4D4D;
  }
`;

const PodcastCreatorBrowse = () => {
  const [creators, setCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await axios.get('/api/creators');
      setCreators(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching creators:', error);
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         creator.pricingOptions.some(option => option.category === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  const handleRequest = async (creatorId, pricingOptionId) => {
    try {
      // Navigate to request form with creator and pricing option details
      window.location.href = `/request/${creatorId}/${pricingOptionId}`;
    } catch (error) {
      console.error('Error initiating request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2>Find Your Favorite Podcast Creators</h2>
      
      <SearchBar>
        <input
          type="text"
          placeholder="Search creators or podcast names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <FilterSection>
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton
          active={activeFilter === 'shoutout'}
          onClick={() => setActiveFilter('shoutout')}
        >
          Shoutouts
        </FilterButton>
        <FilterButton
          active={activeFilter === 'custom-episode'}
          onClick={() => setActiveFilter('custom-episode')}
        >
          Custom Episodes
        </FilterButton>
        <FilterButton
          active={activeFilter === 'exclusive-content'}
          onClick={() => setActiveFilter('exclusive-content')}
        >
          Exclusive Content
        </FilterButton>
      </FilterSection>

      <CreatorGrid>
        {filteredCreators.map(creator => (
          <CreatorCard key={creator._id}>
            <CreatorImage src={creator.profileImage} alt={creator.name} />
            <CreatorInfo>
              <CreatorName>{creator.name}</CreatorName>
              <CreatorBio>{creator.bio}</CreatorBio>
              
              <PricingSection>
                <h4>Available Options</h4>
                {creator.pricingOptions.map(option => (
                  <PricingOption key={option._id}>
                    <div>
                      <strong>{option.title}</strong>
                      <p>{option.description}</p>
                    </div>
                    <div>
                      <strong>${option.price}</strong>
                    </div>
                  </PricingOption>
                ))}
                
                <RequestButton
                  onClick={() => handleRequest(creator._id, creator.pricingOptions[0]._id)}
                >
                  Request Content
                </RequestButton>
              </PricingSection>
            </CreatorInfo>
          </CreatorCard>
        ))}
      </CreatorGrid>
    </Container>
  );
};

export default PodcastCreatorBrowse; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PricingCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  background: #FF4D4D;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: #FF3333;
  }
`;

const PricingManager = () => {
  const [pricingOptions, setPricingOptions] = useState([]);
  const [newOption, setNewOption] = useState({
    title: '',
    price: '',
    type: 'personal',
    description: '',
    deliveryTime: '',
    category: 'shoutout',
    maxDuration: '',
    features: [''],
    customizationOptions: [{ name: '', description: '', price: '' }]
  });

  useEffect(() => {
    fetchPricingOptions();
  }, []);

  const fetchPricingOptions = async () => {
    try {
      const response = await axios.get('/api/pricing-options');
      setPricingOptions(response.data);
    } catch (error) {
      console.error('Error fetching pricing options:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOption(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...newOption.features];
    newFeatures[index] = value;
    setNewOption(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setNewOption(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleCustomizationChange = (index, field, value) => {
    const newCustomizations = [...newOption.customizationOptions];
    newCustomizations[index] = {
      ...newCustomizations[index],
      [field]: value
    };
    setNewOption(prev => ({
      ...prev,
      customizationOptions: newCustomizations
    }));
  };

  const addCustomization = () => {
    setNewOption(prev => ({
      ...prev,
      customizationOptions: [...prev.customizationOptions, { name: '', description: '', price: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/pricing-options', newOption);
      fetchPricingOptions();
      setNewOption({
        title: '',
        price: '',
        type: 'personal',
        description: '',
        deliveryTime: '',
        category: 'shoutout',
        maxDuration: '',
        features: [''],
        customizationOptions: [{ name: '', description: '', price: '' }]
      });
    } catch (error) {
      console.error('Error creating pricing option:', error);
    }
  };

  return (
    <Container>
      <h2>Manage Your Pricing Options</h2>
      
      <Form onSubmit={handleSubmit}>
        <h3>Add New Pricing Option</h3>
        
        <Input
          type="text"
          name="title"
          placeholder="Title"
          value={newOption.title}
          onChange={handleInputChange}
        />
        
        <Input
          type="number"
          name="price"
          placeholder="Price"
          value={newOption.price}
          onChange={handleInputChange}
        />
        
        <Select
          name="type"
          value={newOption.type}
          onChange={handleInputChange}
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </Select>
        
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={newOption.description}
          onChange={handleInputChange}
        />
        
        <Input
          type="number"
          name="deliveryTime"
          placeholder="Delivery Time (days)"
          value={newOption.deliveryTime}
          onChange={handleInputChange}
        />
        
        <Select
          name="category"
          value={newOption.category}
          onChange={handleInputChange}
        >
          <option value="shoutout">Shoutout</option>
          <option value="custom-episode">Custom Episode</option>
          <option value="exclusive-content">Exclusive Content</option>
          <option value="personal-message">Personal Message</option>
        </Select>

        {newOption.category === 'custom-episode' && (
          <Input
            type="number"
            name="maxDuration"
            placeholder="Maximum Duration (minutes)"
            value={newOption.maxDuration}
            onChange={handleInputChange}
          />
        )}

        <h4>Features</h4>
        {newOption.features.map((feature, index) => (
          <Input
            key={index}
            type="text"
            placeholder={`Feature ${index + 1}`}
            value={feature}
            onChange={(e) => handleFeatureChange(index, e.target.value)}
          />
        ))}
        <Button type="button" onClick={addFeature}>Add Feature</Button>

        <h4>Customization Options</h4>
        {newOption.customizationOptions.map((option, index) => (
          <div key={index}>
            <Input
              type="text"
              placeholder="Option Name"
              value={option.name}
              onChange={(e) => handleCustomizationChange(index, 'name', e.target.value)}
            />
            <Input
              type="text"
              placeholder="Description"
              value={option.description}
              onChange={(e) => handleCustomizationChange(index, 'description', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Additional Price"
              value={option.price}
              onChange={(e) => handleCustomizationChange(index, 'price', e.target.value)}
            />
          </div>
        ))}
        <Button type="button" onClick={addCustomization}>Add Customization</Button>

        <Button type="submit">Create Pricing Option</Button>
      </Form>

      <h3>Your Current Pricing Options</h3>
      <PricingGrid>
        {pricingOptions.map(option => (
          <PricingCard key={option._id}>
            <h4>{option.title}</h4>
            <p>${option.price}</p>
            <p>{option.description}</p>
            <p>Delivery Time: {option.deliveryTime} days</p>
            <p>Category: {option.category}</p>
            <h5>Features:</h5>
            <ul>
              {option.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {option.customizationOptions.length > 0 && (
              <>
                <h5>Customization Options:</h5>
                <ul>
                  {option.customizationOptions.map((custom, index) => (
                    <li key={index}>
                      {custom.name} - ${custom.price}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </PricingCard>
        ))}
      </PricingGrid>
    </Container>
  );
};

export default PricingManager; 
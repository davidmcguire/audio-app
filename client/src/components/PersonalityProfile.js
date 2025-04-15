import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  Avatar,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Share,
  Favorite,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const PersonalityProfile = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    message: '',
  });

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setPersonality(response.data);
      } catch (error) {
        console.error('Error fetching personality:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonality();
  }, [id]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/shoutouts/request', {
        personalityId: id,
        shoutoutOptionId: selectedOption._id,
        ...formData,
      });
      // Handle successful submission (e.g., redirect to payment)
      console.log('Shoutout request submitted:', response.data);
    } catch (error) {
      console.error('Error submitting shoutout request:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!personality) {
    return (
      <Container>
        <Typography variant="h5" align="center">
          Personality not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Header Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={personality.profileImage}
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  border: `4px solid ${theme.palette.primary.main}`,
                }}
              />
              <Typography variant="h4" gutterBottom>
                {personality.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {personality.bio}
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={personality.rating} readOnly />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  ({personality.totalReviews} reviews)
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton color="primary">
                  <Share />
                </IconButton>
                <IconButton color="primary">
                  <Favorite />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              About {personality.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {personality.shoutoutInfo?.description}
            </Typography>

            {/* Media Links */}
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Connect with {personality.name}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {personality.mediaLinks?.map((link) => (
                  <Chip
                    key={link._id}
                    icon={<LinkIcon />}
                    label={link.title}
                    component="a"
                    href={link.url}
                    target="_blank"
                    clickable
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Shoutout Options */}
        <Typography variant="h5" gutterBottom>
          Available Shoutouts
        </Typography>
        <Grid container spacing={3}>
          {personality.shoutoutOptions?.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
                onClick={() => handleOptionSelect(option)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {option.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      ${option.price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.duration}s
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Request Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Request a Shoutout from {personality.name}
          </DialogTitle>
          <DialogContent>
            <Box py={2}>
              <TextField
                fullWidth
                label="Recipient's Name"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                margin="normal"
                multiline
                rows={4}
                helperText="What would you like the personality to say?"
              />
              <Box mt={2}>
                <Typography variant="subtitle1">
                  Selected Option: {selectedOption?.title}
                </Typography>
                <Typography variant="h6" color="primary">
                  Price: ${selectedOption?.price}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!formData.recipientName || !formData.message}
            >
              Proceed to Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PersonalityProfile; 
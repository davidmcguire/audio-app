import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Edit,
  Delete,
  Add,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

const PersonalityDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    type: 'standard',
    isActive: true,
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/shoutouts/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setFormData({
      title: option.title,
      description: option.description,
      price: option.price,
      duration: option.duration,
      type: option.type,
      isActive: option.isActive,
    });
    setOpenDialog(true);
  };

  const handleAddOption = () => {
    setEditingOption(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      duration: '',
      type: 'standard',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingOption) {
        await axios.put(`/api/shoutouts/options/${editingOption._id}`, formData);
      } else {
        await axios.post('/api/shoutouts/options', formData);
      }
      setOpenDialog(false);
      // Refresh options list
    } catch (error) {
      console.error('Error saving shoutout option:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await axios.put(`/api/shoutouts/requests/${requestId}/status`, { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          My Dashboard
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label="Shoutout Requests" />
          <Tab label="Shoutout Options" />
          <Tab label="Settings" />
        </Tabs>

        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request._id}</TableCell>
                    <TableCell>{request.recipientName}</TableCell>
                    <TableCell>{request.message}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleStatusChange(request._id, 'processing')}
                          >
                            <PlayArrow />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleStatusChange(request._id, 'cancelled')}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      {request.status === 'processing' && (
                        <IconButton
                          color="success"
                          onClick={() => handleStatusChange(request._id, 'completed')}
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddOption}
              >
                Add Shoutout Option
              </Button>
            </Box>
            <Grid container spacing={3}>
              {requests.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{option.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {option.description}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="h6" color="primary">
                          ${option.price}
                        </Typography>
                        <Typography variant="body2">
                          Duration: {option.duration}s
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => handleEditOption(option)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error">
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Settings
                  </Typography>
                  <TextField
                    fullWidth
                    label="Display Name"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Bio"
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Accept Shoutout Requests"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Settings
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Preferred Currency</InputLabel>
                    <Select defaultValue="USD">
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable PayPal Payments"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable Stripe Payments"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Shoutout Option Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingOption ? 'Edit Shoutout Option' : 'Add Shoutout Option'}
          </DialogTitle>
          <DialogContent>
            <Box py={2}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Duration (seconds)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editingOption ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PersonalityDashboard; 
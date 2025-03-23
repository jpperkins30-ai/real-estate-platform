import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { propertyService, Property, CreatePropertyDto, UpdatePropertyDto } from '../services';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<CreatePropertyDto>({
    title: '',
    description: '',
    price: 0,
    location: '',
    type: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    images: [],
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getProperties({ search: searchQuery });
      setProperties(response.properties);
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchQuery]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        type: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        images: property.images,
      });
    } else {
      setSelectedProperty(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        location: '',
        type: '',
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        images: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProperty(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedProperty) {
        await propertyService.updateProperty(selectedProperty.id, formData);
      } else {
        await propertyService.createProperty(formData);
      }
      handleCloseDialog();
      fetchProperties();
    } catch (err) {
      setError('Failed to save property');
      console.error('Error saving property:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(id);
        fetchProperties();
      } catch (err) {
        setError('Failed to delete property');
        console.error('Error deleting property:', err);
      }
    }
  };

  const handleChange = (field: keyof CreatePropertyDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Properties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.title}</TableCell>
                <TableCell>${property.price.toLocaleString()}</TableCell>
                <TableCell>{property.status}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(property)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(property.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange('price')}
              fullWidth
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={handleChange('location')}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => handleChange('type')(e as any)}
              >
                <MenuItem value="house">House</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
                <MenuItem value="condo">Condo</MenuItem>
                <MenuItem value="land">Land</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange('bedrooms')}
              fullWidth
            />
            <TextField
              label="Bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange('bathrooms')}
              fullWidth
            />
            <TextField
              label="Area (sq ft)"
              type="number"
              value={formData.area}
              onChange={handleChange('area')}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProperty ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties; 
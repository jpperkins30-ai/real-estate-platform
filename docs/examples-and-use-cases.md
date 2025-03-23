# Examples and Use Cases

## Common Scenarios

### 1. User Registration and Authentication Flow

#### New User Registration
```javascript
// Client-side example using fetch
async function registerUser(email, password) {
  try {
    const response = await fetch('http://your-api/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    // Store token securely
    localStorage.setItem('token', data.token);
    return data.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

#### Login and Token Management
```javascript
// React hook example
function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await fetch('http://your-api/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { token, user, login, logout };
}
```

### 2. Property Management Workflows

#### Creating a New Property Listing
```javascript
// TypeScript example with validation
interface PropertyInput {
  address: string;
  city: string;
  state: string;
  price: number;
  // ... other fields
}

async function createProperty(property: PropertyInput) {
  // Client-side validation
  if (!property.address || property.address.length < 5) {
    throw new Error('Invalid address');
  }
  if (!property.price || property.price <= 0) {
    throw new Error('Invalid price');
  }

  const response = await fetch('http://your-api/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(property)
  });

  return response.json();
}
```

#### Bulk Property Upload
```javascript
// Node.js script for bulk upload
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');

async function bulkUpload(csvFile, token) {
  const properties = [];
  
  // Read CSV file
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (row) => {
      properties.push({
        address: row.address,
        city: row.city,
        state: row.state,
        price: parseFloat(row.price),
        // ... map other fields
      });
    })
    .on('end', async () => {
      // Upload in batches
      const batchSize = 50;
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        await Promise.all(batch.map(prop => 
          axios.post('http://your-api/api/properties', prop, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      }
    });
}
```

### 3. Advanced Search Implementations

#### Property Search with Multiple Filters
```javascript
// React component example
function PropertySearch() {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    features: []
  });

  const searchProperties = async () => {
    // Build query string
    const params = new URLSearchParams();
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.bedrooms) params.append('minBedrooms', filters.bedrooms);
    filters.features.forEach(f => params.append('features[]', f));

    const response = await fetch(`http://your-api/api/properties/search?${params}`);
    return response.json();
  };

  return (
    <form onSubmit={handleSearch}>
      {/* Form implementation */}
    </form>
  );
}
```

#### Geolocation-based Search
```javascript
// Using browser geolocation
function getNearbyProperties() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const radius = 10; // kilometers
    
    const response = await fetch(
      `http://your-api/api/properties/search?` +
      `lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    
    const properties = await response.json();
    // Handle results
  });
}
```

### 4. Real-time Updates

#### WebSocket Integration
```javascript
// Using Socket.IO for real-time updates
const socket = io('http://your-api');

// Listen for property updates
socket.on('property.updated', (data) => {
  console.log('Property updated:', data);
  // Update UI accordingly
});

// Listen for new properties
socket.on('property.created', (data) => {
  console.log('New property listed:', data);
  // Add to current list
});
```

#### Server-Sent Events
```javascript
// Server-side implementation
app.get('/api/properties/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send updates
  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for property changes
  Property.watch().on('change', sendUpdate);
});

// Client-side implementation
const eventSource = new EventSource('/api/properties/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle update
};
```

### 5. Data Export and Reporting

#### Generate Property Report
```javascript
// Node.js report generation
async function generateReport(filters) {
  const properties = await Property.find(filters);
  
  const report = {
    totalProperties: properties.length,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
    byType: properties.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {}),
    averagePrice: properties.reduce((sum, p) => sum + p.price, 0) / properties.length
  };

  return report;
}
```

#### CSV Export
```javascript
// Express route for CSV export
router.get('/export', async (req, res) => {
  const properties = await Property.find(req.query);
  
  const csv = properties.map(p => ({
    Address: p.address,
    City: p.city,
    State: p.state,
    Price: p.price,
    'Property Type': p.propertyType,
    Status: p.status
  }));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=properties.csv');
  
  fastcsv
    .write(csv, { headers: true })
    .pipe(res);
});
```

## Integration Examples

### 1. Payment Processing
```javascript
// Stripe integration example
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function processPayment(propertyId, userId, amount) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { propertyId, userId }
    });

    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

### 2. Email Notifications
```javascript
// Email service integration
const sendPropertyAlert = async (user, property) => {
  const msg = {
    to: user.email,
    subject: 'New Property Match!',
    template: 'property-alert',
    data: {
      propertyAddress: property.address,
      propertyPrice: property.price,
      propertyLink: `http://your-site/properties/${property._id}`
    }
  };

  await emailService.send(msg);
};
```

### 3. Document Generation
```javascript
// PDF generation for property details
const PDFDocument = require('pdfkit');

function generatePropertyPDF(property) {
  const doc = new PDFDocument();
  
  doc.fontSize(25).text('Property Details', 100, 100);
  doc.fontSize(14).text(`Address: ${property.address}`, 100, 150);
  doc.text(`Price: $${property.price.toLocaleString()}`, 100, 170);
  // Add more details...

  return doc;
}
```

## Error Handling Examples

### 1. API Error Handling
```javascript
// Error handling middleware
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Log unexpected errors
  console.error(err);
  res.status(500).json({
    error: 'Internal server error'
  });
};
```

### 2. Client-side Error Handling
```javascript
// React error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Testing Examples

### 1. Unit Testing
```javascript
// Jest test example
describe('Property Model', () => {
  beforeEach(async () => {
    await Property.deleteMany({});
  });

  test('should validate required fields', async () => {
    const property = new Property({
      // Missing required fields
    });

    await expect(property.save()).rejects.toThrow();
  });

  test('should calculate price per square foot', () => {
    const property = new Property({
      price: 500000,
      lotSize: 2000
    });

    expect(property.getPricePerSqFt()).toBe(250);
  });
});
```

### 2. Integration Testing
```javascript
// Supertest example
describe('Property API', () => {
  let token;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = response.body.token;
  });

  test('should create new property', async () => {
    const response = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        price: 500000
      });

    expect(response.status).toBe(201);
    expect(response.body.property).toHaveProperty('_id');
  });
}); 
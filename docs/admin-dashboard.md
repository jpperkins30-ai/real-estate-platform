# Admin Dashboard Guide

## Overview

The admin dashboard provides a comprehensive interface for managing the Real Estate Platform. It's built using React with TypeScript and follows a modern, responsive design pattern using Material-UI components.

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/real-estate-platform.git

# Install dependencies
cd real-estate-platform
npm install

# Start the development server
npm run dev:admin
```

### Basic Usage
1. Log in to the admin dashboard using your credentials
2. Navigate through the sidebar menu to access different sections
3. Use the search bar to quickly find properties, users, or settings
4. Access your profile and notifications through the top-right menu

## Features

### 1. Dashboard Overview
The dashboard provides a quick overview of key metrics and system status:

```typescript
// src/pages/Dashboard.tsx
interface DashboardStats {
  totalProperties: number;
  activeUsers: number;
  monthlyRevenue: number;
  growthRate: number;
  recentListings: Property[];
  systemHealth: {
    api: 'healthy' | 'warning' | 'error';
    database: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
}
```

#### Usage Examples
```typescript
// Fetching dashboard stats
const fetchDashboardStats = async () => {
  try {
    const stats = await analyticsService.getDashboardStats();
    setStats(stats);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
};

// Displaying system health
const SystemHealthIndicator: React.FC<{ status: SystemHealth }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {Object.entries(status).map(([key, value]) => (
        <Chip
          key={key}
          label={`${key}: ${value}`}
          color={getStatusColor(value)}
          size="small"
        />
      ))}
    </Box>
  );
};
```

### 2. Property Management
The property management interface allows administrators to:
- View and search properties
- Add, edit, and delete properties
- Manage property status and details
- Upload and manage property images
- Filter properties by various criteria

#### Usage Examples
```typescript
// Adding a new property
const handleAddProperty = async (propertyData: CreatePropertyDto) => {
  try {
    const newProperty = await propertyService.createProperty(propertyData);
    setProperties([...properties, newProperty]);
    showSuccessMessage('Property added successfully');
  } catch (error) {
    showErrorMessage('Failed to add property');
  }
};

// Uploading property images
const handleImageUpload = async (files: File[]) => {
  try {
    const uploadPromises = files.map(file => 
      propertyService.uploadImage(file)
    );
    const imageUrls = await Promise.all(uploadPromises);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  } catch (error) {
    showErrorMessage('Failed to upload images');
  }
};
```

#### Common Tasks
1. **Adding a New Property**
   - Click the "Add Property" button
   - Fill in the property details
   - Upload property images
   - Set the property status
   - Click "Save"

2. **Managing Property Status**
   - Find the property in the list
   - Click the status dropdown
   - Select the new status
   - Confirm the change

3. **Bulk Actions**
   - Select multiple properties using checkboxes
   - Choose an action from the bulk actions menu
   - Confirm the action

### 3. User Management
The user management system provides:
- User listing with search functionality
- Role management (admin, agent, user)
- Status management (active, suspended)
- User details and activity tracking
- Bulk actions for user management

#### Usage Examples
```typescript
// Updating user role
const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
  try {
    await userService.updateUserRole(userId, newRole);
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    showSuccessMessage('User role updated successfully');
  } catch (error) {
    showErrorMessage('Failed to update user role');
  }
};

// Searching users
const handleUserSearch = async (query: string) => {
  try {
    const results = await userService.searchUsers(query);
    setUsers(results);
  } catch (error) {
    showErrorMessage('Failed to search users');
  }
};
```

#### Common Tasks
1. **Managing User Roles**
   - Find the user in the list
   - Click the role dropdown
   - Select the new role
   - Confirm the change

2. **Suspending a User**
   - Find the user in the list
   - Click the status dropdown
   - Select "Suspended"
   - Provide a reason for suspension
   - Confirm the action

### 4. Analytics Dashboard
The analytics dashboard provides comprehensive insights with:
- Interactive charts using Recharts
- Multiple visualization types (line, bar, area)
- Real-time data updates
- Data filtering and export capabilities
- Key metrics tracking

#### Usage Examples
```typescript
// Setting up real-time updates
const setupRealTimeUpdates = () => {
  const ws = new WebSocket(process.env.REACT_APP_ANALYTICS_WS_URL);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateAnalyticsData(data);
  };

  return () => ws.close();
};

// Exporting analytics data
const handleExportData = async () => {
  try {
    const data = await analyticsService.getAnalytics(timeRange);
    const csv = convertToCSV(data);
    downloadFile(csv, `analytics-${timeRange}.csv`);
  } catch (error) {
    showErrorMessage('Failed to export data');
  }
};
```

#### Chart Types and Usage
1. **Revenue Chart**
   - Toggle between line, bar, and area views
   - Use the time range selector
   - Hover over data points for details
   - Click to zoom into specific periods

2. **Property Distribution Chart**
   - Use the legend to toggle categories
   - Click segments to filter data
   - Export specific segments

3. **User Activity Chart**
   - Compare different metrics
   - Use the brush component to zoom
   - Add reference lines for comparison

### 5. Settings Management
The settings interface allows configuration of:
- Platform settings
- Email notifications
- User registration
- System preferences
- API configurations

#### Usage Examples
```typescript
// Updating platform settings
const handleSettingsUpdate = async (settings: Partial<PlatformSettings>) => {
  try {
    const updatedSettings = await settingsService.updateSettings(settings);
    setSettings(updatedSettings);
    showSuccessMessage('Settings updated successfully');
  } catch (error) {
    showErrorMessage('Failed to update settings');
  }
};

// Testing email settings
const handleEmailTest = async () => {
  try {
    await settingsService.testEmailSettings();
    showSuccessMessage('Test email sent successfully');
  } catch (error) {
    showErrorMessage('Failed to send test email');
  }
};
```

#### Common Settings
1. **Platform Settings**
   - Enable/disable user registration
   - Set default user role
   - Configure currency and timezone
   - Set maintenance mode

2. **Email Settings**
   - Configure SMTP server
   - Set up email templates
   - Test email delivery
   - Manage notification preferences

## Troubleshooting Guide

### Common Issues

1. **Dashboard Not Loading**
   - Check your internet connection
   - Clear browser cache
   - Verify API endpoint configuration
   - Check browser console for errors

2. **Property Upload Issues**
   - Verify file size limits
   - Check file format compatibility
   - Ensure storage permissions
   - Monitor upload progress

3. **User Management Problems**
   - Verify user permissions
   - Check role assignment rules
   - Monitor user activity logs
   - Review suspension reasons

4. **Analytics Data Issues**
   - Check data collection status
   - Verify time range selection
   - Monitor API rate limits
   - Review data processing logs

5. **Settings Not Saving**
   - Verify admin permissions
   - Check API connectivity
   - Review validation rules
   - Monitor error logs

### Detailed Troubleshooting Scenarios

1. **Authentication Issues**
   ```typescript
   // Common authentication errors and solutions
   interface AuthError {
     code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED';
     message: string;
     solution: string;
   }

   const authErrorSolutions: Record<string, AuthError> = {
     INVALID_TOKEN: {
       code: 'INVALID_TOKEN',
       message: 'Invalid authentication token',
       solution: 'Clear browser cache and re-login'
     },
     EXPIRED_TOKEN: {
       code: 'EXPIRED_TOKEN',
       message: 'Authentication token has expired',
       solution: 'Refresh the page or re-login'
     },
     // ... more error scenarios
   };
   ```

2. **Data Synchronization Problems**
   ```typescript
   // Handling data sync issues
   const handleDataSync = async () => {
     try {
       // Check last sync timestamp
       const lastSync = await getLastSyncTimestamp();
       const timeSinceLastSync = Date.now() - lastSync;

       if (timeSinceLastSync > 5 * 60 * 1000) { // 5 minutes
         // Force refresh data
         await refreshAllData();
       }
     } catch (error) {
       logSyncError(error);
       showSyncWarning();
     }
   };
   ```

3. **Real-time Updates Not Working**
   ```typescript
   // WebSocket connection troubleshooting
   const setupWebSocket = () => {
     const ws = new WebSocket(WS_URL);
     
     ws.onopen = () => {
       console.log('WebSocket connected');
       startHeartbeat();
     };

     ws.onerror = (error) => {
       console.error('WebSocket error:', error);
       attemptReconnect();
     };

     ws.onclose = () => {
       console.log('WebSocket disconnected');
       cleanup();
     };
   };
   ```

### Performance Optimization Scenarios

1. **Large Dataset Handling**
   ```typescript
   // Optimizing large data tables
   const OptimizedDataTable: React.FC<{ data: any[] }> = ({ data }) => {
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(10);

     const paginatedData = useMemo(() => {
       const start = page * rowsPerPage;
       return data.slice(start, start + rowsPerPage);
     }, [data, page, rowsPerPage]);

     return (
       <TableContainer>
         <Table>
           <TableHead>
             {/* Column headers */}
           </TableHead>
           <TableBody>
             {paginatedData.map(row => (
               <TableRow key={row.id}>
                 {/* Row content */}
               </TableRow>
             ))}
           </TableBody>
         </Table>
         <TablePagination
           component="div"
           count={data.length}
           page={page}
           onPageChange={(e, newPage) => setPage(newPage)}
           rowsPerPage={rowsPerPage}
           onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
         />
       </TableContainer>
     );
   };
   ```

2. **Chart Performance Optimization**
   ```typescript
   // Optimizing chart rendering
   const OptimizedChart: React.FC<{ data: any[] }> = ({ data }) => {
     const [timeRange, setTimeRange] = useState('day');
     
     const processedData = useMemo(() => {
       return aggregateData(data, timeRange);
     }, [data, timeRange]);

     return (
       <ResponsiveContainer width="100%" height={400}>
         <LineChart data={processedData}>
           {/* Chart components */}
         </LineChart>
       </ResponsiveContainer>
     );
   };
   ```

## Business Metrics Monitoring

### Revenue Tracking
```typescript
// src/monitoring/business-metrics.ts
export const businessMetrics = {
  metrics: {
    revenue: new Counter({
      name: 'revenue_total',
      help: 'Total revenue in USD',
      labelNames: ['source', 'type']
    }),
    
    propertySales: new Counter({
      name: 'property_sales_total',
      help: 'Total number of property sales',
      labelNames: ['propertyType', 'status']
    }),
    
    commissionEarnings: new Counter({
      name: 'commission_earnings_total',
      help: 'Total commission earnings',
      labelNames: ['agentId', 'propertyType']
    })
  },

  async trackRevenue(amount: number, source: string, type: string) {
    this.metrics.revenue.inc({ source, type }, amount);
  },

  async trackPropertySale(propertyType: string, status: string) {
    this.metrics.propertySales.inc({ propertyType, status });
  }
};
```

### Market Analysis
```typescript
// src/monitoring/market-analysis.ts
export const marketAnalysis = {
  metrics: {
    marketTrends: new Gauge({
      name: 'market_trends',
      help: 'Current market trends',
      labelNames: ['region', 'propertyType', 'metric']
    }),
    
    priceChanges: new Histogram({
      name: 'price_changes_percentage',
      help: 'Percentage changes in property prices',
      buckets: [-20, -10, -5, 0, 5, 10, 20]
    }),
    
    inventoryLevels: new Gauge({
      name: 'inventory_levels',
      help: 'Current inventory levels',
      labelNames: ['region', 'propertyType']
    })
  },

  async updateMarketTrends(region: string, propertyType: string, metrics: any) {
    Object.entries(metrics).forEach(([metric, value]) => {
      this.metrics.marketTrends.set({ region, propertyType, metric }, value);
    });
  }
};
```

### Customer Analytics
```typescript
// src/monitoring/customer-analytics.ts
export const customerAnalytics = {
  metrics: {
    customerSatisfaction: new Gauge({
      name: 'customer_satisfaction_score',
      help: 'Customer satisfaction score',
      labelNames: ['service']
    }),
    
    customerRetention: new Counter({
      name: 'customer_retention_total',
      help: 'Number of retained customers',
      labelNames: ['segment']
    }),
    
    customerAcquisition: new Counter({
      name: 'customer_acquisition_total',
      help: 'Number of new customers',
      labelNames: ['source']
    })
  },

  async trackCustomerSatisfaction(service: string, score: number) {
    this.metrics.customerSatisfaction.set({ service }, score);
  }
};
```

## Performance Benchmarking

### Load Testing
```typescript
// src/benchmarking/load-testing.ts
export const loadTesting = {
  async runLoadTest(config: LoadTestConfig) {
    const results = {
      startTime: Date.now(),
      requests: [],
      errors: [],
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      }
    };

    // Run concurrent requests
    const requests = Array(config.concurrentUsers).fill(null).map(() => 
      this.makeRequest(config.endpoint, config.method)
    );

    await Promise.all(requests);
    return this.calculateMetrics(results);
  },

  async makeRequest(endpoint: string, method: string) {
    const startTime = Date.now();
    try {
      const response = await fetch(endpoint, { method });
      const duration = Date.now() - startTime;
      return { success: true, duration };
    } catch (error) {
      return { success: false, error };
    }
  }
};
```

### Performance Profiling
```typescript
// src/benchmarking/performance-profiling.ts
export const performanceProfiling = {
  async profileComponent(componentName: string) {
    const profile = {
      renderTime: 0,
      memoryUsage: 0,
      reRenders: 0,
      effects: []
    };

    // Start profiling
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Render component
    await this.renderComponent(componentName);

    // End profiling
    profile.renderTime = performance.now() - startTime;
    profile.memoryUsage = process.memoryUsage().heapUsed - startMemory;

    return profile;
  },

  async analyzePerformance(profile: PerformanceProfile) {
    const recommendations = [];

    if (profile.renderTime > 100) {
      recommendations.push('Consider implementing React.memo or useMemo');
    }

    if (profile.memoryUsage > 1000000) {
      recommendations.push('Check for memory leaks in component lifecycle');
    }

    return recommendations;
  }
};
```

### Resource Monitoring
```typescript
// src/benchmarking/resource-monitoring.ts
export const resourceMonitoring = {
  metrics: {
    cpuUsage: new Gauge({
      name: 'cpu_usage_percentage',
      help: 'CPU usage percentage',
      labelNames: ['process']
    }),
    
    memoryUsage: new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['process']
    }),
    
    diskIO: new Counter({
      name: 'disk_io_bytes_total',
      help: 'Total disk I/O in bytes',
      labelNames: ['operation']
    })
  },

  async monitorResources() {
    setInterval(() => {
      const usage = process.cpuUsage();
      const memory = process.memoryUsage();
      
      this.metrics.cpuUsage.set({ process: 'admin-dashboard' }, 
        (usage.user + usage.system) / 1000000);
      
      this.metrics.memoryUsage.set({ process: 'admin-dashboard' }, 
        memory.heapUsed);
    }, 1000);
  }
};
```

## Security Monitoring and Incident Response

### Security Monitoring
```typescript
// src/security/monitoring.ts
export const securityMonitoring = {
  metrics: {
    failedLogins: new Counter({
      name: 'failed_login_attempts_total',
      help: 'Total number of failed login attempts',
      labelNames: ['ip', 'username']
    }),
    
    suspiciousActivities: new Counter({
      name: 'suspicious_activities_total',
      help: 'Total number of suspicious activities',
      labelNames: ['type', 'severity']
    }),
    
    securityIncidents: new Counter({
      name: 'security_incidents_total',
      help: 'Total number of security incidents',
      labelNames: ['type', 'status']
    })
  },

  async trackFailedLogin(ip: string, username: string) {
    this.metrics.failedLogins.inc({ ip, username });
    
    // Check for potential brute force attacks
    const recentAttempts = await this.getRecentLoginAttempts(ip);
    if (recentAttempts > 5) {
      await this.handlePotentialBruteForce(ip);
    }
  }
};
```

### Incident Response
```typescript
// src/security/incident-response.ts
export const incidentResponse = {
  async handleSecurityIncident(incident: SecurityIncident) {
    // Log incident
    await this.logIncident(incident);
    
    // Assess severity
    const severity = this.assessSeverity(incident);
    
    // Notify relevant parties
    await this.notifyStakeholders(incident, severity);
    
    // Execute response plan
    switch (severity) {
      case 'critical':
        await this.handleCriticalIncident(incident);
        break;
      case 'high':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'medium':
        await this.handleMediumSeverityIncident(incident);
        break;
      case 'low':
        await this.handleLowSeverityIncident(incident);
        break;
    }
    
    // Document resolution
    await this.documentResolution(incident);
  },

  async handleCriticalIncident(incident: SecurityIncident) {
    // Immediate actions
    await this.isolateAffectedSystems(incident);
    await this.blockMaliciousIPs(incident);
    
    // Investigation
    const findings = await this.investigateIncident(incident);
    
    // Remediation
    await this.applySecurityPatches(findings);
    await this.updateSecurityControls(findings);
    
    // Recovery
    await this.restoreAffectedSystems(incident);
    await this.verifySystemIntegrity();
  }
};
```

### Security Auditing
```typescript
// src/security/auditing.ts
export const securityAuditing = {
  async performSecurityAudit() {
    const auditResults = {
      timestamp: new Date(),
      findings: [],
      recommendations: [],
      riskScore: 0
    };

    // Check system security
    const systemChecks = await this.checkSystemSecurity();
    auditResults.findings.push(...systemChecks);

    // Check access controls
    const accessChecks = await this.checkAccessControls();
    auditResults.findings.push(...accessChecks);

    // Check data security
    const dataChecks = await this.checkDataSecurity();
    auditResults.findings.push(...dataChecks);

    // Generate recommendations
    auditResults.recommendations = this.generateRecommendations(auditResults.findings);

    // Calculate risk score
    auditResults.riskScore = this.calculateRiskScore(auditResults.findings);

    return auditResults;
  },

  async checkSystemSecurity() {
    return [
      await this.checkFirewallRules(),
      await this.checkSSLConfiguration(),
      await this.checkSystemUpdates(),
      await this.checkSecurityPatches()
    ];
  }
};
```

## Configuration Guide

### Environment Variables
```typescript
// .env.example
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_MAX_UPLOAD_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png
REACT_APP_CACHE_DURATION=3600
REACT_APP_REFRESH_INTERVAL=300
```

### Feature Flags
```typescript
// src/config/features.ts
export const featureFlags = {
  analytics: {
    enabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
    realTimeUpdates: process.env.REACT_APP_REAL_TIME_UPDATES === 'true',
    exportEnabled: process.env.REACT_APP_EXPORT_ENABLED === 'true'
  },
  properties: {
    bulkActions: process.env.REACT_APP_BULK_ACTIONS === 'true',
    imageUpload: process.env.REACT_APP_IMAGE_UPLOAD === 'true',
    advancedFilters: process.env.REACT_APP_ADVANCED_FILTERS === 'true'
  },
  users: {
    roleManagement: process.env.REACT_APP_ROLE_MANAGEMENT === 'true',
    activityTracking: process.env.REACT_APP_ACTIVITY_TRACKING === 'true'
  }
};
```

### API Configuration
```typescript
// src/config/api.config.ts
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json'
  },
  endpoints: {
    properties: '/api/properties',
    users: '/api/users',
    analytics: '/api/analytics',
    settings: '/api/settings'
  }
};
```

## Deployment Best Practices

### Production Deployment Checklist

1. **Pre-deployment**
   ```bash
   # Run tests
   npm run test
   
   # Build the application
   npm run build
   
   # Check for vulnerabilities
   npm audit
   
   # Optimize assets
   npm run optimize
   ```

2. **Environment Setup**
   ```bash
   # Create production environment file
   cp .env.example .env.production
   
   # Set production variables
   REACT_APP_API_URL=https://api.production.com
   REACT_APP_WS_URL=wss://ws.production.com
   NODE_ENV=production
   ```

3. **Build Optimization**
   ```typescript
   // webpack.config.js
   module.exports = {
     optimization: {
       splitChunks: {
         chunks: 'all',
         minSize: 20000,
         maxSize: 244000,
         minChunks: 1,
         maxAsyncRequests: 30,
         maxInitialRequests: 30
       },
       minimize: true
     },
     performance: {
       hints: 'warning',
       maxEntrypointSize: 512000,
       maxAssetSize: 512000
     }
   };
   ```

### Monitoring Setup

1. **Error Tracking**
   ```typescript
   // src/utils/error-tracking.ts
   export const setupErrorTracking = () => {
     if (process.env.NODE_ENV === 'production') {
       Sentry.init({
         dsn: process.env.REACT_APP_SENTRY_DSN,
         environment: process.env.NODE_ENV,
         integrations: [
           new Sentry.BrowserTracing(),
           new Sentry.Replay()
         ],
         tracesSampleRate: 1.0,
         replaysSessionSampleRate: 0.1,
         replaysOnErrorSampleRate: 1.0
       });
     }
   };
   ```

2. **Performance Monitoring**
   ```typescript
   // src/utils/performance-monitoring.ts
   export const setupPerformanceMonitoring = () => {
     if (process.env.NODE_ENV === 'production') {
       // Initialize performance monitoring
       const observer = new PerformanceObserver((list) => {
         for (const entry of list.getEntries()) {
           // Send metrics to monitoring service
           sendMetrics({
             name: entry.name,
             value: entry.duration,
             timestamp: Date.now()
           });
         }
       });

       observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
     }
   };
   ```

### Security Checklist

1. **Pre-deployment Security Checks**
   ```bash
   # Run security audit
   npm audit
   
   # Check for outdated dependencies
   npm outdated
   
   # Run OWASP dependency check
   npm run security-check
   ```

2. **Security Headers**
   ```typescript
   // server.ts
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", "wss:", "https:"]
       }
     },
     crossOriginEmbedderPolicy: false,
     crossOriginResourcePolicy: { policy: "cross-origin" }
   }));
   ```

### Backup and Recovery

1. **Database Backup**
   ```typescript
   // src/utils/backup.ts
   export const setupBackup = async () => {
     const backupConfig = {
       schedule: '0 0 * * *', // Daily at midnight
       retention: 7, // Keep 7 days of backups
       compress: true
     };

     await scheduleBackup(backupConfig);
   };
   ```

2. **Recovery Procedures**
   ```typescript
   // src/utils/recovery.ts
   export const recoveryProcedures = {
     async restoreFromBackup(backupId: string) {
       // Verify backup integrity
       await verifyBackup(backupId);
       
       // Stop services
       await stopServices();
       
       // Restore database
       await restoreDatabase(backupId);
       
       // Verify restoration
       await verifyRestoration();
       
       // Start services
       await startServices();
     }
   };
   ```

## API Integration

### Admin API Routes
```typescript
// src/routes/admin.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';

const router = Router();
const controller = new AdminController();

router.use(adminAuthMiddleware);

// Dashboard
router.get('/dashboard/stats', controller.getDashboardStats);

// Property Management
router.get('/properties', controller.getProperties);
router.post('/properties', controller.createProperty);
router.put('/properties/:id', controller.updateProperty);
router.delete('/properties/:id', controller.deleteProperty);

// User Management
router.get('/users', controller.getUsers);
router.put('/users/:id/role', controller.updateUserRole);
router.put('/users/:id/status', controller.updateUserStatus);

// Analytics
router.get('/analytics', controller.getAnalytics);
router.get('/analytics/revenue', controller.getRevenueData);
router.get('/analytics/property-types', controller.getPropertyTypes);
router.get('/analytics/user-activity', controller.getUserActivity);

// Settings
router.get('/settings', controller.getSettings);
router.put('/settings', controller.updateSettings);
router.get('/settings/email', controller.getEmailSettings);
router.put('/settings/email', controller.updateEmailSettings);

export default router;
```

## Security

### Admin Authentication
```typescript
// src/middleware/admin-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
```

## Deployment

### Environment Setup
```typescript
// src/config/admin.config.ts
export const adminConfig = {
  apiUrl: process.env.ADMIN_API_URL,
  wsUrl: process.env.ADMIN_WS_URL,
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    backup: process.env.ENABLE_BACKUP === 'true',
    monitoring: process.env.ENABLE_MONITORING === 'true'
  }
};
```

### Build Process
```bash
# Build admin dashboard
npm run build:admin

# Deploy to production
npm run deploy:admin
```

## Monitoring

### Health Checks
```typescript
// src/utils/admin-health.ts
export const checkAdminHealth = async () => {
  const checks = {
    api: await checkAPIHealth(),
    database: await checkDatabaseHealth(),
    storage: await checkStorageHealth(),
    adminUI: await checkAdminUIHealth()
  };

  return {
    status: Object.values(checks).every(check => check.status === 'healthy'),
    checks
  };
};
```

### Activity Logging
```typescript
// src/utils/admin-logger.ts
export const logAdminActivity = async (
  adminId: string,
  action: string,
  details: any
) => {
  await AdminLog.create({
    adminId,
    action,
    details,
    timestamp: new Date(),
    ip: req.ip
  });
};
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/admin-dashboard.yml
name: Admin Dashboard CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'admin-dashboard/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'admin-dashboard/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd admin-dashboard && npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd admin-dashboard && npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v2
        with:
          name: build
          path: admin-dashboard/build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v2
        with:
          name: build
      - name: Deploy to AWS S3
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync build/ s3://admin-dashboard-bucket/
```

### Docker Configuration
```dockerfile
# admin-dashboard/Dockerfile
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment
```yaml
# admin-dashboard/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: admin-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: admin-dashboard
  template:
    metadata:
      labels:
        app: admin-dashboard
    spec:
      containers:
      - name: admin-dashboard
        image: admin-dashboard:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
```

## Advanced Monitoring

### Prometheus Metrics
```typescript
// src/utils/metrics.ts
import { Registry, Counter, Histogram } from 'prom-client';

const registry = new Registry();

// API Metrics
const apiRequestDuration = new Histogram({
  name: 'admin_api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const apiRequestTotal = new Counter({
  name: 'admin_api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint']
});

// Business Metrics
const activeUsers = new Counter({
  name: 'admin_active_users',
  help: 'Number of active users in the admin dashboard'
});

const propertyOperations = new Counter({
  name: 'admin_property_operations_total',
  help: 'Total number of property operations',
  labelNames: ['operation']
});

registry.registerMetric(apiRequestDuration);
registry.registerMetric(apiRequestTotal);
registry.registerMetric(activeUsers);
registry.registerMetric(propertyOperations);
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "id": null,
    "title": "Admin Dashboard Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(admin_api_request_duration_seconds_sum[5m]) / rate(admin_api_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "admin_active_users",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

### Alert Rules
```yaml
# prometheus/rules/admin-alerts.yml
groups:
- name: admin-alerts
  rules:
  - alert: HighAPIResponseTime
    expr: rate(admin_api_request_duration_seconds_sum[5m]) / rate(admin_api_request_duration_seconds_count[5m]) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High API response time
      description: API response time is above 2 seconds

  - alert: HighErrorRate
    expr: rate(admin_api_requests_total{status=~"5.."}[5m]) / rate(admin_api_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate
      description: Error rate is above 5%
```

## Scaling and Load Balancing

### Horizontal Scaling
```typescript
// src/config/scaling.ts
export const scalingConfig = {
  autoScaling: {
    enabled: process.env.ENABLE_AUTO_SCALING === 'true',
    minReplicas: parseInt(process.env.MIN_REPLICAS || '3'),
    maxReplicas: parseInt(process.env.MAX_REPLICAS || '10'),
    targetCPUUtilization: 70,
    targetMemoryUtilization: 80,
    scaleUpCooldown: 300, // 5 minutes
    scaleDownCooldown: 600 // 10 minutes
  },
  loadBalancing: {
    algorithm: process.env.LB_ALGORITHM || 'round-robin',
    healthCheck: {
      path: '/health',
      interval: 30,
      timeout: 5,
      unhealthyThreshold: 3,
      healthyThreshold: 2
    }
  }
};
```

### Load Balancer Configuration
```typescript
// src/middleware/load-balancer.ts
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const loadBalancer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serverId = await redis.incr('request_counter');
    const server = await getServer(serverId);
    
    // Add server information to request
    req.headers['x-server-id'] = server.id;
    next();
  } catch (error) {
    next(error);
  }
};

async function getServer(serverId: number) {
  const servers = await redis.smembers('active_servers');
  const index = serverId % servers.length;
  return JSON.parse(servers[index]);
}
```

### Caching Strategy
```typescript
// src/utils/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: any, ttl: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  },

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};
```

### Database Scaling
```typescript
// src/config/database.ts
export const dbConfig = {
  readReplicas: process.env.DB_READ_REPLICAS?.split(',') || [],
  writeReplicas: process.env.DB_WRITE_REPLICAS?.split(',') || [],
  connectionPool: {
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: 30000
  },
  sharding: {
    enabled: process.env.DB_SHARDING_ENABLED === 'true',
    shardKey: 'propertyId',
    shardCount: parseInt(process.env.DB_SHARD_COUNT || '4')
  }
};
```

## Disaster Recovery

### Recovery Procedures
```typescript
// src/utils/disaster-recovery.ts
export const disasterRecovery = {
  async initiateRecovery(disasterType: 'database' | 'storage' | 'api') {
    // Log the disaster event
    await logDisasterEvent(disasterType);
    
    // Notify stakeholders
    await notifyStakeholders(disasterType);
    
    // Execute recovery plan
    switch (disasterType) {
      case 'database':
        await recoverDatabase();
        break;
      case 'storage':
        await recoverStorage();
        break;
      case 'api':
        await recoverAPI();
        break;
    }
    
    // Verify recovery
    await verifyRecovery(disasterType);
  },

  async recoverDatabase() {
    // Stop all services
    await stopServices();
    
    // Restore from latest backup
    const latestBackup = await getLatestBackup();
    await restoreDatabase(latestBackup);
    
    // Verify data integrity
    await verifyDataIntegrity();
    
    // Start services
    await startServices();
  },

  async recoverStorage() {
    // Switch to backup storage
    await switchToBackupStorage();
    
    // Sync missing files
    await syncMissingFiles();
    
    // Verify storage integrity
    await verifyStorageIntegrity();
  }
};
```

### Backup Verification
```typescript
// src/utils/backup-verification.ts
export const backupVerification = {
  async verifyBackup(backupId: string) {
    const backup = await getBackup(backupId);
    
    // Check backup integrity
    const integrityCheck = await checkBackupIntegrity(backup);
    if (!integrityCheck.isValid) {
      throw new Error('Backup integrity check failed');
    }
    
    // Verify data consistency
    const consistencyCheck = await verifyDataConsistency(backup);
    if (!consistencyCheck.isConsistent) {
      throw new Error('Data consistency check failed');
    }
    
    // Test restore
    await testRestore(backup);
    
    return {
      isValid: true,
      timestamp: backup.timestamp,
      size: backup.size
    };
  }
};
```

## Component-Specific Monitoring

### Property Management Monitoring
```typescript
// src/monitoring/property-monitoring.ts
export const propertyMonitoring = {
  metrics: {
    propertyOperations: new Counter({
      name: 'property_operations_total',
      help: 'Total number of property operations',
      labelNames: ['operation', 'status']
    }),
    
    propertyUploadDuration: new Histogram({
      name: 'property_upload_duration_seconds',
      help: 'Duration of property uploads',
      buckets: [1, 5, 10, 30, 60]
    }),
    
    propertyImageProcessing: new Histogram({
      name: 'property_image_processing_seconds',
      help: 'Duration of image processing',
      buckets: [0.1, 0.5, 1, 2, 5]
    })
  },

  async trackPropertyOperation(operation: string, status: string) {
    this.metrics.propertyOperations.inc({ operation, status });
  },

  async trackUploadDuration(duration: number) {
    this.metrics.propertyUploadDuration.observe(duration);
  }
};
```

### User Management Monitoring
```typescript
// src/monitoring/user-monitoring.ts
export const userMonitoring = {
  metrics: {
    userActions: new Counter({
      name: 'user_actions_total',
      help: 'Total number of user actions',
      labelNames: ['action', 'role']
    }),
    
    authenticationAttempts: new Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['status']
    }),
    
    sessionDuration: new Histogram({
      name: 'user_session_duration_seconds',
      help: 'Duration of user sessions',
      buckets: [300, 900, 1800, 3600, 7200]
    })
  },

  async trackUserAction(action: string, role: string) {
    this.metrics.userActions.inc({ action, role });
  },

  async trackAuthAttempt(status: string) {
    this.metrics.authenticationAttempts.inc({ status });
  }
};
```

### Analytics Monitoring
```typescript
// src/monitoring/analytics-monitoring.ts
export const analyticsMonitoring = {
  metrics: {
    dataProcessingTime: new Histogram({
      name: 'analytics_processing_time_seconds',
      help: 'Time taken to process analytics data',
      buckets: [0.1, 0.5, 1, 2, 5]
    }),
    
    chartRenderingTime: new Histogram({
      name: 'chart_rendering_time_seconds',
      help: 'Time taken to render charts',
      buckets: [0.1, 0.5, 1, 2, 5]
    }),
    
    dataExportTime: new Histogram({
      name: 'data_export_time_seconds',
      help: 'Time taken to export data',
      buckets: [1, 5, 10, 30, 60]
    })
  },

  async trackProcessingTime(duration: number) {
    this.metrics.dataProcessingTime.observe(duration);
  },

  async trackChartRendering(duration: number) {
    this.metrics.chartRenderingTime.observe(duration);
  }
};
```

## Performance Optimization Techniques

### Frontend Optimization
```typescript
// src/utils/performance.ts
export const frontendOptimization = {
  // Code splitting
  async loadComponent(componentName: string) {
    return import(`../components/${componentName}`);
  },

  // Image optimization
  async optimizeImage(file: File): Promise<Blob> {
    const image = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate optimal dimensions
    const maxWidth = 1200;
    const maxHeight = 800;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
    
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    
    ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob!), 'image/webp', 0.8);
    });
  },

  // Virtual scrolling
  const VirtualList: React.FC<{ items: any[] }> = ({ items }) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const itemHeight = 50;
    
    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    
    return (
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    );
  };
};
```

### API Optimization
```typescript
// src/utils/api-optimization.ts
export const apiOptimization = {
  // Request batching
  async batchRequests(requests: Request[]) {
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    const results = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(req => fetch(req.url, req.options))
      );
      results.push(...batchResults);
    }
    
    return results;
  },

  // Response caching
  async cacheResponse(key: string, data: any, ttl: number) {
    const cacheKey = `api:${key}`;
    await cache.set(cacheKey, data, ttl);
  },

  // Query optimization
  async optimizeQuery(query: string) {
    // Add query hints
    const optimizedQuery = query.replace(
      /SELECT/i,
      'SELECT /*+ INDEX(table_name index_name) */'
    );
    
    return optimizedQuery;
  }
};
```

### Database Optimization
```typescript
// src/utils/db-optimization.ts
export const dbOptimization = {
  // Connection pooling
  async getConnection() {
    const pool = await createPool({
      min: 5,
      max: 20,
      idleTimeoutMillis: 30000
    });
    
    return pool.getConnection();
  },

  // Query caching
  async cacheQuery(query: string, params: any[], ttl: number) {
    const cacheKey = `query:${query}:${JSON.stringify(params)}`;
    return cache.get(cacheKey) || cache.set(cacheKey, await executeQuery(query, params), ttl);
  },

  // Index optimization
  async optimizeIndexes() {
    const indexes = await getTableIndexes();
    for (const index of indexes) {
      if (index.usage < 0.1) { // Less than 10% usage
        await dropIndex(index.name);
      }
    }
  }
};
```

## Building the Admin Dashboard

### Standard Build Process

To build the admin dashboard for production:

1. Navigate to the admin dashboard directory:
   ```bash
   cd admin-dashboard
   ```

2. Install dependencies if not already installed:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

This will create a `build` directory with optimized production files that will be served by the server at `/admin`.

### Alternative Build Methods

If you encounter issues with the standard build process, you can use the provided build scripts:

1. Using the batch file (Windows):
   ```
   build-admin.bat
   ```

2. Using the shell script (Linux/macOS):
   ```
   ./build-admin.sh
   ```

### Manual Placeholder Creation

In case you need a quick placeholder for testing, you can manually create a minimal build:

1. Create the build directory:
   ```bash
   mkdir -p admin-dashboard/build
   ```

2. Create a basic index.html file in that directory with placeholder content.

### Accessing the Admin Dashboard

Once built, the admin dashboard can be accessed at:
```
http://localhost:3000/admin
```

Make sure the server environment variable `SERVE_ADMIN_DASHBOARD` is set to `true` in the `.env` file.

## Accessing Documentation

The platform includes comprehensive documentation that can be accessed in several ways:

### Using a Local Server

1. Navigate to the docs directory:
   ```bash
   cd docs
   ```

2. Start a local server:
   ```bash
   npx serve
   ```

3. Access the documentation at http://localhost:5000

### Adding Documentation to the Admin Dashboard

To make the documentation accessible from within the admin dashboard, add the following route to the server code (in `server/src/index.ts`):

```typescript
// Serve documentation
const docsPath = path.join(__dirname, '../../docs');
app.use('/docs', express.static(docsPath));
console.log('Documentation is available at /docs');
```

After adding this code and restarting the server, the documentation will be available at http://localhost:3000/docs. 
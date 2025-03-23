import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip as MuiTooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PanTool as PanToolIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Brush,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsService, AnalyticsData, TimeRange, PropertyTypeData, TopProperty, RevenueDataPoint, UserActivityData, TimeSeriesData } from '../services';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#f44336'];

interface ChartFilter {
  propertyTypes: string[];
  minPrice: number;
  maxPrice: number;
  status: string[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} color={entry.color}>
            {entry.name}: {entry.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('line');
  const [filters, setFilters] = useState<ChartFilter>({
    propertyTypes: [],
    minPrice: 0,
    maxPrice: Infinity,
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [showDataPointDialog, setShowDataPointDialog] = useState(false);
  const [revenueData, setRevenueData] = useState<TimeSeriesData[]>([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getAnalytics(timeRange);
      setData(response);
      setRevenueData(response.revenueData.map((point: RevenueDataPoint) => ({
        date: point.date,
        value: point.revenue,
      })));
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleTimeRangeChange = (event: SelectChangeEvent<'week' | 'month'>) => {
    setTimeRange(event.target.value as 'week' | 'month');
  };

  const handleChartTypeChange = (type: string) => {
    setSelectedChart(type);
  };

  const handleDataPointClick = (data: any) => {
    setSelectedDataPoint(data);
    setShowDataPointDialog(true);
  };

  const handleExportData = () => {
    if (!data) return;
    
    const csvContent = [
      // Revenue data
      ['Revenue Data'],
      ['Date', 'Revenue'],
      ...data.revenueData.map((point: RevenueDataPoint) => [point.date, point.revenue]),
      [],
      // Property types
      ['Property Types'],
      ['Type', 'Count'],
      ...data.propertyTypes.map((type: PropertyTypeData) => [type.name, type.value]),
      [],
      // User activity
      ['User Activity'],
      ['Date', 'Active Users', 'New Users', 'Property Views'],
      ...data.userActivity.map((activity: UserActivityData) => [
        activity.date,
        activity.activeUsers,
        activity.newUsers,
        activity.propertyViews,
      ]),
      [],
      // Top properties
      ['Top Properties'],
      ['Title', 'Views', 'Inquiries', 'Price'],
      ...data.topProperties.map((property: TopProperty) => [
        property.title,
        property.views,
        property.inquiries,
        property.price,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setIsPanning(false);
  };

  const togglePanning = () => {
    setIsPanning(!isPanning);
    setIsZoomed(false);
  };

  const renderRevenueChart = (): ReactElement => {
    const chartProps = {
      data: revenueData,
      onClick: handleDataPointClick,
    };

    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            {isZoomed && <Brush />}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            <Bar dataKey="value" fill="#1976d2" />
            {isZoomed && <Brush />}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              fill="#1976d2"
              fillOpacity={0.3}
            />
            {isZoomed && <Brush />}
          </AreaChart>
        );
      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        );
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: data ? `$${data.totalRevenue.toLocaleString()}` : '0',
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      change: data?.revenueGrowth || 0,
    },
    {
      title: 'Properties Listed',
      value: data?.totalProperties || 0,
      icon: <HomeIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      change: data?.propertyGrowth || 0,
    },
    {
      title: 'Active Users',
      value: data?.activeUsers || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      change: data?.userGrowth || 0,
    },
    {
      title: 'Average Price',
      value: data ? `$${data.averagePrice.toLocaleString()}` : '0',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      change: data?.priceGrowth || 0,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(true)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
          <IconButton onClick={fetchAnalytics} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                    <Typography
                      variant="body2"
                      color={stat.change >= 0 ? 'success.main' : 'error.main'}
                      sx={{ mt: 1 }}
                    >
                      {stat.change >= 0 ? '+' : ''}{stat.change}% from previous period
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Revenue Trends</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="Line"
                    onClick={() => handleChartTypeChange('line')}
                    color={selectedChart === 'line' ? 'primary' : 'default'}
                  />
                  <Chip
                    label="Bar"
                    onClick={() => handleChartTypeChange('bar')}
                    color={selectedChart === 'bar' ? 'primary' : 'default'}
                  />
                  <Chip
                    label="Area"
                    onClick={() => handleChartTypeChange('area')}
                    color={selectedChart === 'area' ? 'primary' : 'default'}
                  />
                </Stack>
                <MuiTooltip title={isZoomed ? "Disable Zoom" : "Enable Zoom"}>
                  <IconButton onClick={toggleZoom} color={isZoomed ? "primary" : "default"}>
                    <ZoomInIcon />
                  </IconButton>
                </MuiTooltip>
                <MuiTooltip title={isPanning ? "Disable Pan" : "Enable Pan"}>
                  <IconButton onClick={togglePanning} color={isPanning ? "primary" : "default"}>
                    <PanToolIcon />
                  </IconButton>
                </MuiTooltip>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                {renderRevenueChart()}
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Property Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.propertyTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data?.propertyTypes.map((entry: PropertyTypeData, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#666" />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#1976d2"
                    name="Active Users"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#2e7d32"
                    name="New Users"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="propertyViews"
                    stroke="#ed6c02"
                    name="Property Views"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Properties
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Inquiries</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.topProperties.map((property: TopProperty) => (
                    <TableRow key={property.id}>
                      <TableCell>{property.title}</TableCell>
                      <TableCell align="right">{property.views}</TableCell>
                      <TableCell align="right">{property.inquiries}</TableCell>
                      <TableCell align="right">
                        ${property.price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={showDataPointDialog} onClose={() => setShowDataPointDialog(false)}>
        <DialogTitle>Data Point Details</DialogTitle>
        <DialogContent>
          {selectedDataPoint && (
            <Box>
              <Typography variant="subtitle1">Date: {selectedDataPoint.date}</Typography>
              <Typography variant="subtitle1">
                Revenue: ${selectedDataPoint.value.toLocaleString()}
              </Typography>
              {/* Add more details as needed */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataPointDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showFilters} onClose={() => setShowFilters(false)}>
        <DialogTitle>Filter Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Property Types
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {data?.propertyTypes.map((type: PropertyTypeData) => (
                <Chip
                  key={type.name}
                  label={type.name}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      propertyTypes: prev.propertyTypes.includes(type.name)
                        ? prev.propertyTypes.filter(t => t !== type.name)
                        : [...prev.propertyTypes, type.name],
                    }));
                  }}
                  color={filters.propertyTypes.includes(type.name) ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>
          {/* Add more filter options as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilters(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analytics; 
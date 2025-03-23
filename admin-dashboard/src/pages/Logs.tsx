import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import InfoIcon from '@mui/icons-material/Info';
import { getLogStats, searchLogs, getLogFiles, downloadLogFile } from '../services/logsService';
import type { LogFilters as ApiLogFilters, LogStats, DailyLogData } from '../services/logsService';

// Local interface for component state
interface LocalLogFilters {
  level: string;
  collection: string;
  userId: string;
  message: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

const COLORS = ['#d32f2f', '#f57c00', '#2196f3', '#4caf50', '#9c27b0'];
const LEVEL_COLORS = {
  error: '#d32f2f',  // Red
  warn: '#f57c00',   // Orange
  info: '#2196f3',   // Blue
  http: '#4caf50',   // Green
  debug: '#9c27b0',  // Purple
};

const COLLECTIONS = [
  'All Collections',
  'users',
  'properties',
  'transactions',
  'listings',
  'messages',
];

const LOG_LEVELS = [
  'All Levels',
  'error',
  'warn',
  'info',
  'http',
  'debug',
];

const Logs: React.FC = () => {
  // State
  const [filters, setFilters] = useState<LocalLogFilters>({
    level: 'All Levels',
    collection: 'All Collections',
    userId: '',
    message: '',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });
  
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Fetch data on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getLogStats(filters as ApiLogFilters);
        setLogStats(data);
      } catch (err) {
        setError('Failed to load log data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);
  
  // Handle filter changes
  const handleLevelChange = (event: SelectChangeEvent) => {
    setFilters({
      ...filters,
      level: event.target.value,
    });
  };
  
  const handleCollectionChange = (event: SelectChangeEvent) => {
    setFilters({
      ...filters,
      collection: event.target.value,
    });
  };
  
  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      userId: event.target.value,
    });
  };
  
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      message: event.target.value,
    });
  };
  
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setStartDate(date);
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date,
      },
    });
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setEndDate(date);
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date,
      },
    });
  };
  
  const handleRefresh = () => {
    const currentFilters = { ...filters };
    setFilters(currentFilters);
  };
  
  const handleExportLogs = async () => {
    try {
      // For now, just download the most recent log file
      const files = await getLogFiles();
      if (files && files.length > 0) {
        downloadLogFile(files[0].name);
      } else {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    } catch (err) {
      setError('Failed to export logs. Please try again.');
      console.error(err);
    }
  };
  
  const handleViewLogFile = async () => {
    try {
      const searchResult = await searchLogs(filters as ApiLogFilters, 100);
      // In a real implementation, this would open a modal with log content
      console.log('Log search results:', searchResult);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (err) {
      setError('Failed to load log entries. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Log Analytics
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export logs">
            <IconButton onClick={handleExportLogs} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View log file">
            <IconButton onClick={handleViewLogFile} color="primary">
              <FileOpenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="level-select-label">Log Level</InputLabel>
              <Select
                labelId="level-select-label"
                id="level-select"
                value={filters.level}
                onChange={handleLevelChange}
                label="Log Level"
              >
                {LOG_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="collection-select-label">Collection</InputLabel>
              <Select
                labelId="collection-select-label"
                id="collection-select"
                value={filters.collection}
                onChange={handleCollectionChange}
                label="Collection"
              >
                {COLLECTIONS.map((collection) => (
                  <MenuItem key={collection} value={collection}>
                    {collection}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              id="user-id"
              label="User ID"
              value={filters.userId}
              onChange={handleUserIdChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              id="message"
              label="Message Contains"
              value={filters.message}
              onChange={handleMessageChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="start-date"
              label="Start Date"
              type="date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="end-date"
              label="End Date"
              type="date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        
        {/* Active filters */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.level !== 'All Levels' && (
              <Chip 
                label={`Level: ${filters.level}`} 
                onDelete={() => setFilters({ ...filters, level: 'All Levels' })}
                sx={{ bgcolor: LEVEL_COLORS[filters.level as keyof typeof LEVEL_COLORS], color: 'white' }}
              />
            )}
            {filters.collection !== 'All Collections' && (
              <Chip 
                label={`Collection: ${filters.collection}`} 
                onDelete={() => setFilters({ ...filters, collection: 'All Collections' })}
              />
            )}
            {filters.userId && (
              <Chip 
                label={`User: ${filters.userId}`} 
                onDelete={() => setFilters({ ...filters, userId: '' })}
              />
            )}
            {filters.message && (
              <Chip 
                label={`Message: ${filters.message}`} 
                onDelete={() => setFilters({ ...filters, message: '' })}
              />
            )}
            {filters.dateRange.start && (
              <Chip 
                label={`From: ${filters.dateRange.start}`} 
                onDelete={() => {
                  setStartDate(null);
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: null }
                  });
                }}
              />
            )}
            {filters.dateRange.end && (
              <Chip 
                label={`To: ${filters.dateRange.end}`} 
                onDelete={() => {
                  setEndDate(null);
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: null }
                  });
                }}
              />
            )}
          </Stack>
        </Box>
      </Paper>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Log statistics */}
      {!loading && !error && logStats && (
        <>
          {/* Summary cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Log Entries
                  </Typography>
                  <Typography variant="h3">
                    {logStats.totalEntries.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Over the selected time period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Error Rate
                  </Typography>
                  <Typography variant="h3">
                    {(
                      (logStats.levelDistribution.find(l => l.name === 'error')?.value || 0) / 
                      logStats.totalEntries * 100
                    ).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {logStats.levelDistribution.find(l => l.name === 'error')?.value.toLocaleString()} errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Most Active Collection
                  </Typography>
                  <Typography variant="h3">
                    {logStats.collectionMetrics[0]?.name || 'None'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {logStats.collectionMetrics[0]?.operations.toLocaleString() || 0} operations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3}>
            {/* Daily log volume chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Daily Log Volume
                  </Typography>
                  <Tooltip title="Shows the daily count of log entries by level">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={logStats.dailyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar 
                        dataKey="total" 
                        name="Total" 
                        fill="#2196f3" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Log level distribution chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Log Level Distribution
                  </Typography>
                  <Tooltip title="Shows the distribution of log entries by level">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={logStats.levelDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {logStats.levelDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={LEVEL_COLORS[entry.name as keyof typeof LEVEL_COLORS] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value: any) => [value.toLocaleString(), 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Collection operations chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Collection Operations
                  </Typography>
                  <Tooltip title="Shows the number of database operations per collection">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={logStats.collectionMetrics}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <ChartTooltip />
                      <Bar 
                        dataKey="operations" 
                        name="Operations" 
                        fill="#2196f3" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Top error messages */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Error Messages
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={logStats.topErrors}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="message" 
                        type="category" 
                        width={150}
                        tick={{ fontSize: 12 }}
                      />
                      <ChartTooltip />
                      <Bar 
                        dataKey="count" 
                        name="Count" 
                        fill="#d32f2f" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Action feedback */}
      <Snackbar
        open={showTooltip}
        autoHideDuration={2000}
        onClose={() => setShowTooltip(false)}
        message="This feature would connect to the backend in a real implementation"
      />
    </Box>
  );
};

export default Logs; 
import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { settingsService, PlatformSettings } from '../services/settingsService';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [emailTemplateDialog, setEmailTemplateDialog] = useState<{
    open: boolean;
    template: keyof PlatformSettings['emailTemplates'] | null;
  }>({ open: false, template: null });
  const [emailTemplateContent, setEmailTemplateContent] = useState('');
  const [newPropertyType, setNewPropertyType] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PlatformSettings) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!settings) return;
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;
    setSettings((prev: PlatformSettings | null) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSelectChange = (field: keyof PlatformSettings) => (event: SelectChangeEvent) => {
    if (!settings) return;
    setSettings((prev: PlatformSettings | null) => prev ? { ...prev, [field]: event.target.value } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setLoading(true);
      await settingsService.updateSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      setSaveStatus('error');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const data = await settingsService.resetSettings();
      setSettings(data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setError('Failed to reset settings');
      setSaveStatus('error');
      console.error('Error resetting settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailTemplateOpen = (template: keyof PlatformSettings['emailTemplates']) => {
    if (!settings) return;
    setEmailTemplateDialog({ open: true, template });
    setEmailTemplateContent(settings.emailTemplates[template]);
  };

  const handleEmailTemplateClose = () => {
    setEmailTemplateDialog({ open: false, template: null });
  };

  const handleEmailTemplateSave = async () => {
    if (!emailTemplateDialog.template) return;
    try {
      setLoading(true);
      const data = await settingsService.updateEmailTemplate(
        emailTemplateDialog.template,
        emailTemplateContent
      );
      setSettings(data);
      handleEmailTemplateClose();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setError('Failed to save email template');
      setSaveStatus('error');
      console.error('Error saving email template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPropertyType = () => {
    if (!settings || !newPropertyType) return;
    setSettings((prev: PlatformSettings | null) => prev ? {
      ...prev,
      allowedPropertyTypes: [...prev.allowedPropertyTypes, newPropertyType],
    } : null);
    setNewPropertyType('');
  };

  const handleRemovePropertyType = (type: string) => {
    if (!settings) return;
    setSettings((prev: PlatformSettings | null) => prev ? {
      ...prev,
      allowedPropertyTypes: prev.allowedPropertyTypes.filter((t: string) => t !== type),
    } : null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Alert severity="error">
        Failed to load settings. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Platform Settings</Typography>
        <Box>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={handleReset} color="warning">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {saveStatus && (
        <Alert severity={saveStatus} sx={{ mb: 2 }}>
          {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings'}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.siteName}
                  onChange={handleChange('siteName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  value={settings.contactEmail}
                  onChange={handleChange('contactEmail')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Site Description"
                  value={settings.siteDescription}
                  onChange={handleChange('siteDescription')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Feature Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableRegistration}
                      onChange={handleChange('enableRegistration')}
                    />
                  }
                  label="Enable User Registration"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableEmailNotifications}
                      onChange={handleChange('enableEmailNotifications')}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.currency}
                    onChange={handleSelectChange('currency')}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Language</InputLabel>
                  <Select
                    value={settings.defaultLanguage}
                    onChange={handleSelectChange('defaultLanguage')}
                    label="Default Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Properties Per User"
                  value={settings.maxPropertiesPerUser}
                  onChange={handleChange('maxPropertiesPerUser')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Images Per Property"
                  value={settings.maxImagesPerProperty}
                  onChange={handleChange('maxImagesPerProperty')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleChange('maintenanceMode')}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Types
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                size="small"
                label="New Property Type"
                value={newPropertyType}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPropertyType(e.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPropertyType}
                disabled={!newPropertyType}
              >
                Add
              </Button>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {settings.allowedPropertyTypes.map((type: string) => (
                <Chip
                  key={type}
                  label={type}
                  onDelete={() => handleRemovePropertyType(type)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email Templates
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(settings.emailTemplates).map(([key, value]) => (
                <Grid item xs={12} key={key}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography flex={1}>{key}</Typography>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEmailTemplateOpen(key as keyof PlatformSettings['emailTemplates'])}
                    >
                      Edit
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={emailTemplateDialog.open}
        onClose={handleEmailTemplateClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit {emailTemplateDialog.template?.replace(/([A-Z])/g, ' $1').trim()} Template
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={emailTemplateContent}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmailTemplateContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailTemplateClose}>Cancel</Button>
          <Button onClick={handleEmailTemplateSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 
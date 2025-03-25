import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Switch, FormControlLabel, Checkbox, Divider } from '@mui/material';

interface AdditionalOptionsProps {
  formData: {
    additionalOptions: Record<string, any>;
  };
  updateFormData: (field: string, value: any) => void;
}

const AdditionalOptions: React.FC<AdditionalOptionsProps> = ({ formData, updateFormData }) => {
  const [retryEnabled, setRetryEnabled] = useState(
    formData.additionalOptions.retryPolicy?.enabled || false
  );
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    formData.additionalOptions.notifications?.enabled || false
  );
  
  const [debugEnabled, setDebugEnabled] = useState(
    formData.additionalOptions.debug?.enabled || false
  );

  const handleOptionChange = (category: string, field: string, value: any) => {
    const currentOptions = { ...formData.additionalOptions };
    
    if (!currentOptions[category]) {
      currentOptions[category] = {};
    }
    
    currentOptions[category][field] = value;
    
    updateFormData('additionalOptions', currentOptions);
  };

  const handleRetryToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setRetryEnabled(enabled);
    
    const currentOptions = { ...formData.additionalOptions };
    if (!currentOptions.retryPolicy) {
      currentOptions.retryPolicy = {
        enabled,
        maxAttempts: 3,
        delayMs: 5000,
        backoffMultiplier: 1.5
      };
    } else {
      currentOptions.retryPolicy.enabled = enabled;
    }
    
    updateFormData('additionalOptions', currentOptions);
  };

  const handleNotificationsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    
    const currentOptions = { ...formData.additionalOptions };
    if (!currentOptions.notifications) {
      currentOptions.notifications = {
        enabled,
        onSuccess: false,
        onFailure: true,
        email: [],
        slack: []
      };
    } else {
      currentOptions.notifications.enabled = enabled;
    }
    
    updateFormData('additionalOptions', currentOptions);
  };

  const handleDebugToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setDebugEnabled(enabled);
    
    const currentOptions = { ...formData.additionalOptions };
    if (!currentOptions.debug) {
      currentOptions.debug = {
        enabled,
        verbose: false,
        saveRawResponses: true
      };
    } else {
      currentOptions.debug.enabled = enabled;
    }
    
    updateFormData('additionalOptions', currentOptions);
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Additional Options
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Retry Policy
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={retryEnabled}
              onChange={handleRetryToggle}
              name="retryEnabled"
              color="primary"
            />
          }
          label="Enable Retry Policy"
        />
        
        {retryEnabled && (
          <Box sx={{ ml: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Max Attempts"
              type="number"
              variant="outlined"
              margin="normal"
              value={formData.additionalOptions.retryPolicy?.maxAttempts || 3}
              onChange={(e) => handleOptionChange('retryPolicy', 'maxAttempts', parseInt(e.target.value, 10))}
              InputProps={{ inputProps: { min: 1, max: 10 } }}
            />
            
            <TextField
              fullWidth
              label="Delay (ms)"
              type="number"
              variant="outlined"
              margin="normal"
              value={formData.additionalOptions.retryPolicy?.delayMs || 5000}
              onChange={(e) => handleOptionChange('retryPolicy', 'delayMs', parseInt(e.target.value, 10))}
              InputProps={{ inputProps: { min: 1000, max: 60000, step: 1000 } }}
              helperText="Initial delay between retries in milliseconds"
            />
            
            <TextField
              fullWidth
              label="Backoff Multiplier"
              type="number"
              variant="outlined"
              margin="normal"
              value={formData.additionalOptions.retryPolicy?.backoffMultiplier || 1.5}
              onChange={(e) => handleOptionChange('retryPolicy', 'backoffMultiplier', parseFloat(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 5, step: 0.1 } }}
              helperText="Multiply delay by this value after each retry"
            />
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Notifications
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
              name="notificationsEnabled"
              color="primary"
            />
          }
          label="Enable Notifications"
        />
        
        {notificationsEnabled && (
          <Box sx={{ ml: 3, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.additionalOptions.notifications?.onSuccess || false}
                  onChange={(e) => handleOptionChange('notifications', 'onSuccess', e.target.checked)}
                  name="onSuccess"
                />
              }
              label="Notify on Success"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.additionalOptions.notifications?.onFailure || true}
                  onChange={(e) => handleOptionChange('notifications', 'onFailure', e.target.checked)}
                  name="onFailure"
                />
              }
              label="Notify on Failure"
            />
            
            <TextField
              fullWidth
              label="Email Addresses"
              variant="outlined"
              margin="normal"
              value={(formData.additionalOptions.notifications?.email || []).join(', ')}
              onChange={(e) => handleOptionChange('notifications', 'email', e.target.value.split(',').map(email => email.trim()).filter(Boolean))}
              helperText="Comma separated email addresses"
            />
            
            <TextField
              fullWidth
              label="Slack Channels"
              variant="outlined"
              margin="normal"
              value={(formData.additionalOptions.notifications?.slack || []).join(', ')}
              onChange={(e) => handleOptionChange('notifications', 'slack', e.target.value.split(',').map(channel => channel.trim()).filter(Boolean))}
              helperText="Comma separated Slack channels"
            />
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Debug Options
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={debugEnabled}
              onChange={handleDebugToggle}
              name="debugEnabled"
              color="primary"
            />
          }
          label="Enable Debug Mode"
        />
        
        {debugEnabled && (
          <Box sx={{ ml: 3, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.additionalOptions.debug?.verbose || false}
                  onChange={(e) => handleOptionChange('debug', 'verbose', e.target.checked)}
                  name="verbose"
                />
              }
              label="Verbose Logging"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.additionalOptions.debug?.saveRawResponses || true}
                  onChange={(e) => handleOptionChange('debug', 'saveRawResponses', e.target.checked)}
                  name="saveRawResponses"
                />
              }
              label="Save Raw Responses"
            />
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Configure additional options for the controller such as retry policies,
        notifications, and debug settings. These options can help with troubleshooting
        and monitoring the controller's performance.
      </Typography>
    </Box>
  );
};

export default AdditionalOptions; 
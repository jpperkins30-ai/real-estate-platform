import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// API service imports
import { 
  fetchControllerTypes, 
  fetchStates, 
  fetchCountiesByState, 
  fetchDataSources, 
  fetchCollectorTypes,
  createController,
  createDataSource,
  attachController,
  validateController
} from '../../../services/api';

// Styled components
const WizardContainer = styled(Box)(({ theme }) => ({
  maxWidth: '900px',
  margin: '0 auto',
  padding: theme.spacing(3)
}));

const StepContent = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column'
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(3)
}));

// Helper components
const WizardHeader = ({ step, totalSteps }) => (
  <Box sx={{ mb: 3 }}>
    <Stepper activeStep={step - 1} alternativeLabel>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Step key={i}>
          <StepLabel>{`Step ${i + 1}`}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

const WizardStep = ({ title, children }) => (
  <StepContent>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {children}
  </StepContent>
);

const WizardNavigation = ({ onBack, onNext, isLastStep = false }) => (
  <NavigationContainer>
    <Button variant="outlined" onClick={onBack} disabled={!onBack}>
      Back
    </Button>
    <Button variant="contained" color="primary" onClick={onNext}>
      {isLastStep ? 'Create' : 'Next'}
    </Button>
  </NavigationContainer>
);

const WizardSummary = ({ formData }) => (
  <Box>
    <Typography variant="h6" gutterBottom>Summary</Typography>
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Controller Type</Typography>
          <Typography>{formData.controllerType}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Name</Typography>
          <Typography>{formData.name}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Description</Typography>
          <Typography>{formData.description}</Typography>
        </Grid>
        {formData.state && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">State</Typography>
            <Typography>{formData.state}</Typography>
          </Grid>
        )}
        {formData.county && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">County</Typography>
            <Typography>{formData.county}</Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Collector Type</Typography>
          <Typography>{formData.collectorType}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Data Source</Typography>
          <Typography>{formData.dataSource || formData.dataSourceName + ' (new)'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Frequency</Typography>
          <Typography>{formData.frequency}</Typography>
        </Grid>
      </Grid>
    </Paper>
  </Box>
);

// Main component
const ControllerWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    controllerType: '',
    name: '',
    description: '',
    state: '',
    county: '',
    dataSource: '',
    dataSourceName: '',
    collectorType: '',
    frequency: 'daily',
    schedule: {
      enabled: true,
      time: '00:00',
      days: ['monday', 'wednesday', 'friday']
    },
    notifications: {
      enabled: true,
      email: true,
      slack: false,
      webhook: false
    },
    validation: {
      enabled: true,
      validateDataFormat: true,
      validateGeocoding: true
    },
    additionalOptions: {}
  });
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    validationResults?: {
      validationResult: {
        isValid: boolean;
        checks: Array<{
          name: string;
          status: string;
        }>;
        messages: string[];
      };
      testResult: {
        success: boolean;
        testsRun: number;
        testsPassed: number;
        testsFailed: number;
        details: Array<{
          name: string;
          status: string;
          message: string;
        }>;
      };
      apiDocGenerated: boolean;
    };
  }>({ loading: false, error: null, success: false });
  
  // Fetch required data
  const { data: controllerTypes, isLoading: loadingControllerTypes } = useQuery('controllerTypes', fetchControllerTypes);
  const { data: states, isLoading: loadingStates } = useQuery('states', fetchStates);
  const { data: counties, isLoading: loadingCounties } = useQuery(
    ['counties', formData.state],
    () => fetchCountiesByState(formData.state),
    { enabled: !!formData.state }
  );
  const { data: dataSources, isLoading: loadingDataSources } = useQuery('dataSources', fetchDataSources);
  const { data: collectorTypes, isLoading: loadingCollectorTypes } = useQuery('collectorTypes', fetchCollectorTypes);
  
  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };
  
  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };
  
  const handleChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [parent]: {
        ...prevData[parent],
        [field]: value
      }
    }));
  };
  
  const handleScheduleDayToggle = (day) => {
    setFormData(prevData => {
      const currentDays = prevData.schedule.days;
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      
      return {
        ...prevData,
        schedule: {
          ...prevData.schedule,
          days: newDays
        }
      };
    });
  };
  
  const handleSubmit = async () => {
    try {
      setStatus({ loading: true, error: null, success: false });
      
      // Create controller
      const controllerResponse = await createController({
        type: formData.controllerType,
        name: formData.name,
        description: formData.description,
        enabled: true,
        config: {
          schedule: {
            enabled: formData.schedule.enabled,
            cronExpression: generateCronExpression(formData.schedule),
            timezone: 'America/New_York'
          },
          notificationSettings: {
            email: formData.notifications.email ? ['admin@example.com'] : [],
            slack: formData.notifications.slack ? ['#data-collection'] : [],
            webhook: formData.notifications.webhook ? ['https://webhook.example.com/notify'] : [],
            onSuccess: true,
            onFailure: true
          },
          filters: {
            objectTypes: formData.state ? ['state'] : (formData.county ? ['county'] : ['property']),
            objectIds: []
          },
          parameters: {
            validation: formData.validation,
            additionalOptions: formData.additionalOptions
          }
        }
      });
      
      // Create data source if needed
      let dataSourceId = formData.dataSource;
      if (!dataSourceId) {
        const dataSourceResponse = await createDataSource({
          name: formData.dataSourceName,
          type: 'county-website',
          url: '',  // Will be filled during configuration
          region: {
            state: formData.state,
            county: formData.county
          },
          collectorType: formData.collectorType,
          schedule: {
            frequency: formData.frequency
          },
          metadata: {}
        });
        dataSourceId = dataSourceResponse.id;
      }
      
      // Attach controller to objects
      if (formData.state) {
        await attachController(controllerResponse.id, 'state', formData.state);
      }
      
      if (formData.county) {
        await attachController(controllerResponse.id, 'county', formData.county);
      }
      
      // Trigger enhanced validation, testing and documentation generation
      const validationResults = await validateController(controllerResponse.id);
      
      // Success!
      setStatus({ 
        loading: false, 
        error: null, 
        success: true,
        validationResults
      });
      
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Failed to create controller', success: false });
    }
  };

  // Helper function to generate cron expression based on schedule
  const generateCronExpression = (schedule) => {
    const [hours, minutes] = schedule.time.split(':');
    const days = schedule.days.map(day => {
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      return dayMap[day];
    }).join(',');
    
    return `${minutes} ${hours} * * ${days}`;
  };
  
  return (
    <WizardContainer>
      <WizardHeader step={step} totalSteps={7} />
      
      {step === 1 && (
        <WizardStep title="Controller Type">
          <Typography paragraph>
            Select the type of controller you want to create. Controllers manage the data collection
            process for different types of objects in the inventory hierarchy.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <FormLabel>Controller Type</FormLabel>
            <Select
              value={formData.controllerType}
              onChange={(e) => handleChange('controllerType', e.target.value)}
              disabled={loadingControllerTypes}
            >
              {controllerTypes?.map(type => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 2 && (
        <WizardStep title="Basic Information">
          <Typography paragraph>
            Provide basic information about this controller.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Controller Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onBack={handleBack} onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 3 && (
        <WizardStep title="Select Region">
          <Typography paragraph>
            Select the region this controller will operate on. The controller can be attached to 
            a state, county, or individual properties.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <FormLabel>State</FormLabel>
            <Select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              disabled={loadingStates}
            >
              <MenuItem value="">None (U.S. Wide)</MenuItem>
              {states?.map(state => (
                <MenuItem key={state.id} value={state.id}>{state.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {formData.state && (
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <FormLabel>County</FormLabel>
              <Select
                value={formData.county}
                onChange={(e) => handleChange('county', e.target.value)}
                disabled={loadingCounties}
              >
                <MenuItem value="">All Counties</MenuItem>
                {counties?.map(county => (
                  <MenuItem key={county.id} value={county.id}>{county.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onBack={handleBack} onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 4 && (
        <WizardStep title="Data Source Configuration">
          <Typography paragraph>
            Configure the data source for this controller. You can either select an existing data source
            or create a new one.
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Data Source</FormLabel>
            <RadioGroup 
              value={formData.dataSource ? 'existing' : 'new'}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  handleChange('dataSource', '');
                }
              }}
            >
              <FormControlLabel value="existing" control={<Radio />} label="Use Existing Data Source" />
              <FormControlLabel value="new" control={<Radio />} label="Create New Data Source" />
            </RadioGroup>
          </FormControl>
          
          {formData.dataSource ? (
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <FormLabel>Select Data Source</FormLabel>
              <Select
                value={formData.dataSource}
                onChange={(e) => handleChange('dataSource', e.target.value)}
                disabled={loadingDataSources}
              >
                {dataSources?.map(source => (
                  <MenuItem key={source.id} value={source.id}>{source.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Data Source Name"
                  value={formData.dataSourceName}
                  onChange={(e) => handleChange('dataSourceName', e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Collector Type</FormLabel>
                  <Select
                    value={formData.collectorType}
                    onChange={(e) => handleChange('collectorType', e.target.value)}
                    disabled={loadingCollectorTypes}
                  >
                    {collectorTypes?.map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Collection Frequency</FormLabel>
                  <Select
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onBack={handleBack} onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 5 && (
        <WizardStep title="Schedule Configuration">
          <Typography paragraph>
            Configure when the controller should run.
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.schedule.enabled}
                onChange={(e) => handleNestedChange('schedule', 'enabled', e.target.checked)}
              />
            }
            label="Enable scheduling"
          />
          
          {formData.schedule.enabled && (
            <>
              <Box sx={{ mt: 2 }}>
                <FormLabel>Run Time</FormLabel>
                <TextField
                  type="time"
                  value={formData.schedule.time}
                  onChange={(e) => handleNestedChange('schedule', 'time', e.target.value)}
                  fullWidth
                  sx={{ mt: 1, mb: 2 }}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <FormLabel>Run on these days</FormLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox 
                          checked={formData.schedule.days.includes(day)}
                          onChange={() => handleScheduleDayToggle(day)}
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onBack={handleBack} onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 6 && (
        <WizardStep title="Notifications and Validation">
          <Typography paragraph>
            Configure notification preferences and validation settings.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Notifications</Typography>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.notifications.enabled}
                  onChange={(e) => handleNestedChange('notifications', 'enabled', e.target.checked)}
                />
              }
              label="Enable notifications"
            />
            
            {formData.notifications.enabled && (
              <Box sx={{ ml: 3, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.notifications.email}
                      onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.notifications.slack}
                      onChange={(e) => handleNestedChange('notifications', 'slack', e.target.checked)}
                    />
                  }
                  label="Slack notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.notifications.webhook}
                      onChange={(e) => handleNestedChange('notifications', 'webhook', e.target.checked)}
                    />
                  }
                  label="Webhook notifications"
                />
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>Validation</Typography>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.validation.enabled}
                  onChange={(e) => handleNestedChange('validation', 'enabled', e.target.checked)}
                />
              }
              label="Enable data validation"
            />
            
            {formData.validation.enabled && (
              <Box sx={{ ml: 3, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.validation.validateDataFormat}
                      onChange={(e) => handleNestedChange('validation', 'validateDataFormat', e.target.checked)}
                    />
                  }
                  label="Validate data format"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.validation.validateGeocoding}
                      onChange={(e) => handleNestedChange('validation', 'validateGeocoding', e.target.checked)}
                    />
                  }
                  label="Validate geocoding"
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation onBack={handleBack} onNext={handleNext} />
        </WizardStep>
      )}
      
      {step === 7 && (
        <WizardStep title="Review and Create">
          <WizardSummary formData={formData} />
          
          {status.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {status.error}
            </Alert>
          )}
          
          {status.success && (
            <>
              <Alert severity="success" sx={{ mt: 2 }}>
                Controller created successfully! Redirecting to inventory...
              </Alert>
              
              {status.validationResults && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Validation Results</Typography>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Configuration Validation</Typography>
                        <Typography color="success.main">
                          {status.validationResults.validationResult.isValid ? 'Passed' : 'Failed'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Test Collection</Typography>
                        <Typography color="success.main">
                          {status.validationResults.testResult.success ? 'Passed' : 'Failed'}
                        </Typography>
                        <Typography variant="body2">
                          {status.validationResults.testResult.testsRun} tests run, 
                          {status.validationResults.testResult.testsPassed} passed, 
                          {status.validationResults.testResult.testsFailed} failed
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">API Documentation</Typography>
                        <Typography color="success.main">
                          {status.validationResults.apiDocGenerated ? 'Generated' : 'Failed'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}
            </>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          <WizardNavigation 
            onBack={handleBack} 
            onNext={handleSubmit} 
            isLastStep={true} 
          />
        </WizardStep>
      )}
    </WizardContainer>
  );
};

export default ControllerWizard; 
import React from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Paper, TextField, MenuItem } from '@mui/material';

interface SelectFrequencyProps {
  formData: {
    frequency: string;
    dayOfWeek: number;
    dayOfMonth: number;
  };
  updateFormData: (field: string, value: any) => void;
}

const daysOfWeek = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getDaySuffix(i + 1)}`
}));

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

const SelectFrequency: React.FC<SelectFrequencyProps> = ({ formData, updateFormData }) => {
  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('frequency', event.target.value);
  };

  const handleDayOfWeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('dayOfWeek', parseInt(event.target.value, 10));
  };

  const handleDayOfMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('dayOfMonth', parseInt(event.target.value, 10));
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Collection Frequency
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose how often the controller should collect data:
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleFrequencyChange}
          >
            <FormControlLabel value="hourly" control={<Radio />} label="Hourly" />
            <FormControlLabel value="daily" control={<Radio />} label="Daily" />
            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="manual" control={<Radio />} label="Manual (On-demand)" />
          </RadioGroup>
        </FormControl>
        
        {formData.frequency === 'weekly' && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Day of Week
            </Typography>
            <FormControl fullWidth>
              <TextField
                select
                label="Select Day"
                value={formData.dayOfWeek}
                onChange={handleDayOfWeekChange}
                variant="outlined"
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Box>
        )}
        
        {formData.frequency === 'monthly' && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Day of Month
            </Typography>
            <FormControl fullWidth>
              <TextField
                select
                label="Select Day"
                value={formData.dayOfMonth}
                onChange={handleDayOfMonthChange}
                variant="outlined"
              >
                {daysOfMonth.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The collection frequency determines how often the controller will run to collect data.
        Select a frequency that balances freshness of data with system resource usage.
      </Typography>
    </Box>
  );
};

export default SelectFrequency; 
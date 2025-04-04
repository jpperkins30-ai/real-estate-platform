# Building Custom Filter Components

This guide explains how to create custom filter components that integrate seamlessly with the filter system.

## Basic Filter Component Structure

A well-designed filter component typically includes:

1. Connection to the filter context
2. UI controls for modifying filter values
3. Local state for handling pending changes
4. Apply/Reset functionality

Here's a basic template:

```tsx
import React, { useState, useEffect } from 'react';
import { useFilter } from '../hooks/useFilter';

interface PriceRangeFilterProps {
  title?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  title = 'Price Range',
  min = 0,
  max = 1000000,
  step = 1000
}) => {
  const { activeFilters, applyFilters } = useFilter();
  
  // Local state for the control
  const [range, setRange] = useState<[number, number]>(
    activeFilters.priceRange || [min, max]
  );
  
  // Update local state when active filters change
  useEffect(() => {
    if (activeFilters.priceRange) {
      setRange(activeFilters.priceRange);
    }
  }, [activeFilters.priceRange]);
  
  // Handle local changes
  const handleRangeChange = (newRange: [number, number]) => {
    setRange(newRange);
  };
  
  // Apply changes to the global filter context
  const handleApply = () => {
    applyFilters({ priceRange: range });
  };
  
  // Reset to the active filter value or default
  const handleReset = () => {
    const defaultRange = activeFilters.priceRange || [min, max];
    setRange(defaultRange);
  };
  
  return (
    <div className="filter-component">
      <h3>{title}</h3>
      
      <div className="range-inputs">
        <input 
          type="number" 
          value={range[0]} 
          onChange={(e) => handleRangeChange([parseInt(e.target.value), range[1]])}
          min={min}
          max={range[1]}
          step={step}
        />
        <span>to</span>
        <input 
          type="number" 
          value={range[1]} 
          onChange={(e) => handleRangeChange([range[0], parseInt(e.target.value)])}
          min={range[0]}
          max={max}
          step={step}
        />
      </div>
      
      <div className="filter-actions">
        <button onClick={handleApply}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};
```

## Creating a Reusable Filter Group

For organizing multiple related filters:

```tsx
import React from 'react';
import { useFilter } from '../hooks/useFilter';

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  initialCollapsed?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  collapsible = true,
  initialCollapsed = false
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  
  const toggleCollapsed = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };
  
  return (
    <div className="filter-group">
      <div 
        className={`filter-group-header ${collapsible ? 'collapsible' : ''}`}
        onClick={toggleCollapsed}
      >
        <h2>{title}</h2>
        {collapsible && (
          <span className="collapse-icon">
            {collapsed ? '+' : '-'}
          </span>
        )}
      </div>
      
      <div className={`filter-group-content ${collapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};
```

## Multi-Select Filter Component

A component for selecting multiple values:

```tsx
import React, { useState, useEffect } from 'react';
import { useFilter } from '../hooks/useFilter';

interface MultiSelectFilterProps {
  title: string;
  options: Array<{ value: string; label: string }>;
  filterKey: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  filterKey
}) => {
  const { activeFilters, applyFilters } = useFilter();
  
  // Local state for selections
  const [selected, setSelected] = useState<string[]>(
    activeFilters[filterKey] || []
  );
  
  // Update local state when active filters change
  useEffect(() => {
    if (activeFilters[filterKey]) {
      setSelected(activeFilters[filterKey]);
    }
  }, [activeFilters, filterKey]);
  
  // Toggle a selection
  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    setSelected(newSelected);
  };
  
  // Apply changes
  const handleApply = () => {
    applyFilters({ [filterKey]: selected });
  };
  
  // Reset selections
  const handleReset = () => {
    setSelected(activeFilters[filterKey] || []);
  };
  
  return (
    <div className="filter-component multi-select-filter">
      <h3>{title}</h3>
      
      <div className="options-list">
        {options.map(option => (
          <div key={option.value} className="option">
            <label>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      <div className="filter-actions">
        <button onClick={handleApply}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};
```

## Date Range Filter Component

A component for filtering by date ranges:

```tsx
import React, { useState, useEffect } from 'react';
import { useFilter } from '../hooks/useFilter';

interface DateRangeFilterProps {
  title: string;
  filterKey: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  title,
  filterKey
}) => {
  const { activeFilters, applyFilters } = useFilter();
  
  // Local state for the date range
  const [startDate, setStartDate] = useState<string>(
    activeFilters[filterKey]?.[0] || ''
  );
  
  const [endDate, setEndDate] = useState<string>(
    activeFilters[filterKey]?.[1] || ''
  );
  
  // Update local state when active filters change
  useEffect(() => {
    if (activeFilters[filterKey]) {
      setStartDate(activeFilters[filterKey][0] || '');
      setEndDate(activeFilters[filterKey][1] || '');
    }
  }, [activeFilters, filterKey]);
  
  // Apply the date range filter
  const handleApply = () => {
    if (startDate || endDate) {
      applyFilters({ [filterKey]: [startDate, endDate] });
    } else {
      // If both dates are empty, remove the filter
      const newFilters = { ...activeFilters };
      delete newFilters[filterKey];
      applyFilters(newFilters);
    }
  };
  
  // Reset to active filter values
  const handleReset = () => {
    if (activeFilters[filterKey]) {
      setStartDate(activeFilters[filterKey][0] || '');
      setEndDate(activeFilters[filterKey][1] || '');
    } else {
      setStartDate('');
      setEndDate('');
    }
  };
  
  return (
    <div className="filter-component date-range-filter">
      <h3>{title}</h3>
      
      <div className="date-inputs">
        <div className="date-field">
          <label>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="date-field">
          <label>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="filter-actions">
        <button onClick={handleApply}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};
```

## Creating a Filter with Auto-Apply

For filters that apply changes immediately:

```tsx
import React from 'react';
import { useFilter } from '../hooks/useFilter';

interface ToggleFilterProps {
  title: string;
  filterKey: string;
  label?: string;
}

export const ToggleFilter: React.FC<ToggleFilterProps> = ({
  title,
  filterKey,
  label = 'Enable'
}) => {
  const { activeFilters, applyFilters } = useFilter();
  
  // Toggle the filter value with auto-apply
  const handleToggle = () => {
    const currentValue = !!activeFilters[filterKey];
    applyFilters({ [filterKey]: !currentValue });
  };
  
  return (
    <div className="filter-component toggle-filter">
      <h3>{title}</h3>
      
      <div className="toggle-control">
        <label>
          <input
            type="checkbox"
            checked={!!activeFilters[filterKey]}
            onChange={handleToggle}
          />
          {label}
        </label>
      </div>
    </div>
  );
};
```

## Composing a Complete Filter Panel

Combine multiple filters into a comprehensive panel:

```tsx
import React from 'react';
import { FilterGroup } from './FilterGroup';
import { PriceRangeFilter } from './PriceRangeFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { ToggleFilter } from './ToggleFilter';
import { usePanelState } from '../hooks/usePanelState';
import { useFilter } from '../hooks/useFilter';

interface PropertyFilterPanelProps {
  panelId: string;
}

const propertyTypes = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'land', label: 'Land' }
];

export const PropertyFilterPanel: React.FC<PropertyFilterPanelProps> = ({
  panelId
}) => {
  const { resetFilters } = useFilter();
  const [panelState, setPanelState] = usePanelState(panelId, 'filter');
  
  return (
    <div className="property-filter-panel">
      <div className="panel-header">
        <h2>Property Filters</h2>
        <button onClick={resetFilters}>Reset All</button>
      </div>
      
      <div className="panel-content">
        <FilterGroup title="Price & Size" initialCollapsed={false}>
          <PriceRangeFilter 
            title="Price Range" 
            min={0} 
            max={2000000} 
            step={5000}
          />
          
          {/* Square footage range filter */}
          <PriceRangeFilter 
            title="Square Footage" 
            min={500} 
            max={10000} 
            step={100}
          />
        </FilterGroup>
        
        <FilterGroup title="Property Details">
          <MultiSelectFilter
            title="Property Type"
            options={propertyTypes}
            filterKey="propertyType"
          />
          
          {/* Bedrooms & Bathrooms */}
          {/* ... */}
        </FilterGroup>
        
        <FilterGroup title="Dates">
          <DateRangeFilter
            title="Listed Date"
            filterKey="listedDate"
          />
        </FilterGroup>
        
        <FilterGroup title="Other">
          <ToggleFilter
            title="Features"
            filterKey="hasGarage"
            label="Has Garage"
          />
          
          <ToggleFilter
            filterKey="hasPool"
            label="Has Pool"
          />
        </FilterGroup>
      </div>
    </div>
  );
};
```

## Styling Filter Components

Add these styles to ensure your filter components look consistent:

```css
/* filter-components.css */

.filter-component {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.filter-component h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.filter-actions button {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.filter-actions button:first-child {
  background: #0066cc;
  color: white;
  border-color: #0055aa;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 2px solid #eaeaea;
  margin-bottom: 1rem;
}

.filter-group-header.collapsible {
  cursor: pointer;
}

.filter-group-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.filter-group-content.collapsed {
  display: none;
}

/* Range inputs */
.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-inputs input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Date inputs */
.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-field input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Multi-select */
.options-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  padding: 0.5rem;
}

.option {
  margin-bottom: 0.5rem;
}

.option label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Toggle filter */
.toggle-control {
  display: flex;
  align-items: center;
}

.toggle-control label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
```

## Next Steps

For more information on building and using filter components:

- [Basic Implementation](./basic-implementation.md)
- [Advanced Implementation](./advanced-implementation.md)
- [Filter System Architecture](../architecture.md)
- [Best Practices](../best-practices.md) 
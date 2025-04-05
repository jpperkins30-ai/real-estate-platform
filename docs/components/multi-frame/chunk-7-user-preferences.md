# 🧩 Chunk 7: User Preferences & Settings

## 📋 Overview

The User Preferences system provides a comprehensive framework for personalizing the application experience. It allows users to customize various aspects of the interface, including themes, panel configurations, layouts, and filter behaviors. The system is built with flexibility and extensibility in mind, making it easy to add new preference categories in the future.

## 🔑 Key Components

The preferences system consists of these primary components:

1. **PreferencesContext** - Manages the global state of user preferences
2. **PreferencesService** - Handles saving and loading preferences from server/local storage
3. **ThemeContext** - Applies theme preferences to the application
4. **Preferences Components** - UI components for modifying preferences
5. **Default Layouts Configuration** - Predefined layout templates for different use cases

## 🎨 Preference Categories

### Theme Preferences

The theme preferences control the visual appearance of the application:

- **Color Mode**: Light, Dark, or System-based
- **Map Style**: Standard, Satellite, or Terrain
- **Accent Color**: Custom color selection for UI accents
- **Font Size**: Small, Medium, or Large

```typescript
export interface ThemePreferences {
  colorMode: 'light' | 'dark' | 'system';
  mapStyle: 'standard' | 'satellite' | 'terrain';
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
}
```

### Panel Preferences

Panel preferences control the behavior and appearance of panels:

- **Default Content Types**: What content appears in which panel position
- **Show Panel Header**: Whether to display panel headers
- **Enable Panel Resizing**: Allow panels to be resized
- **Enable Panel Dragging**: Allow panels to be dragged

```typescript
export interface PanelPreferences {
  defaultContentTypes: Record<string, string>;
  showPanelHeader: boolean;
  enablePanelResizing: boolean;
  enablePanelDragging: boolean;
}
```

### Layout Preferences

Layout preferences control how the application's layout behaves:

- **Default Layout**: Which layout to load by default
- **Save Layout on Exit**: Whether to automatically save the layout when exiting
- **Remember Last Layout**: Whether to load the last used layout on startup

```typescript
export interface LayoutPreferences {
  defaultLayout: string;
  saveLayoutOnExit: boolean;
  rememberLastLayout: boolean;
}
```

### Filter Preferences

Filter preferences control the behavior of the filter system:

- **Default Filters**: Filters to apply by default
- **Show Filter Panel**: Whether to show the filter panel by default
- **Apply Filters Automatically**: Whether to apply filters as soon as they change

```typescript
export interface FilterPreferences {
  defaultFilters: Record<string, any>;
  showFilterPanel: boolean;
  applyFiltersAutomatically: boolean;
}
```

## 🔧 Using the Preferences System

### Basic Setup

To use the preferences system, wrap your application with the PreferencesProvider and ThemeProvider:

```typescript
import { PreferencesProvider } from './context/PreferencesContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <PreferencesProvider>
      <ThemeProvider>
        <YourApp />
      </ThemeProvider>
    </PreferencesProvider>
  );
}
```

### Accessing Preferences in Components

Use the `usePreferences` hook to access and update preferences:

```typescript
import { usePreferences } from '../hooks/usePreferences';

function YourComponent() {
  const { preferences, updatePreference } = usePreferences();
  
  // Access preferences
  const darkMode = preferences.theme.colorMode === 'dark';
  
  // Update a preference
  const toggleDarkMode = () => {
    updatePreference('theme', 'colorMode', darkMode ? 'light' : 'dark');
  };
  
  return (
    <button onClick={toggleDarkMode}>
      Toggle Dark Mode
    </button>
  );
}
```

### Adding the Preferences Button

To allow users to access the preferences panel, add the PreferencesButton component:

```typescript
import { PreferencesButton } from './components/preferences/PreferencesButton';

function YourApp() {
  return (
    <div className="app">
      {/* Your app content */}
      <PreferencesButton />
    </div>
  );
}
```

## 🔄 Extending the Preferences System

### Adding New Preference Categories

1. Update the `UserPreferences` interface in `PreferencesContext.tsx`:

```typescript
export interface UserPreferences {
  theme: ThemePreferences;
  panel: PanelPreferences;
  layout: LayoutPreferences;
  filter: FilterPreferences;
  // Add your new category:
  newCategory: NewCategoryPreferences;
}
```

2. Add default values for your new category:

```typescript
export const DEFAULT_PREFERENCES: UserPreferences = {
  // Existing defaults...
  newCategory: {
    setting1: 'default',
    setting2: true
  }
};
```

3. Create a new settings component:

```typescript
import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';

export const NewCategorySettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { setting1, setting2 } = preferences.newCategory;
  
  // Component implementation...
};
```

4. Add the new component to the PreferencesPanel tabs:

```typescript
// In PreferencesPanel.tsx
case 'newCategory':
  return <NewCategorySettings />;
```

### Adding Theme Variables

To add new theme variables:

1. Update the `theme.css` file:

```css
:root {
  /* Existing variables */
  --new-variable: #value;
}

.dark-mode {
  /* Existing variables */
  --new-variable: #dark-value;
}
```

2. Update the ThemeContext to apply the new variable:

```typescript
// In ThemeContext.tsx
useEffect(() => {
  const root = document.documentElement;
  
  // Existing theme applications...
  
  // Apply new variable
  root.style.setProperty('--new-variable', preferences.theme.newVariable);
}, [preferences.theme]);
```

## 🖼️ Screenshots

![Preferences Panel - Theme Tab](../../assets/images/preferences-theme.png)

*The Theme settings tab allows users to customize the color mode, map style, accent color, and font size.*

![Preferences Panel - Layout Tab](../../assets/images/preferences-layout.png)

*The Layout settings tab lets users select their default layout and configure layout behavior.*

![Preferences Button](../../assets/images/preferences-button.png)

*The floating Preferences button provides quick access to settings from anywhere in the application.*

## 🔗 Integration Points

The preferences system integrates with several other components:

- **MultiFrameContainer** (Chunk 1): Controls default layout and panel configuration
- **Panel System** (Chunks 2 & 5): Configures panel behavior, headers, resizing, and dragging
- **Layout System** (Chunk 4): Enhances layout persistence and default layouts
- **Filter System** (Chunk 3): Configures filter behavior and defaults

### Example of Integration with MultiFrameContainer

```typescript
function EnhancedMultiFrameContainer() {
  const { preferences } = usePreferences();
  const { defaultLayout } = preferences.layout;
  const { defaultContentTypes } = preferences.panel;
  
  return (
    <MultiFrameContainer
      initialLayout={defaultLayout}
      defaultPanelContent={defaultContentTypes}
    />
  );
}
```

## 👥 Persona-Based Layout Presets

The preferences system includes default layouts tailored to different user personas:

| Persona | Default Layout | Description |
|---------|---------------|-------------|
| General User | Single Panel View | Simple view with full map for basic navigation |
| Property Scout | Map & Property View | Dual-panel layout focusing on property browsing with map integration |
| Market Analyst | Analysis View | Three-panel layout with charts, stats, and filtering tools |
| Administrator | Complete Analysis View | Quad-panel layout with all data views for comprehensive analysis |

These presets can be found in the `defaultLayouts.ts` configuration file.

## 📋 Implementation Status

- [x] Preferences context implementation complete
- [x] Preferences service implementation complete
- [x] Theme provider implementation complete
- [x] Preferences components implementation complete
- [x] Default layouts configuration complete
- [x] Theme CSS variables implementation complete
- [x] Tests passing
- [x] Documentation updated
- [ ] Pull request created

## 🤝 Contributing

When modifying the preferences system, please:

1. Update the documentation if adding new preference categories
2. Add appropriate tests for new functionality
3. Ensure backward compatibility with existing preferences
4. Follow the established pattern for preference structure
5. Update the theme variables if adding new themeable elements 
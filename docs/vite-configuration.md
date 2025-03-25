# Vite Configuration Guide

## Introduction to Vite

This project uses Vite instead of Create React App (CRA) for the frontend build system. Vite (French for "quick", pronounced `/vit/`) is a modern, next-generation build tool that provides a significantly improved developer experience and better production builds.

## Advantages Over Create React App (CRA)

### 1. Faster Development Experience

- **Native ES Module Usage**: Vite leverages native ES modules in the browser, eliminating the need for bundling during development
- **Instant Server Start**: No bundling means the dev server starts almost instantly, regardless of application size
- **Lightning-Fast Hot Module Replacement (HMR)**: Updates are reflected in the browser in milliseconds, not seconds
- **On-Demand Compilation**: Only compiles the files that are actually requested

### 2. Optimized Production Builds

- **Rollup-Based Bundling**: Uses Rollup for highly optimized production builds
- **Automatic Code-Splitting**: Creates smaller, more cache-friendly chunks
- **Better Tree-Shaking**: More effectively removes unused code
- **Efficient Asset Optimization**: Built-in optimizations for CSS, images, and other assets

### 3. TypeScript and JSX Support

- **TypeScript Integration**: First-class TypeScript support with faster type checking
- **JSX Transformation**: Uses esbuild for significantly faster JSX compilation (10-100x faster than traditional tools)
- **CSS Preprocessor Support**: Built-in support for Sass, Less, Stylus, and CSS modules

## Project Configuration

Our Vite configuration is defined in `client/vite.config.ts`. The key settings are:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
```

## Special Considerations for JSX in .js Files

While best practice is to use `.jsx` extension for all React component files, there may be situations where you need to handle JSX syntax in `.js` files. Our configuration includes special handling for this case:

```typescript
optimizeDeps: {
  esbuildOptions: {
    loader: {
      '.js': 'jsx',
    },
  },
},
```

This tells esbuild to treat all `.js` files as if they potentially contain JSX syntax. However, to maintain clarity and better tooling support, we strongly recommend using:
- `.jsx` for React components with JSX
- `.tsx` for TypeScript React components with JSX
- `.js` for plain JavaScript files
- `.ts` for TypeScript files

## Working with Vite

### Common Commands

```bash
# Start development server (fast!)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

Vite provides a streamlined way to work with environment variables:

- `.env` - Loaded in all cases
- `.env.local` - Loaded in all cases, ignored by git
- `.env.development` - Development mode only
- `.env.production` - Production mode only

All environment variables must be prefixed with `VITE_` to be exposed to the client-side code:

```
VITE_API_URL=http://localhost:5000
```

Access them in your code via `import.meta.env`:

```jsx
const apiUrl = import.meta.env.VITE_API_URL;
```

### Project Structure

The recommended project structure for our Vite-based frontend:

```
client/
├── public/              # Static assets, copied to build as-is
├── src/                 # Source code
│   ├── assets/          # Assets that will be processed by Vite
│   ├── components/      # React components
│   │   ├── InventoryDashboard.jsx
│   │   ├── HierarchyTree.jsx
│   │   ├── CollectorConfigurationForm.jsx
│   │   └── CollectionHistory.jsx
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Common Issues and Solutions

### 1. JSX in .js Files

**Problem**: JSX syntax in `.js` files causing compilation errors.

**Solution**: Either rename the files to `.jsx` (recommended) or ensure the Vite configuration includes the JSX loader for `.js` files as shown above.

### 2. TypeScript Paths

**Problem**: TypeScript path aliases not working.

**Solution**: Configure path aliases in both `tsconfig.json` and `vite.config.ts`:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. API Proxy

**Problem**: CORS errors when calling the backend API.

**Solution**: Use Vite's built-in proxy configuration:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

## Migration from Create React App

If you're familiar with Create React App, here are the key differences to be aware of:

1. **HTML Entry Point**: Vite uses `index.html` in the project root as the entry point
2. **Environment Variables**: Use `import.meta.env` instead of `process.env`
3. **Public Assets**: Placed in the `public` directory, but referenced without the `/public` prefix
4. **Build Output**: Produces a more optimized bundle with automatic code-splitting
5. **Development Server**: Significantly faster with instant hot module replacement

## Conclusion

Vite offers a superior development experience and better production builds compared to Create React App. By understanding its configuration and capabilities, you can take full advantage of its speed and flexibility for the Real Estate Platform project.

For more information, refer to the [official Vite documentation](https://vitejs.dev/guide/). 
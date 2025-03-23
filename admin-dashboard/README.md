# Real Estate Platform Admin Dashboard

A modern admin dashboard for managing the Real Estate Platform, built with React, TypeScript, and Material-UI.

## Features

- **Dashboard Overview**: Key metrics and statistics
- **Property Management**: List, add, edit, and delete properties
- **User Management**: Manage users, roles, and permissions
- **Analytics**: Detailed insights and reports
- **Settings**: Platform configuration and customization

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

## Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

Build the application:
```bash
npm run build
```

The build output will be in the `build` directory.

## Project Structure

```
admin-dashboard/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Properties.tsx
│   │   ├── Users.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── theme.ts
├── package.json
└── README.md
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
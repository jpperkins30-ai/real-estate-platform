#!/bin/bash

echo "==================================="
echo "Admin Dashboard Build Script"
echo "==================================="
echo ""

echo "1. Creating build directory if it doesn't exist..."
mkdir -p admin-dashboard/build

echo "2. Creating a minimal index.html file..."
cat > admin-dashboard/build/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real Estate Admin Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: #f5f5f5;
        }
        header {
            background-color: #1976d2;
            color: white;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        main {
            flex: 1;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
        }
        .dashboard-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        h1 {
            margin: 0;
        }
        h2 {
            color: #1976d2;
            margin-top: 0;
        }
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            text-align: center;
        }
        .stat-card h3 {
            margin-top: 0;
            color: #666;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1976d2;
            margin: 0.5rem 0;
        }
        .nav-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
        }
        .nav-item {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            text-align: center;
            text-decoration: none;
            color: #333;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .nav-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .message {
            background-color: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #1976d2;
            margin-bottom: 1.5rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>Real Estate Admin Dashboard</h1>
    </header>
    <main>
        <div class="message">
            <p>This is a simplified placeholder for the admin dashboard. The full React application needs to be built.</p>
        </div>
        
        <div class="dashboard-card">
            <h2>Dashboard Overview</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3>Properties</h3>
                    <div class="stat-number">142</div>
                </div>
                <div class="stat-card">
                    <h3>Active Users</h3>
                    <div class="stat-number">523</div>
                </div>
                <div class="stat-card">
                    <h3>Monthly Revenue</h3>
                    <div class="stat-number">$45.2k</div>
                </div>
                <div class="stat-card">
                    <h3>Growth Rate</h3>
                    <div class="stat-number">+15%</div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card">
            <h2>Quick Navigation</h2>
            <div class="nav-container">
                <a href="#" class="nav-item">Properties</a>
                <a href="#" class="nav-item">Users</a>
                <a href="#" class="nav-item">Analytics</a>
                <a href="#" class="nav-item">Settings</a>
                <a href="#" class="nav-item">Reports</a>
                <a href="#" class="nav-item">Marketing</a>
            </div>
        </div>
    </main>
</body>
</html>
EOL

echo "3. Admin dashboard build completed successfully!"
echo "You can now access the admin dashboard at http://localhost:3000/admin"
echo "Note: This is a simplified placeholder. To build the full React application,"
echo "run 'cd admin-dashboard && npm run build' when possible." 
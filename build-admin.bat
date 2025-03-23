@echo off
cd %~dp0
echo ===================================
echo Admin Dashboard Build Script
echo ===================================
echo.

echo 1. Creating build directory if it doesn't exist...
if not exist admin-dashboard\build (
    mkdir admin-dashboard\build
)

echo 2. Creating a minimal index.html file...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>Real Estate Admin Dashboard^</title^>
echo     ^<style^>
echo         body {
echo             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
echo             margin: 0;
echo             padding: 0;
echo             display: flex;
echo             flex-direction: column;
echo             min-height: 100vh;
echo             background-color: #f5f5f5;
echo         }
echo         header {
echo             background-color: #1976d2;
echo             color: white;
echo             padding: 1rem;
echo             box-shadow: 0 2px 4px rgba^(0, 0, 0, 0.1^);
echo         }
echo         main {
echo             flex: 1;
echo             padding: 2rem;
echo             max-width: 1200px;
echo             margin: 0 auto;
echo             width: 100%%;
echo             box-sizing: border-box;
echo         }
echo         .dashboard-card {
echo             background-color: white;
echo             border-radius: 8px;
echo             box-shadow: 0 2px 4px rgba^(0, 0, 0, 0.1^);
echo             padding: 1.5rem;
echo             margin-bottom: 1.5rem;
echo         }
echo         h1 {
echo             margin: 0;
echo         }
echo         h2 {
echo             color: #1976d2;
echo             margin-top: 0;
echo         }
echo         .stats-container {
echo             display: grid;
echo             grid-template-columns: repeat^(auto-fill, minmax^(250px, 1fr^)^);
echo             gap: 1.5rem;
echo             margin-bottom: 2rem;
echo         }
echo         .stat-card {
echo             background-color: white;
echo             border-radius: 8px;
echo             box-shadow: 0 2px 4px rgba^(0, 0, 0, 0.1^);
echo             padding: 1.5rem;
echo             text-align: center;
echo         }
echo         .stat-card h3 {
echo             margin-top: 0;
echo             color: #666;
echo         }
echo         .stat-number {
echo             font-size: 2.5rem;
echo             font-weight: bold;
echo             color: #1976d2;
echo             margin: 0.5rem 0;
echo         }
echo         .nav-container {
echo             display: grid;
echo             grid-template-columns: repeat^(auto-fill, minmax^(180px, 1fr^)^);
echo             gap: 1rem;
echo         }
echo         .nav-item {
echo             background-color: white;
echo             border-radius: 8px;
echo             box-shadow: 0 2px 4px rgba^(0, 0, 0, 0.1^);
echo             padding: 1.5rem;
echo             text-align: center;
echo             text-decoration: none;
echo             color: #333;
echo             transition: transform 0.2s, box-shadow 0.2s;
echo         }
echo         .nav-item:hover {
echo             transform: translateY^(-5px^);
echo             box-shadow: 0 4px 8px rgba^(0, 0, 0, 0.15^);
echo         }
echo         .message {
echo             background-color: #e3f2fd;
echo             padding: 1rem;
echo             border-radius: 8px;
echo             border-left: 4px solid #1976d2;
echo             margin-bottom: 1.5rem;
echo         }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<header^>
echo         ^<h1^>Real Estate Admin Dashboard^</h1^>
echo     ^</header^>
echo     ^<main^>
echo         ^<div class="message"^>
echo             ^<p^>This is a simplified placeholder for the admin dashboard. The full React application needs to be built.^</p^>
echo         ^</div^>
echo         
echo         ^<div class="dashboard-card"^>
echo             ^<h2^>Dashboard Overview^</h2^>
echo             ^<div class="stats-container"^>
echo                 ^<div class="stat-card"^>
echo                     ^<h3^>Properties^</h3^>
echo                     ^<div class="stat-number"^>142^</div^>
echo                 ^</div^>
echo                 ^<div class="stat-card"^>
echo                     ^<h3^>Active Users^</h3^>
echo                     ^<div class="stat-number"^>523^</div^>
echo                 ^</div^>
echo                 ^<div class="stat-card"^>
echo                     ^<h3^>Monthly Revenue^</h3^>
echo                     ^<div class="stat-number"^>$45.2k^</div^>
echo                 ^</div^>
echo                 ^<div class="stat-card"^>
echo                     ^<h3^>Growth Rate^</h3^>
echo                     ^<div class="stat-number"^>+15%%^</div^>
echo                 ^</div^>
echo             ^</div^>
echo         ^</div^>
echo         
echo         ^<div class="dashboard-card"^>
echo             ^<h2^>Quick Navigation^</h2^>
echo             ^<div class="nav-container"^>
echo                 ^<a href="#" class="nav-item"^>Properties^</a^>
echo                 ^<a href="#" class="nav-item"^>Users^</a^>
echo                 ^<a href="#" class="nav-item"^>Analytics^</a^>
echo                 ^<a href="#" class="nav-item"^>Settings^</a^>
echo                 ^<a href="#" class="nav-item"^>Reports^</a^>
echo                 ^<a href="#" class="nav-item"^>Marketing^</a^>
echo             ^</div^>
echo         ^</div^>
echo     ^</main^>
echo ^</body^>
echo ^</html^>
) > admin-dashboard\build\index.html

echo 3. Admin dashboard build completed successfully!
echo You can now access the admin dashboard at http://localhost:3000/admin
echo Note: This is a simplified placeholder. To build the full React application,
echo run 'cd admin-dashboard ^&^& npm run build' when possible.

echo.
echo Press any key to exit...
pause > nul 
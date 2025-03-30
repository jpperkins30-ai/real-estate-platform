# Branch consolidation script
# Step 1: Ensure we're on develop
git checkout develop

# Step 2: Create consolidated branches
git checkout -b feature/inventory-consolidated
git merge --no-ff feature/inventory-module -m "feat: Begin inventory module consolidation"
git merge --no-ff feature/inventory-module-enhancement -m "feat: Add inventory enhancements"
git merge --no-ff feature/inventory-module-frontend -m "feat: Add inventory frontend"
git merge --no-ff feature/inventory-module-hierarchy -m "feat: Add inventory hierarchy"
git merge --no-ff feature/inventory-module-map-integration -m "feat: Add inventory map integration"

# Step 3: Create map consolidated branch
git checkout develop
git checkout -b feature/map-consolidated
git merge --no-ff feature/interactive-map -m "feat: Consolidate map features"

# Step 4: Create export consolidated branch
git checkout develop
git checkout -b feature/export-consolidated
git merge --no-ff feature/export-api -m "feat: Consolidate export features"
git merge --no-ff feature/inventory-export-services -m "feat: Add export services"

# Step 5: Clean up old branches
git checkout develop
git branch -d feature/inventory-module
git branch -d feature/inventory-module-enhancement
git branch -d feature/inventory-module-frontend
git branch -d feature/inventory-module-hierarchy
git branch -d feature/inventory-module-map-integration
git branch -d feature/interactive-map
git branch -d feature/export-api
git branch -d feature/inventory-export-services 
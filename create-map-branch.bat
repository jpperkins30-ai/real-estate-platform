@echo off
:: Script to create a Git branch for the interactive map component and commit changes

echo Creating and switching to branch 'feature/interactive-map'...
git checkout -b feature/interactive-map

echo Adding map component files...
git add client/src/components/maps/MapComponent.tsx
git add client/src/components/maps/MapComponent.css
git add client/src/components/maps/leaflet-types.ts
git add client/src/components/maps/index.ts
git add client/src/components/maps/README.md
git add client/src/components/maps/DOCUMENTATION.md
git add client/src/components/maps/UPGRADE.md
git add client/src/components/maps/backup-info.txt

:: Also add the updated detail components that use the map
git add client/src/components/inventory/details/StateDetails.tsx
git add client/src/components/inventory/details/CountyDetails.tsx
git add client/src/components/inventory/details/PropertyDetails.tsx

echo Creating commit...
git commit -m "Implement interactive map component with enhanced visualizations" -m "- Added vibrant color themes with semantic meaning (orange, yellow, blue, red, gray)" -m "- Implemented glow/pulse animations for active items" -m "- Added rich interactive popups with action buttons" -m "- Created zoom/focus animations when selecting locations" -m "- Added overlay metrics dashboard and stats panel" -m "- Implemented timeline slider for historical data view" -m "- Added legend panel and filter chips" -m "- Added dark/light mode toggle" -m "- Enhanced tooltips and markers" -m "- Added comprehensive documentation and upgrade guide"

echo Successfully created branch and committed changes!
echo You can now push the branch to remote with:
echo   git push -u origin feature/interactive-map 
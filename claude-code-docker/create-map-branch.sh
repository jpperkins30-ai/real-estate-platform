#!/bin/bash
# Script to create a Git branch for the interactive map component and commit changes

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating and switching to branch 'feature/interactive-map'...${NC}"
git checkout -b feature/interactive-map

echo -e "${BLUE}Adding map component files...${NC}"
git add client/src/components/maps/MapComponent.tsx
git add client/src/components/maps/MapComponent.css
git add client/src/components/maps/leaflet-types.ts
git add client/src/components/maps/index.ts
git add client/src/components/maps/README.md
git add client/src/components/maps/DOCUMENTATION.md
git add client/src/components/maps/UPGRADE.md
git add client/src/components/maps/backup-info.txt

# Also add the updated detail components that use the map
git add client/src/components/inventory/details/StateDetails.tsx
git add client/src/components/inventory/details/CountyDetails.tsx
git add client/src/components/inventory/details/PropertyDetails.tsx

echo -e "${BLUE}Creating commit...${NC}"
git commit -m "Implement interactive map component with enhanced visualizations

- Added vibrant color themes with semantic meaning (orange, yellow, blue, red, gray)
- Implemented glow/pulse animations for active items
- Added rich interactive popups with action buttons
- Created zoom/focus animations when selecting locations
- Added overlay metrics dashboard and stats panel
- Implemented timeline slider for historical data view
- Added legend panel and filter chips
- Added dark/light mode toggle
- Enhanced tooltips and markers
- Added comprehensive documentation and upgrade guide"

echo -e "${GREEN}Successfully created branch and committed changes!${NC}"
echo -e "${BLUE}You can now push the branch to remote with:${NC}"
echo -e "  git push -u origin feature/interactive-map"
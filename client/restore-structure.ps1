# restore-structure.ps1
# Script to restore the test directory structure

Write-Host "Restoring test directory structure..." -ForegroundColor Cyan

# Create needed directories
$directories = @(
    "src\__tests__\components",
    "src\__tests__\components\controllers",
    "src\__tests__\components\inventory",
    "src\__tests__\components\multiframe",
    "src\__tests__\components\multiframe\controllers",
    "src\__tests__\components\multiframe\controls",
    "src\__tests__\components\multiframe\filters",
    "src\__tests__\components\multiframe\layouts",
    "src\__tests__\components\multiframe\panels",
    "src\__tests__\context",
    "src\__tests__\hooks",
    "src\__tests__\integration",
    "src\__tests__\services"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Map of flattened files to their original locations
$fileMap = @{
    "components_DraggablePanel.test.tsx" = "src\__tests__\components\DraggablePanel.test.tsx";
    "components_EnhancedMultiFrameContainer.test.tsx" = "src\__tests__\components\EnhancedMultiFrameContainer.test.tsx";
    "components_MultiFrameContainer.test.tsx" = "src\__tests__\components\MultiFrameContainer.test.tsx";
    "components_PanelHeader.test.tsx" = "src\__tests__\components\PanelHeader.test.tsx";
    "components_controllers_ControllerWizardLauncher.test.tsx" = "src\__tests__\components\controllers\ControllerWizardLauncher.test.tsx";
    "components_inventory_PropertySearchBox.test.tsx" = "src\__tests__\components\inventory\PropertySearchBox.test.tsx";
    "components_multiframe_EnhancedPanelContainer.test.tsx" = "src\__tests__\components\multiframe\EnhancedPanelContainer.test.tsx";
    "components_multiframe_PanelHeader.test.tsx" = "src\__tests__\components\multiframe\PanelHeader.test.tsx";
    "components_multiframe_controllers_ControllerWizardLauncher.test.tsx" = "src\__tests__\components\multiframe\controllers\ControllerWizardLauncher.test.tsx";
    "components_multiframe_controls_LayoutSelector.test.tsx" = "src\__tests__\components\multiframe\controls\LayoutSelector.test.tsx";
    "components_multiframe_filters_FilterPanel.test.tsx" = "src\__tests__\components\multiframe\filters\FilterPanel.test.tsx";
    "components_multiframe_layouts_AdvancedLayout.test.tsx" = "src\__tests__\components\multiframe\layouts\AdvancedLayout.test.tsx";
    "components_multiframe_layouts_DualPanelLayout.test.tsx" = "src\__tests__\components\multiframe\layouts\DualPanelLayout.test.tsx";
    "components_multiframe_layouts_QuadPanelLayout.test.tsx" = "src\__tests__\components\multiframe\layouts\QuadPanelLayout.test.tsx";
    "components_multiframe_layouts_SinglePanelLayout.test.tsx" = "src\__tests__\components\multiframe\layouts\SinglePanelLayout.test.tsx";
    "components_multiframe_layouts_TriPanelLayout.test.tsx" = "src\__tests__\components\multiframe\layouts\TriPanelLayout.test.tsx";
    "components_multiframe_panels_CountyPanel.test.tsx" = "src\__tests__\components\multiframe\panels\CountyPanel.test.tsx";
    "context_FilterContext.test.tsx" = "src\__tests__\context\FilterContext.test.tsx";
    "context_PanelSyncContext.test.tsx" = "src\__tests__\context\PanelSyncContext.test.tsx";
    "hooks_useAdvancedLayout.test.tsx" = "src\__tests__\hooks\useAdvancedLayout.test.tsx";
    "hooks_useDraggable.test.tsx" = "src\__tests__\hooks\useDraggable.test.tsx";
    "hooks_useFilter.test.tsx" = "src\__tests__\hooks\useFilter.test.tsx";
    "hooks_useMaximizable.test.tsx" = "src\__tests__\hooks\useMaximizable.test.tsx";
    "hooks_usePanelState.test.tsx" = "src\__tests__\hooks\usePanelState.test.tsx";
    "hooks_useResizable.test.tsx" = "src\__tests__\hooks\useResizable.test.tsx";
    "integration_ControllerWizardLauncher.test.tsx" = "src\__tests__\integration\ControllerWizardLauncher.test.tsx";
    "integration_FilterSystemIntegration.test.tsx" = "src\__tests__\integration\FilterSystemIntegration.test.tsx";
    "integration_PanelCommunication.test.tsx" = "src\__tests__\integration\PanelCommunication.test.tsx";
    "integration_PanelIntegration.test.tsx" = "src\__tests__\integration\PanelIntegration.test.tsx";
    "services_filterService.test.ts" = "src\__tests__\services\filterService.test.ts";
    "services_panelContentRegistry.test.tsx" = "src\__tests__\services\panelContentRegistry.test.tsx";
    "services_panelStateService.test.ts" = "src\__tests__\services\panelStateService.test.ts";
    "services_propertySearch.test.ts" = "src\__tests__\services\propertySearch.test.ts";
}

$restored = 0

foreach ($file in $fileMap.Keys) {
    $sourcePath = Join-Path "src\__tests__" $file
    $destPath = $fileMap[$file]
    
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Restored file: $file -> $destPath" -ForegroundColor Green
        $restored++
    } else {
        Write-Host "Warning: Could not find $sourcePath" -ForegroundColor Yellow
    }
}

Write-Host "`nRestoration complete. Restored $restored files." -ForegroundColor Cyan
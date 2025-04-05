/**
 * @swagger
 * components:
 *   schemas:
 *     ThemePreferences:
 *       type: object
 *       properties:
 *         colorMode:
 *           type: string
 *           enum: [light, dark, system]
 *           description: Color theme mode
 *         mapStyle:
 *           type: string
 *           enum: [standard, satellite, terrain]
 *           description: Map visualization style
 *         accentColor:
 *           type: string
 *           description: Accent color in hex format
 *         fontSize:
 *           type: string
 *           enum: [small, medium, large]
 *           description: Base font size
 *       required:
 *         - colorMode
 *         - mapStyle
 *       example:
 *         colorMode: system
 *         mapStyle: standard
 *         accentColor: "#2196f3"
 *         fontSize: medium
 *     
 *     PanelPreferences:
 *       type: object
 *       properties:
 *         defaultContentTypes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Default content types for panel positions
 *         showPanelHeader:
 *           type: boolean
 *           description: Whether to show panel headers
 *         enablePanelResizing:
 *           type: boolean
 *           description: Whether panel resizing is enabled
 *         enablePanelDragging:
 *           type: boolean
 *           description: Whether panel dragging is enabled
 *       example:
 *         defaultContentTypes:
 *           top-left: map
 *           top-right: state
 *           bottom-left: county
 *           bottom-right: property
 *         showPanelHeader: true
 *         enablePanelResizing: true
 *         enablePanelDragging: true
 *     
 *     LayoutPreferences:
 *       type: object
 *       properties:
 *         defaultLayout:
 *           type: string
 *           description: ID of the default layout
 *         saveLayoutOnExit:
 *           type: boolean
 *           description: Whether to save layout on exit
 *         rememberLastLayout:
 *           type: boolean
 *           description: Whether to use the last layout on start
 *       example:
 *         defaultLayout: default-quad
 *         saveLayoutOnExit: true
 *         rememberLastLayout: true
 *     
 *     FilterPreferences:
 *       type: object
 *       properties:
 *         defaultFilters:
 *           type: object
 *           description: Default filter values
 *         showFilterPanel:
 *           type: boolean
 *           description: Whether to show filter panel by default
 *         applyFiltersAutomatically:
 *           type: boolean
 *           description: Whether to apply filters automatically
 *       example:
 *         defaultFilters: {}
 *         showFilterPanel: true
 *         applyFiltersAutomatically: true
 *     
 *     UserPreferences:
 *       type: object
 *       required:
 *         - theme
 *         - panel
 *         - layout
 *         - filter
 *       properties:
 *         theme:
 *           $ref: '#/components/schemas/ThemePreferences'
 *         panel:
 *           $ref: '#/components/schemas/PanelPreferences'
 *         layout:
 *           $ref: '#/components/schemas/LayoutPreferences'
 *         filter:
 *           $ref: '#/components/schemas/FilterPreferences'
 */ 
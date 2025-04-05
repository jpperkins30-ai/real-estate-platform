/**
 * @swagger
 * components:
 *   schemas:
 *     PanelPosition:
 *       type: object
 *       properties:
 *         row:
 *           type: integer
 *           description: Row position in the layout grid
 *         col:
 *           type: integer
 *           description: Column position in the layout grid
 *       required:
 *         - row
 *         - col
 *       example:
 *         row: 0
 *         col: 1
 *     
 *     PanelSize:
 *       type: object
 *       properties:
 *         width:
 *           type: number
 *           description: Width as a percentage of the container width
 *         height:
 *           type: number
 *           description: Height as a percentage of the container height
 *       required:
 *         - width
 *         - height
 *       example:
 *         width: 50
 *         height: 50
 *     
 *     PanelConfig:
 *       type: object
 *       required:
 *         - id
 *         - contentType
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the panel
 *         contentType:
 *           type: string
 *           enum: [map, property, filter, stats, chart, list, state, county]
 *           description: Type of content displayed in the panel
 *         title:
 *           type: string
 *           description: Panel title displayed in the header
 *         position:
 *           $ref: '#/components/schemas/PanelPosition'
 *         size:
 *           $ref: '#/components/schemas/PanelSize'
 *         state:
 *           type: object
 *           description: Current state of the panel content
 *         visible:
 *           type: boolean
 *           default: true
 *           description: Whether the panel is visible
 *       example:
 *         id: map-panel
 *         contentType: map
 *         title: US Map
 *         position:
 *           row: 0
 *           col: 0
 *         size:
 *           width: 50
 *           height: 50
 *     
 *     LayoutConfig:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - panels
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the layout
 *         name:
 *           type: string
 *           description: Name of the layout
 *         description:
 *           type: string
 *           description: Description of the layout
 *         type:
 *           type: string
 *           enum: [single, dual, tri, quad]
 *           description: Layout type
 *         panels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PanelConfig'
 *           description: Panels in the layout
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default layout
 *         isPublic:
 *           type: boolean
 *           default: false
 *           description: Whether this layout is public
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */ 
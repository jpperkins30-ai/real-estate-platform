/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationParams:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Page number (starting from 1)
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         sort:
 *           type: string
 *           description: Field to sort by (prefix with - for descending order)
 *           example: "-createdAt"
 *         search:
 *           type: string
 *           description: Search term for filtering results
 *           example: "commercial property"
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         total:
 *           type: integer
 *           description: Total number of records
 *         page:
 *           type: integer
 *           description: Current page number
 *         pages:
 *           type: integer
 *           description: Total number of pages
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         message:
 *           type: string
 *           description: A message describing the result
 *         data:
 *           type: object
 *           description: Optional data returned from the operation
 */

// No exports needed - this file is only for Swagger JSDoc 
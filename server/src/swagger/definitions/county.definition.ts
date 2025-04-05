/**
 * @swagger
 * components:
 *   schemas:
 *     County:
 *       type: object
 *       required:
 *         - name
 *         - stateId
 *         - fips
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the county
 *         name:
 *           type: string
 *           description: County name
 *         stateId:
 *           type: string
 *           description: Reference to the state
 *         fips:
 *           type: string
 *           description: FIPS code
 *         boundaries:
 *           type: object
 *           description: GeoJSON boundaries
 *         population:
 *           type: number
 *           description: Population count
 *         medianIncome:
 *           type: number
 *           description: Median household income
 *         medianHomeValue:
 *           type: number
 *           description: Median home value
 *         unemploymentRate:
 *           type: number
 *           description: Unemployment rate percentage
 *         propertyCount:
 *           type: number
 *           description: Number of properties in the county
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "5f8b0a7f6e3b1d0017e98b3a"
 *         name: "King County"
 *         stateId: "5f8b0a7f6e3b1d0017e98b39"
 *         fips: "53033"
 *         population: 2252782
 *         medianIncome: 95009
 *         medianHomeValue: 629000
 *         unemploymentRate: 3.8
 *         propertyCount: 875421
 *     
 *     CountyStats:
 *       type: object
 *       properties:
 *         propertyCount:
 *           type: number
 *           description: Total number of properties
 *         avgPrice:
 *           type: number
 *           description: Average property price
 *         medianPrice:
 *           type: number
 *           description: Median property price
 *         priceChange:
 *           type: number
 *           description: Price change percentage (year over year)
 *         salesVolume:
 *           type: number
 *           description: Total sales volume
 *         daysOnMarket:
 *           type: number
 *           description: Average days on market
 *         inventoryCount:
 *           type: number
 *           description: Current inventory count
 *         monthsOfInventory:
 *           type: number
 *           description: Months of inventory
 *       example:
 *         propertyCount: 45321
 *         avgPrice: 485000
 *         medianPrice: 425000
 *         priceChange: 5.2
 *         salesVolume: 532000000
 *         daysOnMarket: 28
 *         inventoryCount: 1245
 *         monthsOfInventory: 2.4
 */ 
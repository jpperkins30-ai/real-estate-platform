import { Router } from 'express';
import { TaxLienService } from '../services/tax-lien.service';

const router = Router();
const taxLienService = new TaxLienService();

/**
 * @swagger
 * /api/tax-liens/check:
 *   post:
 *     summary: Check tax lien status for a property
 *     tags: [Tax Liens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - countyId
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: Property ID
 *               countyId:
 *                 type: string
 *                 description: County ID
 *               accountNumber:
 *                 type: string
 *                 description: Tax account number
 *               parcelId:
 *                 type: string
 *                 description: Parcel ID
 *     responses:
 *       200:
 *         description: Tax lien status check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [clear, lien, unknown, error]
 *                   description: Tax lien status
 *                 message:
 *                   type: string
 *                   description: Human-readable status message
 *                 amount:
 *                   type: number
 *                   description: Lien amount (if status is lien)
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Date lien was filed (if status is lien)
 *                 details:
 *                   type: object
 *                   description: Additional lien details (if available)
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Property or county not found
 *       500:
 *         description: Server error
 */
router.post('/check', async (req, res) => {
  try {
    const { propertyId, countyId, accountNumber, parcelId } = req.body;
    
    if (!propertyId || !countyId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Property ID and County ID are required' 
      });
    }
    
    const result = await taxLienService.checkTaxLienStatus(
      propertyId, 
      countyId, 
      accountNumber, 
      parcelId
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Tax lien check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'An error occurred during tax lien check' 
    });
  }
});

export default router; 
import { State } from '../types/api';

export const MOCK_STATES: State[] = [
  {
    id: '1',
    name: 'California',
    abbreviation: 'CA',
    type: 'state',
    metadata: {
      totalCounties: 2,
      totalProperties: 5,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'New York',
    abbreviation: 'NY',
    type: 'state',
    metadata: {
      totalCounties: 0,
      totalProperties: 0,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]; 
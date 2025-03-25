import InventoryModule from './InventoryModule';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';

export const inventoryRoutes = [
  {
    path: '/inventory',
    element: InventoryModule,
    children: [
      {
        path: 'state/:stateId',
        element: StateDetails,
      },
      {
        path: 'county/:countyId',
        element: CountyDetails,
      },
      {
        path: 'property/:propertyId',
        element: PropertyDetails,
      },
    ],
  },
];

export default inventoryRoutes; 
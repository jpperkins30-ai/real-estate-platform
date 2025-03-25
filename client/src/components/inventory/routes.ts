import React from 'react';
import { RouteObject } from 'react-router-dom';
import InventoryMain from './InventoryMain';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';
import ControllerWizard from './details/ControllerWizard';
import PropertySearchPage from '../../pages/inventory/PropertySearchPage';

export const inventoryRoutes = [
  {
    path: '/inventory',
    element: 'InventoryMain',
    children: [
      {
        path: 'state/:stateId',
        element: 'StateDetails',
      },
      {
        path: 'county/:countyId',
        element: 'CountyDetails',
      },
      {
        path: 'property/:propertyId',
        element: 'PropertyDetails',
      },
    ],
  },
  {
    path: '/inventory/controllers/wizard',
    element: 'ControllerWizard',
  },
  {
    path: '/inventory/search',
    element: 'PropertySearchPage',
  },
];

export default inventoryRoutes; 
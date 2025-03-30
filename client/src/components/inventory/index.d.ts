import { FC } from 'react';
import { RouteObject } from 'react-router-dom';

declare const InventoryModule: FC;
declare const InventoryHeader: FC;
declare const InventorySidebar: FC;
declare const InventoryMain: FC;
declare const InventorySearch: FC;
declare const InventoryTree: FC;
declare const InventoryTreeNode: FC;
declare const StateDetails: FC;
declare const CountyDetails: FC;
declare const PropertyDetails: FC;
declare const PropertySearchBox: FC;
declare const ControllerWizard: FC;
declare const TaxLienStatusCheck: FC;

declare const inventoryRoutes: RouteObject[];

export {
  InventoryModule,
  InventoryHeader,
  InventorySidebar,
  InventoryMain,
  InventorySearch,
  InventoryTree,
  InventoryTreeNode,
  StateDetails,
  CountyDetails,
  PropertyDetails,
  PropertySearchBox,
  ControllerWizard,
  TaxLienStatusCheck,
  inventoryRoutes
};

export default InventoryModule; 
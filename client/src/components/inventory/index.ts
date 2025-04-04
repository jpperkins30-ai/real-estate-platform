import InventoryModule from './InventoryModule';
import InventoryHeader from './InventoryHeader';
import InventorySidebar from './InventorySidebar';
import InventoryMain from './InventoryMain';
import InventorySearch from './InventorySearch';
import InventoryTree from './InventoryTree';
import InventoryTreeNode from './InventoryTreeNode';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';
import PropertySearchBox from './PropertySearchBox';
import inventoryRoutes from './routes';

// Main components
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
  inventoryRoutes
};

// Export the default module for easier importing
export default InventoryModule;

export { default as ControllerWizard } from './details/ControllerWizard';
export { default as TaxLienStatusCheck } from './TaxLienStatusCheck'; 
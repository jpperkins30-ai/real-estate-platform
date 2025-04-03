import { FC } from 'react';

declare module '*.jsx' {
  const Component: FC;
  export default Component;
}

declare module './CollectionHistory' {
  const CollectionHistory: FC;
  export default CollectionHistory;
}

declare module './CollectorConfigurationForm' {
  const CollectorConfigurationForm: FC;
  export default CollectorConfigurationForm;
}

declare module './HierarchyTree' {
  const HierarchyTree: FC;
  export default HierarchyTree;
}

declare module './InventoryDashboard' {
  const InventoryDashboard: FC;
  export default InventoryDashboard;
} 
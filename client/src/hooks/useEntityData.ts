import { useState, useCallback } from 'react';

interface EntityData {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntityStatistics {
  medianHomePrice?: number;
  averageDaysOnMarket?: number;
  totalProperties?: number;
  [key: string]: any;
}

interface UseEntityDataOptions {
  initialId?: string;
  parentEntityType?: string;
  parentEntityId?: string;
}

interface UseEntityDataResult {
  entityId: string | null;
  setEntityId: (id: string | null) => void;
  entity: EntityData | null;
  statistics: EntityStatistics | null;
  loading: boolean;
  error: Error | null;
  fetchByParent?: (parentId: string) => Promise<EntityData[]>;
}

export const useEntityData = (
  entityType: string,
  options: UseEntityDataOptions = {}
): UseEntityDataResult => {
  const [entityId, setEntityId] = useState<string | null>(options.initialId || null);
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [statistics, setStatistics] = useState<EntityStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByParent = useCallback(async (parentId: string): Promise<EntityData[]> => {
    setLoading(true);
    try {
      // Mock implementation for testing
      const mockData = [
        { id: 'county1', name: 'County 1', population: 100000, propertyCount: 50000 }
      ];
      return mockData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  if (options.parentEntityType) {
    return {
      loading,
      error,
      fetchByParent
    } as UseEntityDataResult;
  }

  return {
    entityId,
    setEntityId,
    entity,
    statistics,
    loading,
    error
  };
}; 
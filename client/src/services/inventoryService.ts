import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { 
  State, 
  County, 
  Property, 
  PropertyFilters, 
  PaginatedResponse, 
  ControllerReference,
  Controller,
  ControllableObjectType,
  ControllerType
} from '../types/inventory';
import { API_BASE_URL, API_CONFIG } from '../config/api';

// API client setup
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG
});

// Query hooks for Inventory Module
export const useStates = () => {
  return useQuery<State[]>('states', async () => {
    const { data } = await apiClient.get('/states');
    return data;
  });
};

export const useState = (stateId: string | undefined) => {
  return useQuery<State>(['state', stateId], async () => {
    const { data } = await apiClient.get(`/states/${stateId}`);
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useStateWithControllers = (stateId: string | undefined) => {
  return useQuery<State>(['state', stateId, 'controllers'], async () => {
    const { data } = await apiClient.get(`/states/${stateId}`, {
      params: { populate: 'controllers' }
    });
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useCounties = (stateId: string | undefined) => {
  return useQuery<County[]>(['counties', stateId], async () => {
    const { data } = await apiClient.get(`/states/${stateId}/counties`);
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useCountiesWithControllers = (stateId: string | undefined) => {
  return useQuery<County[]>(['counties', stateId, 'controllers'], async () => {
    const { data } = await apiClient.get(`/states/${stateId}/counties`, {
      params: { populate: 'controllers' }
    });
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useCounty = (countyId: string | undefined) => {
  return useQuery<County>(['county', countyId], async () => {
    const { data } = await apiClient.get(`/counties/${countyId}`);
    return data;
  }, {
    enabled: !!countyId
  });
};

export const useCountyWithControllers = (countyId: string | undefined) => {
  return useQuery<County>(['county', countyId, 'controllers'], async () => {
    const { data } = await apiClient.get(`/counties/${countyId}`, {
      params: { populate: 'controllers' }
    });
    return data;
  }, {
    enabled: !!countyId
  });
};

export const useProperties = (
  countyId: string | undefined, 
  filters: PropertyFilters = {}, 
  page: number = 1, 
  limit: number = 20
) => {
  return useQuery<PaginatedResponse<Property>>(['properties', countyId, filters, page, limit], async () => {
    const { data } = await apiClient.get(`/counties/${countyId}/properties`, {
      params: {
        ...filters,
        page,
        limit
      }
    });
    return data;
  }, {
    enabled: !!countyId,
    keepPreviousData: true
  });
};

export const useProperty = (propertyId: string | undefined) => {
  return useQuery<Property>(['property', propertyId], async () => {
    const { data } = await apiClient.get(`/properties/${propertyId}`);
    return data;
  }, {
    enabled: !!propertyId
  });
};

export const usePropertyWithControllers = (propertyId: string | undefined) => {
  return useQuery<Property>(['property', propertyId, 'controllers'], async () => {
    const { data } = await apiClient.get(`/properties/${propertyId}`, {
      params: { populate: 'controllers' }
    });
    return data;
  }, {
    enabled: !!propertyId
  });
};

export const useControllers = () => {
  return useQuery<Controller[]>('controllers', async () => {
    const { data } = await apiClient.get('/controllers');
    return data;
  });
};

export const useController = (controllerId: string | undefined) => {
  return useQuery<Controller>(['controller', controllerId], async () => {
    const { data } = await apiClient.get(`/controllers/${controllerId}`);
    return data;
  }, {
    enabled: !!controllerId
  });
};

// Mutation hooks for creating, updating, and deleting inventory items
export const useCreateState = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (stateData: Omit<State, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post('/states', stateData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('states');
      }
    }
  );
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ stateId, stateData }: { stateId: string, stateData: Partial<State> }) => {
      const { data } = await apiClient.put(`/states/${stateId}`, stateData);
      return data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['state', variables.stateId]);
        queryClient.invalidateQueries('states');
      }
    }
  );
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (stateId: string) => {
      const { data } = await apiClient.delete(`/states/${stateId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('states');
      }
    }
  );
};

export const useCreateCounty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (countyData: Omit<County, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post('/counties', countyData);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['counties', data.stateId]);
        queryClient.invalidateQueries(['state', data.stateId]);
      }
    }
  );
};

export const useUpdateCounty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ countyId, countyData }: { countyId: string, countyData: Partial<County> }) => {
      const { data } = await apiClient.put(`/counties/${countyId}`, countyData);
      return data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['county', variables.countyId]);
        queryClient.invalidateQueries(['counties', data.stateId]);
      }
    }
  );
};

export const useDeleteCounty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (countyId: string) => {
      const { data } = await apiClient.delete(`/counties/${countyId}`);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['counties', data.stateId]);
        queryClient.invalidateQueries(['state', data.stateId]);
      }
    }
  );
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post('/properties', propertyData);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['properties', data.countyId]);
        queryClient.invalidateQueries(['county', data.countyId]);
      }
    }
  );
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ propertyId, propertyData }: { propertyId: string, propertyData: Partial<Property> }) => {
      const { data } = await apiClient.put(`/properties/${propertyId}`, propertyData);
      return data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['property', variables.propertyId]);
        queryClient.invalidateQueries(['properties', data.countyId]);
      }
    }
  );
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (propertyId: string) => {
      const { data } = await apiClient.delete(`/properties/${propertyId}`);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['properties', data.countyId]);
        queryClient.invalidateQueries(['county', data.countyId]);
      }
    }
  );
};

export const useAttachController = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ 
      objectType, 
      objectId, 
      controllerId, 
      controllerType,
      configuration = {} 
    }: { 
      objectType: ControllableObjectType; 
      objectId: string; 
      controllerId: string;
      controllerType: ControllerType;
      configuration?: Record<string, any>;
    }) => {
      const { data } = await apiClient.post(`/controllers/${controllerId}/attach`, {
        objectType,
        objectId,
        controllerType,
        configuration
      });
      return data;
    },
    {
      onSuccess: (data, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['controller', variables.controllerId]);
        
        // Invalidate the object the controller is attached to
        if (variables.objectType === 'property') {
          queryClient.invalidateQueries(['property', variables.objectId]);
          queryClient.invalidateQueries(['property', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'county') {
          queryClient.invalidateQueries(['county', variables.objectId]);
          queryClient.invalidateQueries(['county', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'state') {
          queryClient.invalidateQueries(['state', variables.objectId]);
          queryClient.invalidateQueries(['state', variables.objectId, 'controllers']);
        }
      }
    }
  );
};

export const useDetachController = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ 
      objectType, 
      objectId, 
      controllerId 
    }: { 
      objectType: ControllableObjectType; 
      objectId: string; 
      controllerId: string;
    }) => {
      const { data } = await apiClient.post(`/controllers/${controllerId}/detach`, {
        objectType,
        objectId
      });
      return data;
    },
    {
      onSuccess: (data, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['controller', variables.controllerId]);
        
        // Invalidate the object the controller is detached from
        if (variables.objectType === 'property') {
          queryClient.invalidateQueries(['property', variables.objectId]);
          queryClient.invalidateQueries(['property', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'county') {
          queryClient.invalidateQueries(['county', variables.objectId]);
          queryClient.invalidateQueries(['county', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'state') {
          queryClient.invalidateQueries(['state', variables.objectId]);
          queryClient.invalidateQueries(['state', variables.objectId, 'controllers']);
        }
      }
    }
  );
};

export const useRunController = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ 
      objectType, 
      objectId, 
      controllerId 
    }: { 
      objectType: ControllableObjectType; 
      objectId: string; 
      controllerId: string;
    }) => {
      const { data } = await apiClient.post(`/controllers/${controllerId}/run`, {
        objectType,
        objectId
      });
      return data;
    },
    {
      onSuccess: (data, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['controller', variables.controllerId]);
        
        // Invalidate the object the controller is run against
        if (variables.objectType === 'property') {
          queryClient.invalidateQueries(['property', variables.objectId]);
          queryClient.invalidateQueries(['property', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'county') {
          queryClient.invalidateQueries(['county', variables.objectId]);
          queryClient.invalidateQueries(['county', variables.objectId, 'controllers']);
        } else if (variables.objectType === 'state') {
          queryClient.invalidateQueries(['state', variables.objectId]);
          queryClient.invalidateQueries(['state', variables.objectId, 'controllers']);
        }
      }
    }
  );
}; 
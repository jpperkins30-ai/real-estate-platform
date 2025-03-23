import api from './api';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: 'active' | 'pending' | 'sold';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: Property['status'];
}

export interface PropertyFilters {
  search?: string;
  type?: string;
  status?: Property['status'];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}

export const propertyService = {
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyResponse> {
    const response = await api.get<PropertyResponse>('/properties', { params: filters });
    return response.data;
  },

  async getProperty(id: string): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await api.put<Property>(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async uploadPropertyImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ url: string }>('/properties/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },
}; 
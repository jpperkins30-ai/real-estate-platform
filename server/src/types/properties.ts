import { Request } from 'express';
import { PropertyDocument } from './models';

export interface PropertyRequestBody {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    yearBuilt?: number;
    lotSize?: number;
    propertyType: string;
    parking?: {
      hasParking: boolean;
      parkingType?: string;
      parkingSpaces?: number;
    };
    amenities?: string[];
  };
  status: 'available' | 'pending' | 'sold';
  images?: string[];
  virtualTour?: string;
  floorPlans?: {
    name: string;
    image: string;
    description?: string;
  }[];
  listingAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertyQueryParams {
  page?: string;
  limit?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PropertyIdParam {
  id: string;
}

export type PropertyRequest = Request<PropertyIdParam, {}, PropertyRequestBody, PropertyQueryParams>; 
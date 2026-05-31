import {apiRequest, ApiResponse} from './api';

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string | null;
  type: string | null;
  transmission: 'automatic' | 'manual';
  fuel_type: string | null;
  seats: number;
  price_per_day: number;
  rating: number;
  image_url: string | null;
  location: string | null;
  description: string | null;
  available: boolean;
  created_at: string;
}

export interface CarListResponse extends ApiResponse {
  count: number;
  data: Car[];
}

export interface CarFilters {
  q?: string;
  type?: string;
  transmission?: 'automatic' | 'manual';
  min_price?: number;
  max_price?: number;
}

export const CarService = {
  list(filters: CarFilters = {}): Promise<CarListResponse> {
    return apiRequest<CarListResponse>('/api/cars', {query: {...filters}});
  },
};

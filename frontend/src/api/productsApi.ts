import apiClient from './apiClient';
import type { Product } from '../types/api';

export const fetchProducts = async (search?: string) => {
  const { data } = await apiClient.get<Product[]>('/products', {
    params: search ? { search } : undefined,
  });
  return data;
};

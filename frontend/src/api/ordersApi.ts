import apiClient from './apiClient';
import type { OrderItemRequest, OrderResponse } from '../types/api';

export interface PlaceOrderPayload {
  deliveryAddress: string;
  items: OrderItemRequest[];
}

export const placeOrder = async (payload: PlaceOrderPayload) => {
  const { data } = await apiClient.post<OrderResponse>('/orders', payload);
  return data;
};

export const fetchMyOrders = async () => {
  const { data } = await apiClient.get<OrderResponse[]>('/orders/my');
  return data;
};

export const fetchOrderById = async (orderId: string) => {
  const { data } = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
  return data;
};

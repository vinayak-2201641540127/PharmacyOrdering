import apiClient from './apiClient';
import type { AuthResponse } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
}

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return data;
};

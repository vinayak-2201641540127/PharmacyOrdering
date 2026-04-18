import apiClient from './apiClient';
import type { Prescription } from '../types/api';

export const fetchMyPrescriptions = async () => {
  const { data } = await apiClient.get<Prescription[]>('/prescriptions/my');
  return data;
};

export const uploadPrescription = async (productId: number, file: File) => {
  const formData = new FormData();
  formData.append('productId', String(productId));
  formData.append('file', file);

  const { data } = await apiClient.post<Prescription>('/prescriptions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

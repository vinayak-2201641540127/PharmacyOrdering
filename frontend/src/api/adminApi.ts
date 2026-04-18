import apiClient from './apiClient';
import type { Prescription, PrescriptionStatus } from '../types/api';

export const fetchPendingPrescriptions = async () => {
  const { data } = await apiClient.get<Prescription[]>('/admin/prescriptions');
  return data;
};

export const reviewPrescription = async (prescriptionId: number, status: PrescriptionStatus) => {
  const { data } = await apiClient.patch<Prescription>(`/admin/prescriptions/${prescriptionId}`, {
    status,
  });
  return data;
};

export type UserRole = 'CUSTOMER' | 'ADMIN';
export type PrescriptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus = 'PLACED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface UserSummaryResponse {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: UserSummaryResponse;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  requiresPrescription: boolean;
}

export interface Prescription {
  id: number;
  productId: number;
  productName: string;
  status: PrescriptionStatus;
  originalFileName: string;
  uploadedAt: string;
  reviewedByName: string | null;
  reviewedAt: string | null;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  orderId: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface ApiProblem {
  detail?: string;
  errors?: Record<string, string>;
  status?: number;
  title?: string;
}

import type { Product, Prescription } from '../types/api';

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Amoxicillin 500mg", description: "Broad-spectrum antibiotic used to treat various bacterial infections including pneumonia and dental abscesses.", price: 12.99, stockQuantity: 50, requiresPrescription: true },
  { id: 2, name: "Ibuprofen 400mg", description: "Nonsteroidal anti-inflammatory drug used for treating pain, fever, and inflammation.", price: 5.49, stockQuantity: 120, requiresPrescription: false },
  { id: 3, name: "Lisinopril 10mg", description: "Medication of the angiotensin-converting enzyme inhibitor class used primarily in treatment of high blood pressure and heart failure.", price: 18.50, stockQuantity: 12, requiresPrescription: true },
  { id: 4, name: "Cetirizine 10mg", description: "Second-generation antihistamine used to treat allergic rhinitis, dermatitis, and urticaria effectively.", price: 8.99, stockQuantity: 85, requiresPrescription: false },
  { id: 5, name: "Atorvastatin 20mg", description: "Statin medication used to prevent cardiovascular disease in those at high risk and treat abnormal lipid levels.", price: 24.00, stockQuantity: 0, requiresPrescription: true },
  { id: 6, name: "Paracetamol 500mg", description: "Commonly used medicine that can help treat mild to moderate pain and reduce a high temperature rapidly.", price: 3.50, stockQuantity: 200, requiresPrescription: false },
  { id: 7, name: "Albuterol Inhaler", description: "Used to prevent and treat wheezing and shortness of breath caused by breathing problems like asthma or COPD.", price: 32.00, stockQuantity: 8, requiresPrescription: true },
  { id: 8, name: "Omeprazole 20mg", description: "Proton pump inhibitor effectively used in the treatment of dyspepsia, peptic ulcer disease, and severe GERD.", price: 14.50, stockQuantity: 60, requiresPrescription: false }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1001,
    productId: 1,
    productName: "Amoxicillin 500mg",
    userId: 999,
    originalFileName: "dr_smith_amoxicillin_rx_original.pdf",
    status: 'APPROVED',
    uploadedAt: '2026-04-18T10:30:00Z',
    reviewedAt: '2026-04-18T11:15:00Z',
    reviewedBy: 42,
    reviewedByName: 'Dr. Evans',
  },
  {
    id: 1002,
    productId: 3,
    productName: "Lisinopril 10mg",
    userId: 999,
    originalFileName: "blood_pressure_script_2026.jpg",
    status: 'PENDING',
    uploadedAt: '2026-04-18T12:05:00Z',
  }
];

export const MOCK_ORDERS: import('../types/api').OrderResponse[] = [
  {
    orderId: 5092,
    userId: 999,
    status: 'PROCESSING',
    totalAmount: 142.50,
    deliveryAddress: '3200 Secure Drive, Pharma City, HC 12345',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      { id: 101, productId: 1, name: 'Amoxicillin 500mg', quantity: 1, price: 12.99, requiresPrescription: true },
    ]
  },
  {
    orderId: 5011,
    userId: 999,
    status: 'COMPLETED',
    totalAmount: 21.00,
    deliveryAddress: '3200 Secure Drive, Pharma City, HC 12345',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    items: [
      { id: 102, productId: 6, name: 'Paracetamol 500mg', quantity: 6, price: 3.50, requiresPrescription: false },
    ]
  }
];

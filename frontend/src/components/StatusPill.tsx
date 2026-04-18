import type { OrderStatus, PrescriptionStatus } from '../types/api';

type StatusValue = OrderStatus | PrescriptionStatus;

interface StatusPillProps {
  status: StatusValue;
}

const variantMap: Record<StatusValue, string> = {
  APPROVED: 'pill-success',
  CANCELLED: 'pill-danger',
  COMPLETED: 'pill-success',
  PENDING: 'pill-warning',
  PLACED: 'pill-info',
  PROCESSING: 'pill-info',
  REJECTED: 'pill-danger',
};

export default function StatusPill({ status }: StatusPillProps) {
  return <span className={`pill ${variantMap[status]}`}>{status}</span>;
}

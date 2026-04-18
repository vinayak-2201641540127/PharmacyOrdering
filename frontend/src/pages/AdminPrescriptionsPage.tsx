import { useEffect, useState } from 'react';
import { fetchPendingPrescriptions, reviewPrescription } from '../api/adminApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatDateTime } from '../lib/format';
import type { Prescription, PrescriptionStatus } from '../types/api';

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const queue = await fetchPendingPrescriptions();
        setPrescriptions(queue);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load the review queue.'));
      }
    };

    void loadQueue();
  }, []);

  const handleReview = async (prescriptionId: number, status: PrescriptionStatus) => {
    try {
      const updatedPrescription = await reviewPrescription(prescriptionId, status);
      setPrescriptions((currentItems) =>
        currentItems.filter((item) => item.id !== updatedPrescription.id),
      );
    } catch (reviewError) {
      setError(getErrorMessage(reviewError, 'Unable to update the prescription status.'));
    }
  };

  return (
    <section className="page-grid">
      <div className="panel">
        <p className="eyebrow">Admin Queue</p>
        <h2>Approve or reject patient-uploaded prescriptions</h2>
        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-list">
          {prescriptions.map((prescription) => (
            <article className="list-card" key={prescription.id}>
              <div className="list-card__row">
                <div>
                  <strong>{prescription.productName}</strong>
                  <p>{prescription.originalFileName}</p>
                </div>
                <StatusPill status={prescription.status} />
              </div>
              <p className="muted-label">Uploaded {formatDateTime(prescription.uploadedAt)}</p>
              <div className="action-row">
                <button
                  className="primary-button"
                  onClick={() => handleReview(prescription.id, 'APPROVED')}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="ghost-button"
                  onClick={() => handleReview(prescription.id, 'REJECTED')}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

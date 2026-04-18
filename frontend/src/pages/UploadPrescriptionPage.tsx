import { useEffect, useState, type FormEvent } from 'react';
import { fetchProducts } from '../api/productsApi';
import { fetchMyPrescriptions, uploadPrescription } from '../api/prescriptionsApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatDateTime } from '../lib/format';
import type { Prescription, Product } from '../types/api';

export default function UploadPrescriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prescriptionProducts = products.filter((product) => product.requiresPrescription);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedProducts, loadedPrescriptions] = await Promise.all([
          fetchProducts(),
          fetchMyPrescriptions(),
        ]);
        setProducts(loadedProducts);
        setPrescriptions(loadedPrescriptions);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load prescription data.'));
      }
    };

    void loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const productId = Number(formData.get('productId'));
    const file = formData.get('file');

    if (!(file instanceof File) || !file.size) {
      setError('Please choose a prescription file to upload.');
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedPrescription = await uploadPrescription(productId, file);
      setPrescriptions((currentItems) => [uploadedPrescription, ...currentItems]);
      setSuccessMessage('Prescription uploaded successfully and queued for review.');
      event.currentTarget.reset();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to upload the prescription.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-grid two-column-grid">
      <div className="panel">
        <p className="eyebrow">Prescription Review</p>
        <h2>Upload supporting documents for restricted medicines</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Prescription-required product
            <select name="productId" required>
              <option value="">Select a medicine</option>
              {prescriptionProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            File
            <input accept=".pdf,.png,.jpg,.jpeg" name="file" required type="file" />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Uploading...' : 'Upload prescription'}
          </button>
        </form>
      </div>

      <div className="panel">
        <p className="eyebrow">My Uploads</p>
        <h2>Track prescription approval status</h2>
        <div className="table-list">
          {prescriptions.map((prescription) => (
            <article className="list-card" key={prescription.id}>
              <div className="list-card__row">
                <strong>{prescription.productName}</strong>
                <StatusPill status={prescription.status} />
              </div>
              <p>{prescription.originalFileName}</p>
              <p className="muted-label">Uploaded {formatDateTime(prescription.uploadedAt)}</p>
              {prescription.reviewedAt ? (
                <p className="muted-label">
                  Reviewed by {prescription.reviewedByName} on {formatDateTime(prescription.reviewedAt)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

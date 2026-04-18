import { useState, useEffect, type FormEvent, useRef } from 'react';
import { fetchProducts } from '../api/productsApi';
import { fetchMyPrescriptions, uploadPrescription } from '../api/prescriptionsApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatDateTime } from '../lib/format';
import type { Prescription, Product } from '../types/api';
import './UploadPrescriptionPage.css';

export default function UploadPrescriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const productIdRaw = formData.get('productId');
    
    if (!productIdRaw) {
      setError('Please select a medication.');
      return;
    }

    if (!selectedFile) {
      setError('Please provide a valid prescription document.');
      return;
    }

    setIsSubmitting(true);
    const productId = Number(productIdRaw);

    try {
      const uploadedPrescription = await uploadPrescription(productId, selectedFile);
      setPrescriptions((currentItems) => [uploadedPrescription, ...currentItems]);
      setSuccessMessage('Prescription uploaded securely and queued for review.');
      setSelectedFile(null);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to upload the prescription.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-page-root">
      
      {/* ── Upload Form ── */}
      <section className="panel-card">
        <p className="eyebrow">Prescription Gateway</p>
        <h2>Secure Document Upload</h2>
        
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label htmlFor="productId">Medication Name</label>
            <div className="select-wrapper">
              <select className="select-input" id="productId" name="productId" required defaultValue="">
                <option value="" disabled>Choose medication requiring authorization</option>
                {prescriptionProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Evidentiary Document</label>
            <div 
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="file-input-hidden" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              
              {!selectedFile ? (
                <>
                  <div className="dropzone-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p><strong>Click to upload</strong> or drag and drop</p>
                  <span>PDF, PNG, JPG up to 10MB</span>
                </>
              ) : (
                <div className="selected-file-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="file-name">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="form-success" style={{ padding: '0.875rem 1rem', background: 'rgba(10,126,110,0.1)', border: '1px solid var(--hcl-teal)', borderRadius: 'var(--radius-md)', color: 'var(--hcl-teal)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
               {successMessage}
            </div>
          )}

          <button className="btn-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Securing transmission...' : 'Submit Document'}
          </button>
        </form>
      </section>

      {/* ── My Uploads ── */}
      <section className="panel-card">
        <p className="eyebrow">My History</p>
        <h2>Status Tracking</h2>
        
        {prescriptions.length === 0 ? (
          <div className="empty-history">
            No secure documents have been uploaded yet.
          </div>
        ) : (
          <div className="history-list">
            {prescriptions.map((prescription) => (
              <article className="history-card" key={prescription.id}>
                <div className="history-row">
                  <strong>{prescription.productName}</strong>
                  <StatusPill status={prescription.status} />
                </div>
                <p className="history-file">{prescription.originalFileName}</p>
                <div className="history-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>Uploaded {formatDateTime(prescription.uploadedAt)}</span>
                </div>
                
                {prescription.reviewedAt && (
                  <div className="history-meta" style={{ marginTop: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                    <span>Reviewed by {prescription.reviewedByName || 'Admin'} on {formatDateTime(prescription.reviewedAt)}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}

import { useRef, useState } from 'react';
import { uploadFileSchema } from '../schemas/document.schema';
import type { UploadDocumentBody } from '../api/documents.api';
import { uploadDocument } from '../api/documents.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  uploadFn?: (body: UploadDocumentBody) => Promise<unknown>;
}

export function UploadDocumentDialog({ open, onClose, onSuccess, uploadFn = uploadDocument }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setValidationError(null);
    setUploadError(null);
    if (!f) { setFile(null); return; }

    const result = uploadFileSchema.safeParse(f);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid file');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setUploadError(null);
    try {
      await uploadFn({ fileName: file.name, fileSize: file.size, mimeType: file.type });
      onSuccess();
      onClose();
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className="dialog">
        <div className="dialog-header">
          <span className="dialog-title">Upload document</span>
          <button className="btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>File</label>
            <div className="file-drop" onClick={() => inputRef.current?.click()}>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <div className="file-drop-icon">📄</div>
              <div>Tap to select file</div>
              <div className="file-drop-hint">PDF, JPG, PNG · max 10 MB</div>
            </div>
            {file && <div className="file-selected">Selected: {file.name}</div>}
            {validationError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{validationError}</p>}
            {uploadError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{uploadError}</p>}
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!file || loading}>
              {loading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

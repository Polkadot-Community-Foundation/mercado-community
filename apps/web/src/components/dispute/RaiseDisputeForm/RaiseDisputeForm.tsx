import { useState, useMemo, useEffect } from 'react';
import type { DisputeReason } from '@mercado/types';

import { DisputeReasonSelector } from '../DisputeReasonSelector';
import { formatPrice } from '../../../lib';

export type RaiseDisputeFormData = {
  reason: DisputeReason;
  title: string;
  description: string;
  photos: File[];
};

type RaiseDisputeFormProps = {
  stakeAmount: bigint;
  initiator?: 'customer' | 'restaurant';
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onSubmit: (data: RaiseDisputeFormData) => void;
  onCancel: () => void;
};

export function RaiseDisputeForm({
  stakeAmount,
  initiator = 'customer',
  isLoading = false,
  loadingMessage,
  error = null,
  onSubmit,
  onCancel,
}: RaiseDisputeFormProps) {
  const [reason, setReason] = useState<DisputeReason | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const MAX_PHOTOS = 5;
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setPhotoError(null);
    const newFiles = Array.from(files);

    // Check total count
    if (photos.length + newFiles.length > MAX_PHOTOS) {
      setPhotoError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    // Check individual file sizes
    const oversized = newFiles.find((f) => f.size > MAX_SIZE_BYTES);
    if (oversized) {
      setPhotoError(`Photo exceeds maximum size of ${MAX_SIZE_MB} MB`);
      return;
    }

    setPhotos((prev) => [...prev, ...newFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Create and manage object URLs for photo previews
  const photoUrls = useMemo(
    () => photos.map((p) => URL.createObjectURL(p)),
    [photos],
  );

  // Revoke object URLs on cleanup or when photos change
  useEffect(() => {
    return () => {
      photoUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoUrls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !title.trim() || !description.trim()) return;

    onSubmit({
      reason,
      title: title.trim(),
      description: description.trim(),
      photos,
    });
  };

  const isValid =
    reason && title.trim().length >= 5 && description.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
        <h3 className="mb-1 font-medium text-warning">Stake Required</h3>
        <p className="text-sm text-text-secondary">
          To raise a dispute, you must stake{' '}
          <span className="font-semibold text-text-primary">
            {formatPrice(stakeAmount)}
          </span>
          . This stake will be returned if your dispute is resolved in your
          favor, or forfeited if the{' '}
          {initiator === 'customer' ? 'restaurant' : 'customer'} wins.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          What went wrong?
        </label>
        <DisputeReasonSelector
          value={reason}
          onChange={setReason}
          initiator={initiator}
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-text-secondary"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue"
          className="w-full rounded-lg border border-light-border bg-light-secondary px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none"
          disabled={isLoading}
          minLength={5}
          required
        />
        <p className="mt-1 text-xs text-text-tertiary">Minimum 5 characters</p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-text-secondary"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened in detail..."
          rows={4}
          className="w-full resize-none rounded-lg border border-light-border bg-light-secondary px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none"
          disabled={isLoading}
          minLength={10}
          required
        />
        <p className="mt-1 text-xs text-text-tertiary">Minimum 10 characters</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Photo Evidence (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand/90"
          disabled={isLoading || photos.length >= MAX_PHOTOS}
        />
        <p className="mt-1 text-xs text-text-tertiary">
          Max {MAX_PHOTOS} photos, {MAX_SIZE_MB} MB each
        </p>
        {photoError && <p className="mt-1 text-xs text-error">{photoError}</p>}
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div
                key={`${photo.name}-${photo.lastModified}-${photo.size}`}
                className="relative"
              >
                <img
                  src={photoUrls[index]}
                  alt={`Evidence ${index + 1}`}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-tactile focus-ring flex-1 rounded-lg border border-light-border bg-white py-3 font-medium text-text-secondary hover:bg-light-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="btn-tactile focus-ring flex-1 rounded-lg bg-error py-3 font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? loadingMessage || 'Submitting...'
            : `Stake ${formatPrice(stakeAmount)} & Submit`}
        </button>
      </div>
    </form>
  );
}

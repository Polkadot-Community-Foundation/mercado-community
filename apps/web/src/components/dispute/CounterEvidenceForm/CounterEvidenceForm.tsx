import { useState, useMemo, useEffect } from 'react';

import { formatPrice } from '../../../lib';

export type CounterEvidenceFormData = {
  title: string;
  description: string;
  photos: File[];
};

type CounterEvidenceFormProps = {
  stakeAmount: bigint;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: CounterEvidenceFormData) => void;
  onAcceptFault: () => void;
  onCancel: () => void;
};

export function CounterEvidenceForm({
  stakeAmount,
  isLoading = false,
  error = null,
  onSubmit,
  onAcceptFault,
  onCancel,
}: CounterEvidenceFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPhotos((prev) => [...prev, ...Array.from(files)]);
    }
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
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      photos,
    });
  };

  const isValid = title.trim().length >= 5 && description.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-info/30 bg-info/10 p-4">
        <h3 className="mb-1 font-medium text-info">Respond to Dispute</h3>
        <p className="text-sm text-text-secondary">
          You can either accept fault (customer wins immediately) or submit
          counter-evidence with a stake of{' '}
          <span className="font-semibold text-text-primary">
            {formatPrice(stakeAmount)}
          </span>
          . If you win, you get your stake plus the customer's stake.
        </p>
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
          placeholder="Brief summary of your response"
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
          placeholder="Explain your side of the story..."
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
          disabled={isLoading}
        />
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

      <div className="space-y-3">
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
            className="btn-tactile focus-ring flex-1 rounded-lg bg-gradient-brand py-3 font-medium text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? 'Submitting...'
              : `Stake ${formatPrice(stakeAmount)} & Respond`}
          </button>
        </div>
        <button
          type="button"
          onClick={onAcceptFault}
          className="btn-tactile focus-ring w-full rounded-lg border border-warning/30 bg-warning/10 py-3 font-medium text-warning hover:bg-warning/20"
          disabled={isLoading}
        >
          Accept Fault (Customer Wins)
        </button>
      </div>
    </form>
  );
}

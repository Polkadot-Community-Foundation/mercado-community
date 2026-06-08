import { useState, useMemo, useEffect, useRef } from 'react';

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

export type RestaurantProfileFormData = {
  description: string;
  avatarFile?: File;
};

type RestaurantProfileFormProps = {
  initialDescription?: string;
  initialAvatarUrl?: string;
  onSave: (data: RestaurantProfileFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function RestaurantProfileForm({
  initialDescription = '',
  initialAvatarUrl,
  onSave,
  onCancel,
  isLoading = false,
  error,
}: RestaurantProfileFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  // Track if user clicked "remove" to hide preview (visual only - actual removal requires uploading empty)
  const [hideCurrentAvatar, setHideCurrentAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(`Image exceeds maximum size of ${MAX_AVATAR_SIZE_MB} MB`);
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setHideCurrentAvatar(false);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setHideCurrentAvatar(true);
    setAvatarError(null);
    // Reset file input so same file can be re-selected
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Create preview URL for new avatar
  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );

  // Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  // Determine what avatar to show (hideCurrentAvatar is visual feedback only)
  const displayAvatarUrl =
    avatarPreviewUrl ?? (hideCurrentAvatar ? null : initialAvatarUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      description: description.trim(),
      avatarFile: avatarFile ?? undefined,
    });
  };

  // Only count actual changes that will be persisted
  const hasChanges =
    description.trim() !== initialDescription || avatarFile !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Restaurant Photo
        </label>
        {displayAvatarUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={displayAvatarUrl}
              alt="Restaurant"
              className="h-20 w-20 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeAvatar}
              className="text-sm text-error/80 hover:text-error transition-colors"
              disabled={isLoading}
            >
              Remove photo
            </button>
          </div>
        ) : (
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-brand-faded file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand-faded/80 file:cursor-pointer cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          />
        )}
        {avatarError && (
          <p className="mt-1 text-sm text-error">{avatarError}</p>
        )}
        <p className="mt-1 text-xs text-text-tertiary">
          Max {MAX_AVATAR_SIZE_MB} MB
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your restaurant..."
          rows={4}
          className="w-full rounded-lg border border-light-border bg-white px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-light-border bg-white py-3 font-medium text-text-secondary hover:bg-light-secondary transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className="btn-tactile focus-ring flex-1 rounded-lg bg-gradient-brand px-6 py-3 font-medium text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

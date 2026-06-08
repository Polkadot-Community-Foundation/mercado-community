import { useState, useMemo, useEffect, useRef } from 'react';
import * as Select from '@radix-ui/react-select';

import { CATEGORIES } from '../CategoryRow/CategoryRow';

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

export type RegisterRestaurantFormData = {
  name: string;
  location: string;
  description: string;
  avatarFile?: File;
  /** Comma-separated category IDs (e.g., "coffee,breakfast") */
  category: string;
};

type RegisterRestaurantFormProps = {
  locations: string[];
  onSubmit: (data: RegisterRestaurantFormData) => void;
  isLoading?: boolean;
  error?: string | null;
};

export function RegisterRestaurantForm({
  locations,
  onSubmit,
  isLoading = false,
  error,
}: RegisterRestaurantFormProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof RegisterRestaurantFormData, string>>
  >({});
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
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarError(null);
    // Reset file input so same file can be re-selected
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Create preview URL for avatar
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

  const validate = (): boolean => {
    const errors: Partial<Record<keyof RegisterRestaurantFormData, string>> =
      {};

    if (!name.trim()) {
      errors.name = 'Restaurant name is required';
    } else if (name.trim().length < 3) {
      errors.name = 'Restaurant name must be at least 3 characters';
    }

    if (!location) {
      errors.location = 'Location is required';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    }

    if (categories.length === 0) {
      errors.category = 'At least one category is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: name.trim(),
        location,
        description: description.trim(),
        avatarFile: avatarFile ?? undefined,
        category: categories.join(','),
      });
    }
  };

  const toggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Restaurant Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter restaurant name"
          className="w-full rounded-lg border border-light-border bg-white px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none"
          disabled={isLoading}
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-error">{validationErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Location *
        </label>
        <Select.Root value={location} onValueChange={setLocation}>
          <Select.Trigger
            id="location"
            className="inline-flex w-full items-center justify-between rounded-lg border border-light-border bg-white px-4 py-3 text-text-primary shadow-sm transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none disabled:opacity-50"
            disabled={isLoading}
          >
            <Select.Value placeholder="Select a city..." />
            <Select.Icon className="ml-2 text-text-tertiary">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>

          <Select.Content
            className="z-50 overflow-hidden rounded-lg border border-light-border bg-white shadow-lg"
            sideOffset={4}
          >
            <Select.Viewport>
              {locations.map((loc) => (
                <Select.Item
                  key={loc}
                  value={loc}
                  className="cursor-pointer px-4 py-2 text-text-primary outline-none data-[highlighted]:bg-brand-faded data-[highlighted]:text-text-primary"
                >
                  <Select.ItemText>{loc}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
        {validationErrors.location && (
          <p className="mt-1 text-sm text-error">{validationErrors.location}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Category *
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-white border border-light-border text-text-secondary hover:bg-light-secondary'
                } disabled:opacity-50`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
        {validationErrors.category && (
          <p className="mt-1 text-sm text-error">{validationErrors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Description *
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
        {validationErrors.description && (
          <p className="mt-1 text-sm text-error">
            {validationErrors.description}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Restaurant Photo (optional)
        </label>
        {avatarFile ? (
          <div className="flex items-center gap-3">
            <img
              src={avatarPreviewUrl ?? ''}
              alt="Restaurant preview"
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

      <button
        type="submit"
        disabled={isLoading}
        className="btn-tactile focus-ring w-full rounded-lg bg-gradient-brand px-6 py-3 font-medium text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registering...' : 'Register Restaurant'}
      </button>
    </form>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

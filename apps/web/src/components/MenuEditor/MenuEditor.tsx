import { useRef, useState, useMemo, useEffect } from 'react';
import type { Dish, DishOption } from '@mercado/types';

import { formatPrice } from '../../lib';
import { parseMenuCSV, generateMenuCSVTemplate } from '../../lib/csvMenuParser';

export type MenuEditorDish = {
  id: string;
  name: string;
  description: string;
  basePrice: string; // String for input handling
  inStock: boolean;
  options: Array<{
    id: string;
    name: string;
    price: string; // String for input handling
  }>;
  photoUrl?: string;
  photoFile?: File;
};

export type DishWithPhoto = Dish & { photoFile?: File };

export type MenuEditorProps = {
  initialDishes?: MenuEditorDish[];
  onSave: (dishes: DishWithPhoto[]) => void;
  isLoading?: boolean;
  error?: string | null;
};

function generateId(): string {
  return `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyDish(): MenuEditorDish {
  return {
    id: generateId(),
    name: '',
    description: '',
    basePrice: '',
    inStock: true,
    options: [],
  };
}

function createEmptyOption(): MenuEditorDish['options'][0] {
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    price: '',
  };
}

const MAX_PHOTO_SIZE_MB = 5;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export function MenuEditor({
  initialDishes = [],
  onSave,
  isLoading = false,
  error,
}: MenuEditorProps) {
  const [dishes, setDishes] = useState<MenuEditorDish[]>(
    initialDishes.length > 0 ? initialDishes : [createEmptyDish()],
  );
  const [expandedDish, setExpandedDish] = useState<string | null>(
    dishes[0]?.id ?? null,
  );
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseMenuCSV(content);

      if (result.errors.length > 0) {
        setCsvErrors(result.errors);
      } else {
        setCsvErrors([]);
        setDishes(result.dishes);
        if (result.dishes.length > 0) {
          setExpandedDish(result.dishes[0].id);
        }
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateMenuCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddDish = () => {
    const newDish = createEmptyDish();
    setDishes([...dishes, newDish]);
    setExpandedDish(newDish.id);
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
    if (expandedDish === dishId) {
      setExpandedDish(dishes[0]?.id ?? null);
    }
  };

  const handleDishChange = (
    dishId: string,
    field: keyof MenuEditorDish,
    value: string | boolean | File | undefined,
  ) => {
    setDishes(
      dishes.map((d) => (d.id === dishId ? { ...d, [field]: value } : d)),
    );
  };

  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({});

  const handlePhotoChange = (dishId: string, file: File | null) => {
    if (!file) {
      handleDishChange(dishId, 'photoFile', undefined);
      setPhotoErrors((prev) => {
        const next = { ...prev };
        delete next[dishId];
        return next;
      });
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoErrors((prev) => ({
        ...prev,
        [dishId]: `Photo exceeds maximum size of ${MAX_PHOTO_SIZE_MB} MB`,
      }));
      return;
    }

    setPhotoErrors((prev) => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
    handleDishChange(dishId, 'photoFile', file);
  };

  const removePhoto = (dishId: string) => {
    // Reset file input so same file can be re-selected
    const input = photoInputRefs.current[dishId];
    if (input) input.value = '';

    setDishes(
      dishes.map((d) =>
        d.id === dishId
          ? { ...d, photoFile: undefined, photoUrl: undefined }
          : d,
      ),
    );
    setPhotoErrors((prev) => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
  };

  // Track object URLs in a ref to properly revoke them
  const photoPreviewUrlsRef = useRef<Record<string, string>>({});

  // Create preview URLs for photo files, revoking old ones
  const photoPreviewUrls = useMemo(() => {
    const newUrls: Record<string, string> = {};
    const oldUrls = photoPreviewUrlsRef.current;

    dishes.forEach((dish) => {
      if (dish.photoFile) {
        // Reuse existing URL if same file, otherwise create new
        const existingUrl = oldUrls[dish.id];
        if (existingUrl && oldUrls[dish.id]) {
          // Check if it's the same file by comparing the file object
          newUrls[dish.id] = existingUrl;
        } else {
          newUrls[dish.id] = URL.createObjectURL(dish.photoFile);
        }
      }
    });

    // Revoke URLs that are no longer needed
    Object.entries(oldUrls).forEach(([id, url]) => {
      if (!newUrls[id] || newUrls[id] !== url) {
        URL.revokeObjectURL(url);
      }
    });

    photoPreviewUrlsRef.current = newUrls;
    return newUrls;
  }, [dishes]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoPreviewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  const handleAddOption = (dishId: string) => {
    setDishes(
      dishes.map((d) =>
        d.id === dishId
          ? { ...d, options: [...d.options, createEmptyOption()] }
          : d,
      ),
    );
  };

  const handleRemoveOption = (dishId: string, optionId: string) => {
    setDishes(
      dishes.map((d) =>
        d.id === dishId
          ? { ...d, options: d.options.filter((o) => o.id !== optionId) }
          : d,
      ),
    );
  };

  const handleOptionChange = (
    dishId: string,
    optionId: string,
    field: 'name' | 'price',
    value: string,
  ) => {
    setDishes(
      dishes.map((d) =>
        d.id === dishId
          ? {
              ...d,
              options: d.options.map((o) =>
                o.id === optionId ? { ...o, [field]: value } : o,
              ),
            }
          : d,
      ),
    );
  };

  const validate = (): boolean => {
    for (const dish of dishes) {
      if (!dish.name.trim()) return false;
      if (!dish.basePrice || isNaN(Number(dish.basePrice))) return false;
    }
    return dishes.length > 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Convert editor format (dollars as strings) to contract format (wei as bigint)
    // Example: "12.50" → 12500000000000000000n (12.5 * 1e18)
    const convertedDishes: DishWithPhoto[] = dishes.map((d) => ({
      id: d.id,
      name: d.name.trim(),
      description: d.description.trim(),
      basePrice: BigInt(Math.floor(Number(d.basePrice) * 1e18)), // dollars → wei
      inStock: d.inStock,
      options: d.options
        .filter((o) => o.name.trim())
        .map(
          (o): DishOption => ({
            id: o.id,
            name: o.name.trim(),
            price: BigInt(Math.floor(Number(o.price || '0') * 1e18)), // dollars → wei
          }),
        ),
      photoUrl: d.photoUrl,
      photoFile: d.photoFile,
    }));

    onSave(convertedDishes);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* CSV Import Section */}
      <div className="rounded-lg border border-light-border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary">
            Import from CSV
          </h3>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs text-brand hover:text-brand-dark transition-colors"
          >
            Download template
          </button>
        </div>
        <p className="text-xs text-text-tertiary mb-3">
          Upload a CSV file to bulk import dishes. Columns: name, description,
          price, inStock, option1_name, option1_price, etc.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleCSVImport}
          disabled={isLoading}
          className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-brand-faded file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand-faded/80 file:cursor-pointer cursor-pointer disabled:opacity-50"
        />
        {csvErrors.length > 0 && (
          <div className="mt-3 rounded-lg bg-error/10 p-3">
            <p className="text-sm font-medium text-error mb-1">
              Import errors:
            </p>
            <ul className="text-xs text-error list-disc list-inside">
              {csvErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {dishes.map((dish, index) => (
          <div
            key={dish.id}
            className="rounded-lg border border-light-border bg-white overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedDish(expandedDish === dish.id ? null : dish.id)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-light-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-tertiary">#{index + 1}</span>
                <span className="font-medium text-text-primary">
                  {dish.name || 'New Dish'}
                </span>
                {dish.basePrice && (
                  <span className="text-sm text-text-secondary">
                    {formatPrice(
                      BigInt(Math.floor(Number(dish.basePrice) * 1e18)),
                    )}
                  </span>
                )}
              </div>
              <ChevronIcon expanded={expandedDish === dish.id} />
            </button>

            {expandedDish === dish.id && (
              <div className="p-4 pt-0 border-t border-light-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={dish.name}
                      onChange={(e) =>
                        handleDishChange(dish.id, 'name', e.target.value)
                      }
                      placeholder="Dish name"
                      className="w-full rounded-lg border border-light-border bg-white px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={dish.basePrice}
                      onChange={(e) =>
                        handleDishChange(dish.id, 'basePrice', e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border border-light-border bg-white px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    Description
                  </label>
                  <textarea
                    value={dish.description}
                    onChange={(e) =>
                      handleDishChange(dish.id, 'description', e.target.value)
                    }
                    placeholder="Describe this dish..."
                    rows={2}
                    className="w-full rounded-lg border border-light-border bg-white px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none resize-none"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    Photo (optional)
                  </label>
                  {dish.photoUrl || dish.photoFile ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          dish.photoFile
                            ? photoPreviewUrls[dish.id]
                            : dish.photoUrl
                        }
                        alt={dish.name || 'Dish photo'}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(dish.id)}
                        className="text-sm text-error/80 hover:text-error transition-colors"
                        disabled={isLoading}
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={(el) => {
                        photoInputRefs.current[dish.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePhotoChange(dish.id, e.target.files?.[0] ?? null)
                      }
                      className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-brand-faded file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand-faded/80 file:cursor-pointer cursor-pointer disabled:opacity-50"
                      disabled={isLoading}
                    />
                  )}
                  {photoErrors[dish.id] && (
                    <p className="mt-1 text-xs text-error">
                      {photoErrors[dish.id]}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-text-tertiary">
                    Max {MAX_PHOTO_SIZE_MB} MB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`inStock-${dish.id}`}
                    checked={dish.inStock}
                    onChange={(e) =>
                      handleDishChange(dish.id, 'inStock', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-light-border text-brand focus:ring-brand-faded"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`inStock-${dish.id}`}
                    className="text-sm text-text-primary"
                  >
                    In stock
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-primary">
                      Options (add-ons)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddOption(dish.id)}
                      className="text-sm text-brand hover:text-brand-dark transition-colors"
                      disabled={isLoading}
                    >
                      + Add option
                    </button>
                  </div>
                  {dish.options.length > 0 && (
                    <div className="space-y-2">
                      {dish.options.map((option) => (
                        <div key={option.id} className="flex gap-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) =>
                              handleOptionChange(
                                dish.id,
                                option.id,
                                'name',
                                e.target.value,
                              )
                            }
                            placeholder="Option name"
                            className="flex-1 rounded-lg border border-light-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none"
                            disabled={isLoading}
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={option.price}
                            onChange={(e) =>
                              handleOptionChange(
                                dish.id,
                                option.id,
                                'price',
                                e.target.value,
                              )
                            }
                            placeholder="0.00"
                            className="w-24 rounded-lg border border-light-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveOption(dish.id, option.id)
                            }
                            className="px-2 text-error/80 hover:text-error transition-colors"
                            disabled={isLoading}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveDish(dish.id)}
                    className="text-sm text-error/80 hover:text-error transition-colors"
                    disabled={isLoading || dishes.length === 1}
                  >
                    Remove dish
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddDish}
        className="w-full rounded-lg border-2 border-dashed border-light-border py-3 text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors"
        disabled={isLoading}
      >
        + Add Dish
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading || !validate()}
        className="btn-tactile focus-ring w-full rounded-lg bg-gradient-brand px-6 py-3 font-medium text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Menu'}
      </button>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
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

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4H12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

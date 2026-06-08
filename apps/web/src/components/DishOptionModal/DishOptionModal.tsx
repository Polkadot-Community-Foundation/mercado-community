import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

import type { Dish, DishOption } from '../../types';
import { formatPrice } from '../../lib';

type DishOptionModalProps = {
  dish: Dish;
  isOpen: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onAddToCart: (selectedOptions: DishOption[]) => void;
};

export function DishOptionModal({
  dish,
  isOpen,
  isAuthenticated,
  onClose,
  onAddToCart,
}: DishOptionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const selected = dish.options.filter((o: DishOption) =>
      selectedIds.has(o.id),
    );
    onAddToCart(selected);
    setSelectedIds(new Set());
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 mx-4 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-light-border bg-white p-6 shadow-xl"
        >
          <Dialog.Title className="text-xl font-bold text-text-primary">
            {dish.name}
          </Dialog.Title>
          <p className="mt-1 text-sm text-text-secondary">{dish.description}</p>
          <p className="mt-2 font-semibold text-text-primary">
            {formatPrice(dish.basePrice)}
          </p>

          {dish.options.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <h4 className="text-sm font-medium text-text-secondary">
                Options
              </h4>
              {dish.options.map((option: DishOption) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 rounded-lg border border-light-border p-3 transition-colors duration-200 hover:bg-brand-faded"
                >
                  <Checkbox.Root
                    checked={selectedIds.has(option.id)}
                    onCheckedChange={() => toggle(option.id)}
                    className="flex h-4 w-4 items-center justify-center rounded border border-light-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                  >
                    <Checkbox.Indicator className="text-white">
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="flex-1 text-sm text-text-primary">
                    {option.name}
                  </span>
                  <span className="text-sm text-text-tertiary">
                    {option.price === 0n
                      ? 'Free'
                      : `+${formatPrice(option.price)}`}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="btn-tactile focus-ring flex-1 rounded-lg border-2 border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-faded"
            >
              Cancel
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleAdd}
                className="btn-tactile focus-ring bg-gradient-brand flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white hover:shadow-md"
              >
                Add to order
              </button>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg bg-light-tertiary px-4 py-2 text-sm font-medium text-text-tertiary cursor-not-allowed"
              >
                Log in to order
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

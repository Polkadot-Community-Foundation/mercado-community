import type { Dish } from '../../types';
import { formatPrice, formatOptions } from '../../lib';

type DishCardProps = Dish & {
  onClick?: () => void;
};

export function DishCard({
  name,
  description,
  basePrice,
  options,
  inStock,
  photoUrl,
  onClick,
}: DishCardProps) {
  const clickable = inStock && onClick;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`rounded-2xl border border-light-border bg-white p-4 shadow-sm ${!inStock && 'opacity-50'} ${clickable && 'card-interactive focus-ring cursor-pointer'}`}
    >
      <div className="flex items-start justify-between gap-4">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-text-primary">{name}</h4>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
          {options.length > 0 && (
            <p className="mt-2 text-xs text-text-tertiary">
              {formatOptions(options)}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="font-semibold text-text-primary">
            {formatPrice(basePrice)}
          </span>
          {!inStock && <p className="mt-1 text-xs text-error">Out of stock</p>}
        </div>
      </div>
    </div>
  );
}

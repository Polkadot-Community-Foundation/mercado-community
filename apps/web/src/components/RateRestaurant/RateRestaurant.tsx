import { useState } from 'react';

type RateRestaurantProps = {
  currentRating?: number;
  onSubmit: (rating: number) => void;
  disabled?: boolean;
};

export function RateRestaurant({
  currentRating,
  onSubmit,
  disabled = false,
}: RateRestaurantProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const isRated = currentRating !== undefined;
  const displayRating = hoveredStar ?? selectedRating ?? currentRating ?? 0;

  const handleSubmit = () => {
    if (selectedRating && !isRated) {
      onSubmit(selectedRating);
    }
  };

  if (isRated) {
    return (
      <div className="rounded-xl border border-light-border bg-light-secondary/50 p-4">
        <p className="mb-2 text-sm font-medium text-text-secondary">
          Your rating
        </p>
        <div
          className="flex items-center gap-1"
          role="img"
          aria-label={`Rated ${currentRating} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              aria-hidden="true"
              className={`text-2xl ${star <= currentRating ? 'text-yellow-400' : 'text-light-border'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-light-border bg-white p-4">
      <p className="mb-3 text-sm font-medium text-text-primary">
        How was your experience?
      </p>
      <div className="mb-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={selectedRating === star}
            className="text-3xl transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => setSelectedRating(star)}
          >
            <span
              className={
                star <= displayRating ? 'text-yellow-400' : 'text-light-border'
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || !selectedRating}
        onClick={handleSubmit}
        className="btn-tactile focus-ring w-full rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Rating
      </button>
    </div>
  );
}

export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'burgers', name: 'Burgers', emoji: '🍔' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣' },
  { id: 'mexican', name: 'Mexican', emoji: '🌮' },
  { id: 'chinese', name: 'Chinese', emoji: '🥡' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'thai', name: 'Thai', emoji: '🍜' },
  { id: 'italian', name: 'Italian', emoji: '🍝' },
  { id: 'healthy', name: 'Healthy', emoji: '🥗' },
  { id: 'dessert', name: 'Dessert', emoji: '🍰' },
  { id: 'coffee', name: 'Coffee', emoji: '☕' },
  { id: 'breakfast', name: 'Breakfast', emoji: '🥞' },
];

type CategoryRowProps = {
  selected?: string | null;
  onSelect?: (category: string | null) => void;
};

export function CategoryRow({ selected, onSelect }: CategoryRowProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect?.(isSelected ? null : cat.id)}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${cat.name} category`}
              aria-pressed={isSelected}
              className={`btn-tactile focus-ring flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
                isSelected
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-white hover:bg-light-secondary'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="whitespace-nowrap text-xs font-medium">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Link } from 'react-router';

type CartBadgeProps = {
  count: number;
};

export function CartBadge({ count }: CartBadgeProps) {
  if (count === 0) return null;

  return (
    <Link
      to="/checkout"
      className="bg-gradient-brand relative inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white transition-all duration-200 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      Cart ({count})
    </Link>
  );
}

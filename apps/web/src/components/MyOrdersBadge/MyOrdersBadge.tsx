import { Link } from 'react-router';

type MyOrdersBadgeProps = {
  activeCount: number;
};

export function MyOrdersBadge({ activeCount }: MyOrdersBadgeProps) {
  return (
    <Link
      to="/my-orders"
      className="relative inline-flex items-center rounded-full border border-light-border bg-white px-3 py-1 text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      My orders
      {activeCount > 0 && (
        <span className="bg-gradient-brand ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white">
          {activeCount}
        </span>
      )}
    </Link>
  );
}

type RestaurantOrderCountersProps = {
  counts: { label: string; count: number }[];
};

export function RestaurantOrderCounters({
  counts,
}: RestaurantOrderCountersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {counts.map(({ label, count }) => (
        <span
          key={label}
          className="rounded-full border border-light-border bg-white px-3 py-1 text-sm text-text-secondary shadow-sm"
        >
          {count} {label}
        </span>
      ))}
    </div>
  );
}

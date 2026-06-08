import * as Select from '@radix-ui/react-select';

type LocationSelectorProps = {
  locations: string[];
  onSelect: (location: string) => void;
};

export function LocationSelector({
  locations,
  onSelect,
}: LocationSelectorProps) {
  return (
    <Select.Root onValueChange={onSelect}>
      <Select.Trigger className="inline-flex w-full sm:w-64 items-center justify-between rounded-lg border border-light-border bg-white px-4 py-3 text-text-primary shadow-sm transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-faded focus:outline-none">
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

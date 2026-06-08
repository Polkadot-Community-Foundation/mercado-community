type LoadingSpinnerProps = {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'brand' | 'white';
  /** Additional CSS classes */
  className?: string;
};

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-3',
  lg: 'h-8 w-8 border-4',
};

const variantClasses = {
  brand: 'border-brand border-t-transparent',
  white: 'border-white/30 border-t-white',
};

export function LoadingSpinner({
  size = 'lg',
  variant = 'brand',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

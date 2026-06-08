import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

type RegisterFormProps = {
  onSubmit: (name: string, feePercentage: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

export function RegisterForm({
  onSubmit,
  isLoading,
  error,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [feePercentage, setFeePercentage] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim(), feePercentage);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Matchmaker Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your matchmaker name"
          className="input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="fee" className="block text-sm font-medium mb-1">
          Fee Percentage: {feePercentage}%
        </label>
        <input
          id="fee"
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={feePercentage}
          onChange={(e) => setFeePercentage(Number(e.target.value))}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>0%</span>
          <span>10% (max)</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register as Matchmaker'}
      </button>

      <p className="text-xs text-text-tertiary text-center">
        You will earn {feePercentage}% on every order placed through your
        referral link.
      </p>
    </form>
  );
}

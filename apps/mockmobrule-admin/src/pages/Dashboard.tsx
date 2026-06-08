import { Scale, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Verdict } from '@mercado/types';

import { useMockData } from '../hooks/useMockData';
import { CaseList } from '../components/CaseList';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'brand' | 'warning' | 'success';
}) {
  const colors = {
    brand: 'bg-brand/10 text-brand',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className="rounded-xl border border-light-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { disputes, isLoaded } = useMockData();

  const pendingCount = disputes.filter(
    (d) => d.verdict === Verdict.Pending,
  ).length;
  const resolvedCount = disputes.filter(
    (d) => d.verdict !== Verdict.Pending,
  ).length;
  const totalCount = disputes.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-light-border bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand p-2">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                MockMobRule Admin
              </h1>
              <p className="text-sm text-text-secondary">
                Review and resolve dispute cases
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Connection status */}
        {!isLoaded && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            Waiting for data... Make sure the main app has been loaded at least
            once.
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Total Cases"
            value={totalCount}
            icon={Scale}
            color="brand"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={Clock}
            color="warning"
          />
          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={CheckCircle}
            color="success"
          />
        </div>

        {/* Case list */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Dispute Cases
          </h2>
          <CaseList />
        </section>
      </main>
    </div>
  );
}

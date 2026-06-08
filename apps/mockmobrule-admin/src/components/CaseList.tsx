import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Package,
  Utensils,
  HelpCircle,
  Image,
} from 'lucide-react';
import { Verdict, type Dispute, type DisputeEvidence } from '@mercado/types';

import { useMockData } from '../hooks/useMockData';

import { ResolveForm } from './ResolveForm';

function getVerdictBadge(verdict: Verdict) {
  switch (verdict) {
    case Verdict.Pending:
      return {
        variant: 'warning' as const,
        label: 'Pending',
        icon: <Clock className="h-3 w-3" />,
      };
    case Verdict.CustomerWins:
      return {
        variant: 'success' as const,
        label: 'Customer Wins',
        icon: <CheckCircle className="h-3 w-3" />,
      };
    case Verdict.RestaurantWins:
      return {
        variant: 'error' as const,
        label: 'Restaurant Wins',
        icon: <XCircle className="h-3 w-3" />,
      };
  }
}

function getDisputeTypeBadge(type?: string) {
  switch (type) {
    case 'wrong_items':
      return {
        variant: 'error' as const,
        label: 'Wrong Items',
        icon: <Package className="h-3 w-3" />,
      };
    case 'incomplete_order':
      return {
        variant: 'warning' as const,
        label: 'Incomplete',
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    case 'food_quality':
      return {
        variant: 'error' as const,
        label: 'Food Quality',
        icon: <Utensils className="h-3 w-3" />,
      };
    case 'not_ready':
      return {
        variant: 'warning' as const,
        label: 'Not Ready',
        icon: <Clock className="h-3 w-3" />,
      };
    default:
      return {
        variant: 'info' as const,
        label: 'Other',
        icon: <HelpCircle className="h-3 w-3" />,
      };
  }
}

function Badge({
  variant,
  children,
}: {
  variant: 'warning' | 'success' | 'error' | 'info';
  children: React.ReactNode;
}) {
  const colors = {
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {children}
    </span>
  );
}

function EvidenceSection({
  evidence,
  label,
}: {
  evidence: DisputeEvidence | undefined;
  label: string;
}) {
  if (!evidence) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-text-secondary uppercase">
        {label}
      </h4>
      <div className="rounded-lg bg-light-secondary p-3">
        <p className="text-sm font-medium text-text-primary">
          {evidence.title}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {evidence.description}
        </p>
        {evidence.photos && evidence.photos.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
            <Image className="h-3 w-3" />
            {evidence.photos.length} photo
            {evidence.photos.length > 1 ? 's' : ''} attached
          </div>
        )}
      </div>
    </div>
  );
}

function CaseCard({ dispute }: { dispute: Dispute }) {
  const { evidenceStore } = useMockData();
  const [isExpanded, setIsExpanded] = useState(
    dispute.verdict === Verdict.Pending,
  );

  const verdictBadge = getVerdictBadge(dispute.verdict);
  const initiatorEvidence = evidenceStore[dispute.initiatorEvidenceCID];
  const counterEvidence = dispute.counterEvidenceCID
    ? evidenceStore[dispute.counterEvidenceCID]
    : undefined;
  const disputeTypeBadge = getDisputeTypeBadge(initiatorEvidence?.disputeType);

  const formatStake = (stake: bigint) => {
    return `${(Number(stake) / 1e12).toFixed(2)} DOT`;
  };

  return (
    <div className="card-interactive rounded-xl border border-light-border bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-text-primary">
              {initiatorEvidence?.title ?? `Dispute #${dispute.id.slice(0, 8)}`}
            </h3>
            <Badge variant={verdictBadge.variant}>
              {verdictBadge.icon}
              {verdictBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Badge variant={disputeTypeBadge.variant}>
              {disputeTypeBadge.icon}
              {disputeTypeBadge.label}
            </Badge>
            <span>•</span>
            <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Stake: {formatStake(dispute.initiatorStake)}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-text-tertiary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-tertiary" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-light-border p-4 space-y-4">
          {/* Addresses */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Customer:</span>
              <p className="font-mono text-xs text-text-primary truncate">
                {dispute.customerId}
              </p>
            </div>
            <div>
              <span className="text-text-secondary">Restaurant:</span>
              <p className="font-mono text-xs text-text-primary truncate">
                {dispute.restaurantId}
              </p>
            </div>
          </div>

          {/* Evidence */}
          <EvidenceSection
            evidence={initiatorEvidence}
            label="Customer Evidence"
          />
          <EvidenceSection
            evidence={counterEvidence}
            label="Restaurant Counter-Evidence"
          />

          {/* Stake info */}
          {dispute.challengerStake > 0n && (
            <div className="rounded-lg bg-light-secondary p-3 text-sm">
              <span className="text-text-secondary">Restaurant stake:</span>{' '}
              <span className="font-medium">
                {formatStake(dispute.challengerStake)}
              </span>
            </div>
          )}

          {dispute.faultAccepted && (
            <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
              Restaurant accepted fault - no resolution needed
            </div>
          )}

          {/* Resolve form for pending disputes */}
          {dispute.verdict === Verdict.Pending && !dispute.faultAccepted && (
            <div className="border-t border-light-border pt-4">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Resolve Dispute
              </h4>
              <ResolveForm disputeId={dispute.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CaseList() {
  const { disputes, isLoaded } = useMockData();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="rounded-xl border border-light-border bg-white p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-light-secondary flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-text-tertiary" />
        </div>
        <h3 className="mt-4 font-medium text-text-primary">No disputes</h3>
        <p className="mt-1 text-sm text-text-secondary">
          There are no disputes to review. Create some in the main app to test.
        </p>
      </div>
    );
  }

  // Sort by createdAt descending (newest first), pending first
  const sortedDisputes = [...disputes].sort((a, b) => {
    // Pending disputes first
    if (a.verdict === Verdict.Pending && b.verdict !== Verdict.Pending)
      return -1;
    if (a.verdict !== Verdict.Pending && b.verdict === Verdict.Pending)
      return 1;
    // Then by date
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="space-y-4">
      {sortedDisputes.map((dispute) => (
        <CaseCard key={dispute.id} dispute={dispute} />
      ))}
    </div>
  );
}

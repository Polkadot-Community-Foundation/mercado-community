import type { DisputeEvidence, DisputeReason } from '@mercado/types';

type EvidenceDisplayProps = {
  evidence: DisputeEvidence;
  title?: string;
};

const REASON_LABELS: Record<DisputeReason, string> = {
  // Customer-initiated reasons
  wrong_items: 'Wrong Items',
  incomplete_order: 'Incomplete Order',
  food_quality: 'Food Quality',
  not_ready: 'Not Ready',
  // Restaurant-initiated reasons
  customer_no_show: 'Customer No-Show',
  order_rejected: 'Order Rejected',
  payment_issue: 'Payment Issue',
  // Shared
  other: 'Other',
};

export function EvidenceDisplay({ evidence, title }: EvidenceDisplayProps) {
  const formattedDate = new Date(evidence.timestamp).toLocaleString();
  const submitterLabel =
    evidence.submittedBy === 'customer' ? 'Customer' : 'Restaurant';

  return (
    <div className="rounded-lg border border-light-border p-4 space-y-3">
      {title && <h4 className="font-medium text-text-primary">{title}</h4>}

      <div className="space-y-2">
        <div>
          <span className="text-sm text-text-secondary">Title:</span>
          <p className="font-medium text-text-primary">{evidence.title}</p>
        </div>

        {evidence.disputeType && (
          <div>
            <span className="text-sm text-text-secondary">Reason:</span>
            <p className="text-text-primary">
              {REASON_LABELS[evidence.disputeType]}
            </p>
          </div>
        )}

        <div>
          <span className="text-sm text-text-secondary">Description:</span>
          <p className="text-text-primary whitespace-pre-wrap">
            {evidence.description}
          </p>
        </div>

        {evidence.photos && evidence.photos.length > 0 && (
          <div>
            <span className="text-sm text-text-secondary mb-2 block">
              Photos ({evidence.photos.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {evidence.photos.map((cid, index) => (
                <div
                  key={cid}
                  className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-text-tertiary overflow-hidden"
                >
                  <PhotoPlaceholder index={index + 1} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs text-text-tertiary pt-2 border-t border-light-border">
          <span>Submitted by: {submitterLabel}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

function PhotoPlaceholder({ index }: { index: number }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M21 15L16 10L11 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 18L10 14L3 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs mt-1">Photo {index}</span>
    </div>
  );
}

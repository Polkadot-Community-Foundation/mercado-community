/**
 * Operation progress types for multi-step transactions.
 * Used by hooks to report progress to UI components.
 */

/** Phases for dispute-related operations */
export enum DisputeOperationPhase {
  IDLE = 'idle',
  UPLOADING_EVIDENCE = 'uploading_evidence',
  CREATING_DISPUTE = 'creating_dispute',
  SUBMITTING_TX = 'submitting_tx',
  CONFIRMING = 'confirming',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/** Phases for order-related operations */
export enum OrderOperationPhase {
  IDLE = 'idle',
  PREPARING_TX = 'preparing_tx',
  SUBMITTING_TX = 'submitting_tx',
  CONFIRMING = 'confirming',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/** Phases for registration operations */
export enum RegistrationPhase {
  IDLE = 'idle',
  UPLOADING_METADATA = 'uploading_metadata',
  REGISTERING = 'registering',
  SETTING_METADATA = 'setting_metadata',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/** Generic operation status with progress tracking */
export interface OperationStatus<TPhase extends string = string> {
  phase: TPhase;
  message: string;
  /** Progress as percentage 0-100 (optional) */
  progress?: number;
  /** Error details if phase is ERROR */
  error?: OperationError;
}

/** Structured error with recovery hints */
export interface OperationError {
  code: string;
  message: string;
  /** User-friendly recovery suggestion */
  recovery?: string;
  /** Original error for debugging */
  cause?: unknown;
}

/** Progress callback signature */
export type OnProgress<TPhase extends string = string> = (
  status: OperationStatus<TPhase>,
) => void;

/** Helper to create operation status updates */
export function createStatus<TPhase extends string>(
  phase: TPhase,
  message: string,
  progress?: number,
): OperationStatus<TPhase> {
  return { phase, message, progress };
}

/** Helper to create error status */
export function createErrorStatus<TPhase extends string>(
  errorPhase: TPhase,
  error: unknown,
  recovery?: string,
): OperationStatus<TPhase> {
  const message = error instanceof Error ? error.message : String(error);
  return {
    phase: errorPhase,
    message,
    error: {
      code: 'OPERATION_FAILED',
      message,
      recovery,
      cause: error,
    },
  };
}

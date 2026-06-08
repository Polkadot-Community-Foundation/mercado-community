import type { FrameLocator, Page } from '@playwright/test';

/**
 * Page object for the dispute detail page.
 * Handles viewing dispute details, submitting counter-evidence, and accepting fault.
 */
export class DisputeDetailPage {
  constructor(
    readonly frame: FrameLocator,
    private page: Page,
  ) {}

  /** The main heading showing "Dispute Details" or similar */
  get heading() {
    return this.frame.getByRole('heading', { name: /dispute/i });
  }

  /** Back link to my orders */
  get backLink() {
    return this.frame.getByRole('link', { name: /back to my orders/i });
  }

  /** Dispute status badge */
  get statusBadge() {
    return this.frame.locator('[data-testid="dispute-status-badge"]');
  }

  /** Get status text */
  statusText(status: string) {
    return this.frame.getByText(status, { exact: false });
  }

  /** The dispute reason text */
  get reasonText() {
    return this.frame.locator('[data-testid="dispute-reason"]');
  }

  /** Evidence section showing customer's evidence */
  get customerEvidence() {
    return this.frame.locator('[data-testid="customer-evidence"]');
  }

  /** Counter-evidence section (for restaurant) */
  get counterEvidenceSection() {
    return this.frame.locator('[data-testid="counter-evidence-section"]');
  }

  /** Submit counter-evidence button */
  get submitCounterEvidenceButton() {
    return this.frame.getByRole('button', {
      name: /submit counter.?evidence/i,
    });
  }

  /** Counter-evidence text area */
  get counterEvidenceTextArea() {
    return this.frame.getByRole('textbox', {
      name: /counter.?evidence|response/i,
    });
  }

  /** Accept fault button */
  get acceptFaultButton() {
    return this.frame.getByRole('button', { name: /accept fault/i });
  }

  /** Stake display showing locked amounts */
  get stakeDisplay() {
    return this.frame.locator('[data-testid="stake-display"]');
  }

  /** Resolution info after dispute is resolved */
  get resolutionInfo() {
    return this.frame.locator('[data-testid="resolution-info"]');
  }

  /** Winner text after resolution */
  winnerText(winner: 'customer' | 'restaurant') {
    return this.frame.getByText(new RegExp(winner, 'i'));
  }

  /** Navigate to this dispute page directly */
  async goto(disputeId: string) {
    await this.page.goto(`/#/disputes/${disputeId}`);
  }

  /** Submit counter-evidence */
  async submitCounterEvidence(evidence: string) {
    await this.counterEvidenceTextArea.fill(evidence);
    await this.submitCounterEvidenceButton.click();
  }

  /** Accept fault as restaurant */
  async acceptFault() {
    // Handle confirmation dialog
    const iframeEl = await this.page.$('#product-frame');
    const iframeFrame = await iframeEl?.contentFrame();
    await iframeFrame?.evaluate(() => {
      window.confirm = () => true;
    });
    await this.acceptFaultButton.click();
  }
}

import type { FrameLocator, Page } from '@playwright/test';

/**
 * Page object for the matchmaker portal dashboard (after registration).
 * Handles viewing stats, updating fees, and claiming accumulated fees.
 */
export class MMPortalDashboardPage {
  constructor(
    readonly frame: FrameLocator,
    private page: Page,
  ) {}

  /** Dashboard heading */
  get heading() {
    return this.frame.getByRole('heading', {
      name: /dashboard|portal|matchmaker/i,
    });
  }

  /** Matchmaker name display */
  get nameDisplay() {
    return this.frame.locator('[data-testid="matchmaker-name"]');
  }

  /** Current fee percentage display */
  get feeDisplay() {
    return this.frame.locator('[data-testid="fee-percentage"]');
  }

  /** Accumulated fees display */
  get accumulatedFeesDisplay() {
    return this.frame.locator('[data-testid="accumulated-fees"]');
  }

  /** Orders processed count */
  get ordersCount() {
    return this.frame.locator('[data-testid="orders-count"]');
  }

  /** Update fee button */
  get updateFeeButton() {
    return this.frame.getByRole('button', { name: /update.?fee|change.?fee/i });
  }

  /** New fee input (in update modal/form) */
  get newFeeInput() {
    return this.frame.getByRole('spinbutton', { name: /new.?fee|fee/i });
  }

  /** Confirm fee update button */
  get confirmFeeUpdateButton() {
    return this.frame.getByRole('button', { name: /confirm|save|update/i });
  }

  /** Claim fees button */
  get claimFeesButton() {
    return this.frame.getByRole('button', { name: /claim.?fees|withdraw/i });
  }

  /** Active status indicator */
  get activeStatus() {
    return this.frame.getByText(/active/i);
  }

  /** Registration date */
  get registrationDate() {
    return this.frame.locator('[data-testid="registration-date"]');
  }

  /** Wallet address */
  get walletAddress() {
    return this.frame.locator('[data-testid="wallet-address"]');
  }

  /** Success message after actions */
  get successMessage() {
    return this.frame.getByRole('alert').filter({ hasText: /success/i });
  }

  /** Error message */
  get errorMessage() {
    return this.frame.getByRole('alert').filter({ hasText: /error|failed/i });
  }

  /** Navigate to dashboard */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Update the fee percentage.
   */
  async updateFee(newFeePercentage: number) {
    await this.updateFeeButton.click();
    await this.newFeeInput.fill(String(newFeePercentage));
    await this.confirmFeeUpdateButton.click();
  }

  /**
   * Claim accumulated fees.
   */
  async claimFees() {
    await this.claimFeesButton.click();
  }

  /**
   * Get the displayed fee value as a number.
   */
  async getFeeValue(): Promise<number> {
    const text = await this.feeDisplay.textContent();
    const match = text?.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get accumulated fees as bigint (from text like "1.5 pUSD").
   */
  async getAccumulatedFees(): Promise<string> {
    return (await this.accumulatedFeesDisplay.textContent()) ?? '0';
  }
}

import type { FrameLocator, Page } from '@playwright/test';

/**
 * Page object for the MockMobRule Admin dashboard.
 * Handles reviewing and resolving dispute cases.
 */
export class MobRuleAdminPage {
  constructor(
    readonly frame: FrameLocator,
    private page: Page,
  ) {}

  /** Dashboard heading */
  get heading() {
    return this.frame.getByRole('heading', { name: /MockMobRule Admin/i });
  }

  /** Total cases stat card */
  get totalCasesCard() {
    return this.frame.getByText(/total cases/i).locator('..');
  }

  /** Pending cases stat card */
  get pendingCasesCard() {
    return this.frame.getByText(/pending/i).locator('..');
  }

  /** Resolved cases stat card */
  get resolvedCasesCard() {
    return this.frame.getByText(/resolved/i).locator('..');
  }

  /** Get total cases count */
  async getTotalCases(): Promise<number> {
    const card = this.totalCasesCard;
    const text = await card.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** Get pending cases count */
  async getPendingCases(): Promise<number> {
    const card = this.pendingCasesCard;
    const text = await card.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** Dispute Cases section heading */
  get casesHeading() {
    return this.frame.getByRole('heading', { name: /dispute cases/i });
  }

  /** Case list container */
  get caseList() {
    return this.frame.locator('[data-testid="case-list"]');
  }

  /** Get a case card by dispute ID */
  caseCard(disputeId: string) {
    return this.frame.locator(`[data-testid="case-${disputeId}"]`);
  }

  /** Find a case by customer address */
  caseByCustomer(address: string) {
    return this.frame
      .getByText(address)
      .locator('xpath=ancestor::*[contains(@class, "case")]');
  }

  /** Resolve button for a case (opens modal) */
  resolveButton(disputeId: string) {
    return this.caseCard(disputeId).getByRole('button', {
      name: /resolve|review/i,
    });
  }

  /** In the resolve modal: customer wins option */
  get customerWinsOption() {
    return this.frame.getByRole('radio', { name: /customer|refund/i });
  }

  /** In the resolve modal: restaurant wins option */
  get restaurantWinsOption() {
    return this.frame.getByRole('radio', { name: /restaurant|dismiss/i });
  }

  /** Verdict button: Rule for Customer */
  get ruleForCustomerButton() {
    return this.frame.getByRole('button', { name: /customer|refund/i });
  }

  /** Verdict button: Rule for Restaurant */
  get ruleForRestaurantButton() {
    return this.frame.getByRole('button', { name: /restaurant|dismiss/i });
  }

  /** Confirm verdict button */
  get confirmVerdictButton() {
    return this.frame.getByRole('button', { name: /confirm|submit verdict/i });
  }

  /** Close modal button */
  get closeModalButton() {
    return this.frame.getByRole('button', { name: /close|cancel/i });
  }

  /** Loading/waiting for data message */
  get waitingForDataMessage() {
    return this.frame.getByText(/waiting for data/i);
  }

  /** Navigate to admin dashboard */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Resolve a dispute in favor of a party.
   */
  async resolveDispute(disputeId: string, verdict: 'customer' | 'restaurant') {
    await this.resolveButton(disputeId).click();

    if (verdict === 'customer') {
      // Try radio button first, then regular button
      const radio = this.customerWinsOption;
      const button = this.ruleForCustomerButton;
      if (await radio.isVisible()) {
        await radio.click();
      } else if (await button.isVisible()) {
        await button.click();
      }
    } else {
      const radio = this.restaurantWinsOption;
      const button = this.ruleForRestaurantButton;
      if (await radio.isVisible()) {
        await radio.click();
      } else if (await button.isVisible()) {
        await button.click();
      }
    }

    // Confirm if there's a confirm button
    const confirm = this.confirmVerdictButton;
    if (await confirm.isVisible()) {
      await confirm.click();
    }
  }
}

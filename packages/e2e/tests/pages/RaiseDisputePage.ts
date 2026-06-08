import type { FrameLocator, Page } from '@playwright/test';

/**
 * Page object for raising a dispute from the order status page.
 * This handles the dispute form that appears when a customer raises a dispute.
 */
export class RaiseDisputePage {
  constructor(
    readonly frame: FrameLocator,
    private page: Page,
  ) {}

  /** The dispute form heading */
  get heading() {
    return this.frame.getByRole('heading', {
      name: /raise.?dispute|report.?issue/i,
    });
  }

  /** Dispute reason selector */
  get reasonSelector() {
    return this.frame.locator('[data-testid="dispute-reason-selector"]');
  }

  /** Select a dispute reason by text */
  reasonOption(reason: string) {
    return this.frame.getByRole('radio', { name: new RegExp(reason, 'i') });
  }

  /** Reason button/option by text (for button-style selectors) */
  reasonButton(reason: string) {
    return this.frame.getByRole('button', { name: new RegExp(reason, 'i') });
  }

  /** Evidence text area */
  get evidenceTextArea() {
    return this.frame.getByRole('textbox', {
      name: /evidence|description|details/i,
    });
  }

  /** Alternative: find textarea by placeholder */
  get evidenceTextAreaByPlaceholder() {
    return this.frame.getByPlaceholder(/evidence|describe/i);
  }

  /** Stake amount display */
  get stakeAmountDisplay() {
    return this.frame.locator('[data-testid="stake-amount"]');
  }

  /** Submit dispute button */
  get submitButton() {
    return this.frame.getByRole('button', {
      name: /submit.?dispute|raise.?dispute|confirm/i,
    });
  }

  /** Cancel button */
  get cancelButton() {
    return this.frame.getByRole('button', { name: /cancel/i });
  }

  /** Error message display */
  get errorMessage() {
    return this.frame.locator('[data-testid="dispute-error"]');
  }

  /** Success message or redirect indicator */
  get successMessage() {
    return this.frame.getByText(/dispute.?(raised|submitted|created)/i);
  }

  /**
   * Fill out and submit a dispute form.
   */
  async raiseDispute(reason: string, evidence: string) {
    // Try radio button first, then button-style selector
    const radioOption = this.reasonOption(reason);
    const buttonOption = this.reasonButton(reason);

    if (await radioOption.isVisible()) {
      await radioOption.click();
    } else if (await buttonOption.isVisible()) {
      await buttonOption.click();
    }

    // Fill evidence - try different locator strategies
    const textArea = this.evidenceTextArea;
    const textAreaByPlaceholder = this.evidenceTextAreaByPlaceholder;

    if (await textArea.isVisible()) {
      await textArea.fill(evidence);
    } else if (await textAreaByPlaceholder.isVisible()) {
      await textAreaByPlaceholder.fill(evidence);
    }

    await this.submitButton.click();
  }
}

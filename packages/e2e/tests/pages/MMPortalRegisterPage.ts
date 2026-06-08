import type { FrameLocator, Page } from '@playwright/test';

/**
 * Page object for the matchmaker portal registration page.
 * Handles registering as a new matchmaker.
 */
export class MMPortalRegisterPage {
  constructor(
    readonly frame: FrameLocator,
    private page: Page,
  ) {}

  /** Page heading */
  get heading() {
    return this.frame.getByRole('heading', {
      name: /register|become.?a.?matchmaker/i,
    });
  }

  /** Name input field */
  get nameInput() {
    return this.frame.getByRole('textbox', { name: /name/i });
  }

  /** Alternative: find by placeholder */
  get nameInputByPlaceholder() {
    return this.frame.getByPlaceholder(/name|matchmaker/i);
  }

  /** Fee percentage input */
  get feeInput() {
    return this.frame.getByRole('spinbutton', { name: /fee/i });
  }

  /** Alternative: find fee by label text */
  get feeInputByLabel() {
    return this.frame.locator('input[type="number"]');
  }

  /** Register/Submit button */
  get registerButton() {
    return this.frame.getByRole('button', { name: /register|submit|create/i });
  }

  /** Connection status indicator */
  get connectionStatus() {
    return this.frame.locator('[data-testid="connection-status"]');
  }

  /** Wallet address display */
  get addressDisplay() {
    return this.frame.locator('[data-testid="wallet-address"]');
  }

  /** Error message */
  get errorMessage() {
    return this.frame.locator('[role="alert"]');
  }

  /** Not connected message */
  get notConnectedMessage() {
    return this.frame.getByText(/connect.?wallet|not.?connected/i);
  }

  /** Navigate to register page */
  async goto() {
    await this.page.goto('/register');
  }

  /**
   * Register as a matchmaker with the given details.
   */
  async register(name: string, feePercentage: number) {
    // Fill name
    const nameField = this.nameInput;
    const nameByPlaceholder = this.nameInputByPlaceholder;

    if (await nameField.isVisible()) {
      await nameField.fill(name);
    } else if (await nameByPlaceholder.isVisible()) {
      await nameByPlaceholder.fill(name);
    }

    // Fill fee
    const feeField = this.feeInput;
    const feeByLabel = this.feeInputByLabel;

    if (await feeField.isVisible()) {
      await feeField.fill(String(feePercentage));
    } else if (await feeByLabel.isVisible()) {
      await feeByLabel.fill(String(feePercentage));
    }

    await this.registerButton.click();
  }
}

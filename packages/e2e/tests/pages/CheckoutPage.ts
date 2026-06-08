import type { FrameLocator } from '@playwright/test';

export class CheckoutPage {
  constructor(private frame: FrameLocator) {}

  get totalText() {
    return this.frame.getByText('Total', { exact: true });
  }

  get placeOrderButton() {
    return this.frame.getByRole('button', { name: /Place Order/i });
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}

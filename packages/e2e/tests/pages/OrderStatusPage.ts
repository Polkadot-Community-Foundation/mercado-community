import type { FrameLocator, Page } from '@playwright/test';

export class OrderStatusPage {
  constructor(
    private frame: FrameLocator,
    private page: Page,
  ) {}

  get heading() {
    return this.frame.getByText('Order Status');
  }

  statusText(status: string) {
    return this.frame.getByText(status);
  }

  get pickupCodeInput() {
    return this.frame.locator('#pickup-code');
  }

  get pickUpButton() {
    return this.frame.getByRole('button', {
      name: /Confirm Pickup/i,
    });
  }

  get cancelButton() {
    return this.frame.getByRole('button', { name: /Cancel order/i });
  }

  get cancelledMessage() {
    return this.frame.getByText('You have cancelled the order');
  }

  /**
   * Pick up the order using the provided pickup code.
   * @param pickupCode - The 6-digit pickup code from the restaurant
   */
  async pickUp(pickupCode: string) {
    await this.pickupCodeInput.fill(pickupCode);
    await this.pickUpButton.click();
  }

  async cancel() {
    const iframeEl = await this.page.$('#product-frame');
    const iframeFrame = await iframeEl?.contentFrame();
    await iframeFrame?.evaluate(() => {
      window.confirm = () => true;
    });
    await this.cancelButton.click();
  }
}

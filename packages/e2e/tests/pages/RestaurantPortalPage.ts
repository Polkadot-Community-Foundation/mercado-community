import type { FrameLocator, Page } from '@playwright/test';

export class RestaurantPortalPage {
  constructor(
    private frame: FrameLocator,
    private page: Page,
  ) {}

  get heading() {
    return this.frame.getByRole('heading', { name: /Restaurant portal/i });
  }

  counterText(text: string) {
    return this.frame.getByText(text);
  }

  get pastOrdersTab() {
    return this.frame.getByRole('button', { name: /Past orders/i });
  }

  orderCardByAddress(address: string) {
    return this.frame.locator('button').filter({ hasText: address }).first();
  }

  orderCardByStatus(status: string) {
    return this.frame.locator('button').filter({ hasText: status }).first();
  }

  // Order detail modal
  get confirmOrderButton() {
    return this.frame.getByRole('button', { name: 'Confirm order' });
  }

  get preparingOrderButton() {
    return this.frame.getByRole('button', { name: 'Preparing order' });
  }

  get readyForPickupButton() {
    return this.frame.getByRole('button', {
      name: 'Order is ready for pickup',
    });
  }

  get cancelOrderButton() {
    return this.frame.getByRole('button', { name: 'Cancel order' });
  }

  modalCustomerAddress(address: string) {
    return this.frame.locator('[role="dialog"]').getByText(address);
  }

  cancelledByText(who: string) {
    return this.frame.getByText(`Canceled by the ${who}`, { exact: true });
  }

  async clickOrderCard(address: string) {
    await this.orderCardByAddress(address).click();
  }

  async advanceOrder(address: string) {
    await this.clickOrderCard(address);
  }

  async cancelOrder() {
    const iframeEl = await this.page.$('#product-frame');
    const iframeFrame = await iframeEl?.contentFrame();
    await iframeFrame?.evaluate(() => {
      window.confirm = () => true;
    });
    await this.cancelOrderButton.click();
  }

  /**
   * Get the pickup code displayed in the modal after marking order ready.
   * Call this after clicking readyForPickupButton.
   */
  get pickupCodeText() {
    return this.frame.getByText('Give this code to the customer:');
  }

  get pickupCodeValue() {
    // The pickup code is in a font-mono element after the instruction text
    return this.frame.locator('.font-mono.text-2xl');
  }

  /**
   * Mark order ready for pickup and return the pickup code.
   * This clicks the button, waits for the modal, captures the code,
   * and closes the modal by pressing Escape.
   */
  async markReadyAndGetCode(): Promise<string> {
    await this.readyForPickupButton.click();
    // Wait for pickup code modal to appear
    await this.pickupCodeText.waitFor({ state: 'visible', timeout: 5000 });
    // Get the pickup code
    const code = await this.pickupCodeValue.textContent();
    if (!code) throw new Error('Pickup code not found');
    // Close modal with Escape
    await this.page.keyboard.press('Escape');
    return code.trim();
  }
}

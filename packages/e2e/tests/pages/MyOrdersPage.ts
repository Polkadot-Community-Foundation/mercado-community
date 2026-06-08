import type { FrameLocator } from '@playwright/test';

export class MyOrdersPage {
  constructor(private frame: FrameLocator) {}

  get activeOrdersHeading() {
    return this.frame.getByText('Active orders', { exact: true });
  }

  get pastOrdersHeading() {
    return this.frame.getByText('Past orders', { exact: true });
  }

  get emptyStateText() {
    return this.frame.getByText('No orders made yet');
  }

  orderCard(restaurantName: string) {
    return this.frame.getByRole('button', { name: restaurantName });
  }

  statusText(text: string) {
    return this.frame.getByText(text);
  }

  async clickOrder(restaurantName: string) {
    await this.orderCard(restaurantName).click();
  }
}

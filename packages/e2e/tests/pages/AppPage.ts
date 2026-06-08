import type { FrameLocator } from '@playwright/test';

export class AppPage {
  constructor(readonly frame: FrameLocator) {}

  get mercadoLink() {
    return this.frame.getByRole('link', { name: 'Mercado' });
  }

  get joinAsRestaurantLink() {
    return this.frame.getByRole('link', { name: /Join as a restaurant/i });
  }

  get restaurantPortalLink() {
    return this.frame.getByRole('link', { name: /Restaurant portal/i });
  }

  get myOrdersLink() {
    return this.frame.getByRole('link', { name: /My orders/i });
  }

  get checkoutLink() {
    // Match the header cart badge "Cart (N)", not the "View cart" button
    return this.frame.getByRole('link', { name: /^Cart \(\d+\)$/i });
  }

  get myOrdersBadge() {
    return this.myOrdersLink.locator('span.bg-gradient-brand');
  }

  myOrdersBadgeCount(count: string) {
    return this.myOrdersLink.getByText(count);
  }

  async waitForAuth(timeout = 15000) {
    await this.frame
      .getByRole('link', { name: /Join as a restaurant|Restaurant portal/i })
      .waitFor({ timeout });
  }

  async navigateHome() {
    await this.mercadoLink.click();
  }

  restaurantText(name: string) {
    return this.frame.getByText(name);
  }

  dishText(name: string) {
    return this.frame.getByText(name);
  }
}

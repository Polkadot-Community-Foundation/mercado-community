import type { FrameLocator } from '@playwright/test';

export class RegisterRestaurantPage {
  constructor(private frame: FrameLocator) {}

  get heading() {
    return this.frame.getByRole('heading', { name: /Join as a restaurant/i });
  }
}

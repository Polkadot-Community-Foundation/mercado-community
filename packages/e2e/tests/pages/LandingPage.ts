import type { FrameLocator } from '@playwright/test';

export class LandingPage {
  constructor(private frame: FrameLocator) {}

  get locationCombobox() {
    return this.frame
      .getByRole('combobox')
      .filter({ hasText: /Select a city/ });
  }

  locationOption(name: string) {
    return this.frame.getByRole('option', { name });
  }

  async selectLocation(name: string) {
    await this.locationCombobox.click();
    await this.locationOption(name).click();
  }
}

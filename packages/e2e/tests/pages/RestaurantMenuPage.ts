import type { FrameLocator } from '@playwright/test';

export class RestaurantMenuPage {
  constructor(private frame: FrameLocator) {}

  get menuHeading() {
    return this.frame.getByText('Menu');
  }

  dishButton(name: string) {
    return this.frame.getByRole('button', { name });
  }

  get addToOrderButton() {
    return this.frame.getByRole('button', { name: /Add to order/i });
  }

  get logInToOrderButton() {
    return this.frame.getByRole('button', { name: /Log in to order/i });
  }

  optionCheckbox(name: string) {
    return this.frame.getByRole('checkbox', { name: new RegExp(name, 'i') });
  }

  async addDishWithOptions(dishName: string, options: string[]) {
    await this.dishButton(dishName).click();
    for (const option of options) {
      await this.optionCheckbox(option).click();
    }
    await this.addToOrderButton.click();
  }

  async addDish(dishName: string) {
    await this.dishButton(dishName).click();
    await this.addToOrderButton.click();
  }
}

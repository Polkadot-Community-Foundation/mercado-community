import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { accounts } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import {
  useLocationsSpy,
  useRegisterRestaurantSpy,
} from '../contexts/DataContext/mockHooks.test-utils';

import { RegisterRestaurantContainer } from './RegisterRestaurantContainer';

const BASE_DATA = {
  locations: ['New York', 'Los Angeles'],
  activeAccount: accounts.alice,
};

test('renders registration form with location options', async () => {
  renderRoute(
    [
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantContainer />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/register-restaurant'],
    },
  );

  await expect
    .element(page.getByRole('button', { name: /Register Restaurant/i }))
    .toBeVisible();

  // Should have location dropdown
  await expect.element(page.getByLabelText(/Location/i)).toBeVisible();
});

test('shows name input field', async () => {
  renderRoute(
    [
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantContainer />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/register-restaurant'],
    },
  );

  await expect.element(page.getByLabelText(/Restaurant Name/i)).toBeVisible();
});

test('calls useLocations hook', async () => {
  renderRoute(
    [
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantContainer />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/register-restaurant'],
    },
  );

  await expect
    .element(page.getByRole('button', { name: /Register Restaurant/i }))
    .toBeVisible();
  expect(useLocationsSpy).toHaveBeenCalled();
  expect(useRegisterRestaurantSpy).toHaveBeenCalled();
});

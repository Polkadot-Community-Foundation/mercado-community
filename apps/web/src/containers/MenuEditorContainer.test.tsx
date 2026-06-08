import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import {
  useSetMenuSpy,
  useRestaurantSpy,
  useAccountInfoSpy,
} from '../contexts/DataContext/mockHooks.test-utils';

import { MenuEditorContainer } from './MenuEditorContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.charlie,
};

test('shows registration prompt when no restaurant', async () => {
  useAccountInfoSpy.mockReturnValue({
    account: accounts.alice,
    restaurantId: null,
    signer: null,
    isLoading: false,
  });

  renderRoute(
    [{ path: '/restaurant-portal/menu', element: <MenuEditorContainer /> }],
    {
      initialData: { ...BASE_DATA, activeAccount: accounts.alice },
      initialEntries: ['/restaurant-portal/menu'],
    },
  );

  await expect
    .element(page.getByText(/Please register your restaurant first/i))
    .toBeVisible();
});

test('renders menu editor for restaurant owner', async () => {
  renderRoute(
    [{ path: '/restaurant-portal/menu', element: <MenuEditorContainer /> }],
    {
      initialData: BASE_DATA,
      initialEntries: ['/restaurant-portal/menu'],
    },
  );

  await expect.element(page.getByText('Edit Menu')).toBeVisible();
  await expect
    .element(page.getByRole('button', { name: /Save Menu/i }))
    .toBeVisible();
});

test('shows existing dishes from restaurant', async () => {
  renderRoute(
    [{ path: '/restaurant-portal/menu', element: <MenuEditorContainer /> }],
    {
      initialData: BASE_DATA,
      initialEntries: ['/restaurant-portal/menu'],
    },
  );

  // Should show dishes from Burger Palace
  await expect.element(page.getByText('Classic Burger')).toBeVisible();
});

test('calls useSetMenu and useRestaurant hooks', async () => {
  renderRoute(
    [{ path: '/restaurant-portal/menu', element: <MenuEditorContainer /> }],
    {
      initialData: BASE_DATA,
      initialEntries: ['/restaurant-portal/menu'],
    },
  );

  await expect.element(page.getByText('Edit Menu')).toBeVisible();
  expect(useSetMenuSpy).toHaveBeenCalled();
  expect(useRestaurantSpy).toHaveBeenCalled();
});

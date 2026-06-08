import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { accounts } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { RegisterRestaurantPage } from '../pages/RegisterRestaurantPage';
import { RestaurantPortalPage } from '../pages/RestaurantPortalPage';

test('Unauthenticated user sees no nav links', async () => {
  renderRoute(
    [
      { path: '/', element: <div>Home</div> },
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantPage />,
      },
    ],
    {
      initialData: { activeAccount: null },
    },
  );

  await expect
    .element(page.getByRole('link', { name: /Join as a restaurant/i }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('link', { name: /Restaurant portal/i }))
    .not.toBeInTheDocument();
});

test('Correct restaurant account detection', async () => {
  renderRoute(
    [
      { path: '/', element: <div>Home</div> },
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantPage />,
      },
    ],
    {
      initialData: { activeAccount: accounts.alice },
    },
  );

  await expect
    .element(page.getByRole('link', { name: /Join as a restaurant/i }))
    .toBeVisible();
  await expect
    .element(page.getByRole('link', { name: /Restaurant portal/i }))
    .not.toBeInTheDocument();

  await page.getByRole('link', { name: /Join as a restaurant/i }).click();

  await expect
    .element(page.getByRole('heading', { name: /Join as a restaurant/i }))
    .toBeVisible();
});

test('Already registered 2', async () => {
  renderRoute(
    [
      { path: '/', element: <div>Home</div> },
      {
        path: '/register-restaurant',
        element: <RegisterRestaurantPage />,
      },
      {
        path: '/restaurant-portal',
        element: <RestaurantPortalPage />,
      },
    ],
    {
      initialData: { activeAccount: accounts.charlie },
      initialEntries: ['/register-restaurant'],
    },
  );

  await expect
    .element(page.getByRole('heading', { name: /Restaurant portal/i }))
    .toBeVisible();
});

test('Already registered', async () => {
  renderRoute(
    [
      { path: '/', element: <div>Home</div> },
      {
        path: '/restaurant-portal',
        element: <RestaurantPortalPage />,
      },
    ],
    {
      initialData: { activeAccount: accounts.charlie },
    },
  );

  await expect
    .element(page.getByRole('link', { name: /Restaurant portal/i }))
    .toBeVisible();
  await expect
    .element(page.getByRole('link', { name: /Join as a restaurant/i }))
    .not.toBeInTheDocument();

  await page.getByRole('link', { name: /Restaurant portal/i }).click();

  await expect
    .element(page.getByRole('heading', { name: /Restaurant portal/i }))
    .toBeVisible();
});

import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';

import { renderRoute } from '../test-utils/render';
import { useLocationsSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { LocationSelectorContainer } from './LocationSelectorContainer';

const TEST_DATA = {
  locations: ['New York', 'Los Angeles'],
};

test('renders locations and navigates on select', async () => {
  renderRoute(
    [
      { path: '/', element: <LocationSelectorContainer /> },
      {
        path: '/restaurants',
        element: <div>Restaurants page</div>,
      },
    ],
    { initialData: TEST_DATA },
  );

  // Open the location select (use placeholder text to distinguish from AccountSwitcher)
  await page.getByText('Select a city...').click();

  // Select a location
  await page.getByRole('option', { name: 'New York' }).click();

  // Should navigate to restaurants page
  await expect.element(page.getByText('Restaurants page')).toBeVisible();
});

test('calls useLocations', async () => {
  renderRoute([{ path: '/', element: <LocationSelectorContainer /> }], {
    initialData: TEST_DATA,
  });

  await expect.element(page.getByText('Select a city...')).toBeVisible();
  expect(useLocationsSpy).toHaveBeenCalled();
});

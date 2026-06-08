import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts, disputes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useDisputeSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { DisputeDetailContainer } from './DisputeDetailContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.alice,
  disputes: [disputes.disputeOpen],
};

test('shows not found when dispute does not exist', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId',
        element: <DisputeDetailContainer disputeId="nonexistent" />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/disputes/nonexistent'],
    },
  );

  await expect.element(page.getByText('Dispute not found')).toBeVisible();
});

test('shows dispute details', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId',
        element: <DisputeDetailContainer disputeId={disputes.disputeOpen.id} />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/disputes/${disputes.disputeOpen.id}`],
    },
  );

  // dispute.id.slice(0,8) = "dispute-"
  await expect.element(page.getByText(/Dispute #dispute-/i)).toBeVisible();
  await expect.element(page.getByText(/Burger Palace/i)).toBeVisible();
});

test('calls useDispute with correct disputeId', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId',
        element: <DisputeDetailContainer disputeId={disputes.disputeOpen.id} />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/disputes/${disputes.disputeOpen.id}`],
    },
  );

  await expect.element(page.getByText(/Dispute #dispute-/i)).toBeVisible();
  expect(useDisputeSpy).toHaveBeenCalledWith(disputes.disputeOpen.id);
});

test('shows respond button for restaurant owner on open dispute', async () => {
  const respondFn = () => {};

  renderRoute(
    [
      {
        path: '/disputes/:disputeId',
        element: (
          <DisputeDetailContainer
            disputeId={disputes.disputeOpen.id}
            onRespond={respondFn}
          />
        ),
      },
    ],
    {
      initialData: {
        ...BASE_DATA,
        activeAccount: accounts.charlie,
      },
      initialEntries: [`/disputes/${disputes.disputeOpen.id}`],
    },
  );

  await expect
    .element(page.getByRole('button', { name: /Respond to Dispute/i }))
    .toBeVisible();
});

import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts, disputes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import {
  useAddCounterEvidenceSpy,
  useAcceptFaultSpy,
} from '../contexts/DataContext/mockHooks.test-utils';

import { CounterEvidenceContainer } from './CounterEvidenceContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.charlie,
  disputes: [disputes.disputeOpen],
};

test('renders counter evidence form with stake button', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId/respond',
        element: (
          <CounterEvidenceContainer
            disputeId={disputes.disputeOpen.id}
            onComplete={() => {}}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/disputes/${disputes.disputeOpen.id}/respond`],
    },
  );

  // Submit button text includes "Stake" and "Respond"
  await expect
    .element(page.getByRole('button', { name: /Stake.*Respond/i }))
    .toBeVisible();
});

test('shows accept fault option', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId/respond',
        element: (
          <CounterEvidenceContainer
            disputeId={disputes.disputeOpen.id}
            onComplete={() => {}}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/disputes/${disputes.disputeOpen.id}/respond`],
    },
  );

  await expect
    .element(page.getByRole('button', { name: /Accept Fault/i }))
    .toBeVisible();
});

test('calls useAddCounterEvidence hook', async () => {
  renderRoute(
    [
      {
        path: '/disputes/:disputeId/respond',
        element: (
          <CounterEvidenceContainer
            disputeId={disputes.disputeOpen.id}
            onComplete={() => {}}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/disputes/${disputes.disputeOpen.id}/respond`],
    },
  );

  // Verify form renders by checking for a unique element
  await expect.element(page.getByText(/Respond to Dispute/i)).toBeVisible();
  expect(useAddCounterEvidenceSpy).toHaveBeenCalled();
  expect(useAcceptFaultSpy).toHaveBeenCalled();
});

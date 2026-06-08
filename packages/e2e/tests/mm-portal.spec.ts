/**
 * E2E tests for the Matchmaker Portal.
 *
 * Tests matchmaker registration and portal management.
 *
 * NOTE: The mm-portal app requires Host API authentication.
 * These tests verify the app loads and shows appropriate UI states.
 */
import { mmPortalTest as test, expect, waitForConnection } from './fixtures';

test.describe('Matchmaker Portal - Page Load', () => {
  test('shows registration or dashboard page when loaded', async ({
    testHost,
  }) => {
    const frame = await waitForConnection(testHost);

    // The app should show either:
    // - Registration page heading (if not registered)
    // - Dashboard (if already registered)
    // - Connection message (if not authenticated)
    const registrationHeading = frame.getByRole('heading', {
      name: /become.?a.?matchmaker|register/i,
    });
    const dashboardHeading = frame.getByRole('heading', {
      name: /dashboard|portal/i,
    });
    const connectionMessage = frame.getByText(/connect|wallet|triangle/i);

    // At least one of these states should be visible
    await expect(
      registrationHeading.or(dashboardHeading).or(connectionMessage).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows app shell with branding', async ({ testHost }) => {
    const frame = await waitForConnection(testHost);

    // App should have recognizable branding/navigation
    const brandingElement = frame.getByText(/matchmaker|mercado/i);
    await expect(brandingElement.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Matchmaker Registration Form', () => {
  test('registration form has required fields when visible', async ({
    testHost,
  }) => {
    const frame = await waitForConnection(testHost);

    // Check if we're on the registration page
    const registrationHeading = frame.getByRole('heading', {
      name: /become.?a.?matchmaker|register/i,
    });

    // If registration heading is visible, verify form fields exist
    const isOnRegistration = await registrationHeading
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (isOnRegistration) {
      // Name input should exist
      const nameInput = frame
        .getByRole('textbox', { name: /name/i })
        .or(frame.getByPlaceholder(/name/i));
      await expect(nameInput.first()).toBeVisible();

      // Fee input should exist
      const feeInput = frame
        .getByRole('spinbutton', { name: /fee/i })
        .or(frame.locator('input[type="number"]'));
      await expect(feeInput.first()).toBeVisible();

      // Submit button should exist
      const submitButton = frame.getByRole('button', {
        name: /register|submit|create/i,
      });
      await expect(submitButton.first()).toBeVisible();
    } else {
      // Not on registration - verify we're on dashboard instead
      const dashboardContent = frame.getByText(/dashboard|fee|matchmaker/i);
      await expect(dashboardContent.first()).toBeVisible();
    }
  });
});

test.describe('Matchmaker Dashboard', () => {
  test('dashboard shows relevant matchmaker info when visible', async ({
    testHost,
  }) => {
    const frame = await waitForConnection(testHost);

    // If dashboard is visible, verify it has expected content
    const dashboardHeading = frame.getByRole('heading', {
      name: /dashboard|portal/i,
    });

    const isOnDashboard = await dashboardHeading
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (isOnDashboard) {
      // Dashboard should show fee-related information
      const feeInfo = frame.getByText(/%|fee/i);
      await expect(feeInfo.first()).toBeVisible();
    } else {
      // Not on dashboard - should be on registration or showing connection state
      const otherState = frame.getByText(
        /register|connect|wallet|become.?a.?matchmaker/i,
      );
      await expect(otherState.first()).toBeVisible();
    }
  });
});

import type { Page } from '@playwright/test';

export const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  status: 'active',
};

export const existingEmailUser = {
  id: '456',
  email: 'existing@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'user',
  status: 'active',
};

// Track API call state for dynamic responses
let profileCallCount = 0;
let sessionCallCount = 0;

function resetCallCounts() {
  profileCallCount = 0;
  sessionCallCount = 0;
}

export async function setupUnauthenticated(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    profileCallCount++;
    route.fulfill({
      status: 401,
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    });
  });
}

export async function setupAuthenticated(page: Page, user = mockUser) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: user }),
    });
  });
}

export async function setupRegisterSuccess(page: Page) {
  resetCallCounts();

  // First profile call - 401 (user not authenticated, stays on register)
  // After form submission and login - 200 (user authenticated, redirects to home)
  await page.route('**/sessions/profile', async (route) => {
    profileCallCount++;
    if (profileCallCount === 1) {
      // First call - during page load, return 401 so user stays on register
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      });
    } else {
      // Subsequent calls - after login, return user so page redirects to home
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: mockUser }),
      });
    }
  });

  await page.route('**/users', (route) => {
    route.fulfill({
      status: 201,
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/sessions', (route) => {
    sessionCallCount++;
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: { user: mockUser } }),
    });
  });
}

export async function setupLoginSuccess(page: Page) {
  resetCallCounts();

  await page.route('**/sessions/profile', async (route) => {
    profileCallCount++;
    if (profileCallCount === 1) {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: mockUser }),
      });
    }
  });

  await page.route('**/sessions', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: { user: mockUser } }),
    });
  });
}

export async function setupLoginFailure(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 401,
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    });
  });
  await page.route('**/sessions', (route) => {
    route.fulfill({
      status: 401,
      body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
    });
  });
}

export async function setupRegisterConflict(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 401,
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    });
  });
  await page.route('**/users', (route) => {
    route.fulfill({
      status: 409,
      body: JSON.stringify({ success: false, message: 'Email already exists' }),
    });
  });
}

export async function setupLogout(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', async (route) => {
    profileCallCount++;
    if (profileCallCount === 1) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: mockUser }),
      });
    } else {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      });
    }
  });
  await page.route('**/sessions', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    });
  });
}

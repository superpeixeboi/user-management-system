import type { Page } from '@playwright/test';

export const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  status: 'active',
};

export const mockAdmin = {
  id: '999',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
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
    if (profileCallCount <= 2) {
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
    if (profileCallCount <= 2) {
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
  await page.route('**/users*', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          users: mockUsersList,
          pagination: { page: 1, limit: 6, total: mockUsersList.length, totalPages: 1 },
        },
      }),
    });
  });
  await page.route('**/sessions', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    });
  });
}

export const mockUsersList = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    email: 'user1@example.com',
    firstName: 'User',
    lastName: 'One',
    role: 'user',
    status: 'active',
  },
  {
    id: '3',
    email: 'user2@example.com',
    firstName: 'User',
    lastName: 'Two',
    role: 'user',
    status: 'inactive',
  },
  {
    id: '4',
    email: 'user3@example.com',
    firstName: 'User',
    lastName: 'Three',
    role: 'user',
    status: 'active',
  },
  {
    id: '5',
    email: 'user4@example.com',
    firstName: 'User',
    lastName: 'Four',
    role: 'user',
    status: 'active',
  },
];

export const mockEditUser = {
  id: '2',
  email: 'user1@example.com',
  firstName: 'User',
  lastName: 'One',
  role: 'user',
  status: 'active',
};

export async function setupAdminUsersList(page: Page, users = mockUsersList) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users*', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: { users, pagination: { page: 1, limit: 6, total: users.length, totalPages: 1 } },
      }),
    });
  });
}

export async function setupCreateUserSuccess(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            users: mockUsersList,
            pagination: { page: 1, limit: 6, total: mockUsersList.length, totalPages: 1 },
          },
        }),
      });
    } else {
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          success: true,
          data: {
            id: '6',
            email: 'new@example.com',
            firstName: 'New',
            lastName: 'User',
            role: 'user',
            status: 'active',
          },
        }),
      });
    }
  });
}

export async function setupCreateUserConflict(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users*', (route) => {
    route.fulfill({
      status: 409,
      body: JSON.stringify({ success: false, message: 'Email already exists' }),
    });
  });
}

export async function setupGetUser(page: Page, user = mockEditUser) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users/2', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: user }),
    });
  });
  await page.route('**/users*', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          users: mockUsersList,
          pagination: { page: 1, limit: 6, total: mockUsersList.length, totalPages: 1 },
        },
      }),
    });
  });
}

export async function setupUpdateUserSuccess(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users/2', (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { ...mockEditUser, firstName: 'Updated' } }),
      });
    } else {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: mockEditUser }),
      });
    }
  });
  await page.route('**/users*', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          users: mockUsersList,
          pagination: { page: 1, limit: 6, total: mockUsersList.length, totalPages: 1 },
        },
      }),
    });
  });
}

export async function setupUpdateUserInactiveNameChange(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  const inactiveUser = { ...mockEditUser, status: 'inactive' };
  await page.route('**/users/2', (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          message: 'Cannot change name while user is inactive',
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: inactiveUser }),
      });
    }
  });
}

export async function setupDeleteUser(page: Page) {
  resetCallCounts();
  await page.route('**/sessions/profile', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, data: mockAdmin }),
    });
  });
  await page.route('**/users*', (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    } else {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            users: mockUsersList.filter((u) => u.id !== '2'),
            pagination: { page: 1, limit: 6, total: mockUsersList.length - 1, totalPages: 1 },
          },
        }),
      });
    }
  });
}

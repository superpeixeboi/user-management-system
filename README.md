# User Management System

A monorepo containing a Node/Express/MongoDB API and two Next.js frontend applications (User Portal and Admin Dashboard).

## Prerequisites

- **Node.js** v22+
- **Docker** - Required to run MongoDB

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development environment:

   ```bash
   npm run dev
   ```

   This will:
   - Start MongoDB container (port 27017)
   - Start API on http://localhost:3001
   - Start user portal on http://localhost:3000

3. Run tests

   ```bash
   npm test
   ```

  This will run both api and portal tests
  Tests can also be run individually from the app folder

## Environment Variables

- **API** (`apps/api/.env`):
  - `PORT` - API port (default: 3001)
  - `MONGODB_URI` - MongoDB connection string
  - `JWT_SECRET` - JWT signing secret

- **Portal** (`apps/portal/.env.local`):
  - `NEXT_PUBLIC_API_URL` - API base URL

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages/apps
- `npm run clean` - Clean build artifacts

## Features

- **Portal** (port 3000): Login/register for regular users
- **API** (port 3001): RESTful endpoints for authentication and user CRUD

## Project Structure

```
user-management-system/
├── apps/
│   ├── api/          # Express + MongoDB API
│   ├── portal/       # Next.js user portal
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── styles/       # Tailwind v4 + DaisyUI v5 CSS
└── docker-compose.yml
```
### Monorepo
Turborepo was used to manage the monorepo, it provides the base scripts and has good performance.

### API
For the API, I decided on Express and implemented the middleware pattern.
Each middleware has its own clear responsibility.
Error handling happens on its own middleware at the end of the chain.

Express is a well-known, stable, and reliable framework.
For a project of low to medium complexity, I consider it to be a good option.

I also considered Nest. For projects of higher complexity, Nest could be a better fit.
Nest adherence to SOLID principles is a good way to enforce quality in larger teams.
Express is a simpler and slightly more performant option.

Unit tests using Jest validate all the logic implemented in the middleware.
Tests are run in isolation, mocking all external dependencies.

The API is containerized and ready to deploy to ECS, or similar services.

### Portal
I implemented the portal app using Next, but only with CSR.
My approach to SSR with React in general is to use it sparingly when the complexity of the page justifies it.
Otherwise, I will always favor the 'Keep It Simple' principle.

Logging in adds a token cookie that contains the session ID; the portal reads the cookie and reacts accordingly.
The token was set to expire in 7 days, but if the user logs out the session will be terminated and the cookie cleared.

An Axios instance was created to communicate with the API.

Playwright was used to test the flows, mocking the API calls to ensure tests are reliable and fast.
Of all the tests, 3 of them had to be skipped due to render timing issues. Those features were validated manually.

The portal is ready to be deployed to Vercel. I had planned to containerize it to deploy to ECS too, but got out of time.

### Styles
A Tailwind/DaisyUI build was created to provide two themes: light and dark.
They are changed by setting the data-theme property in the html tag and the option stored in the localstorage.

Tailwind is a very popular CSS framework, and combined with DaisyUI they provide a flexible and clean option for styles.
I tend to choose agnostic CSS options instead of component libraries like MaterialUI for ease of maintenance and upgrade.

### Types
The project's types and interfaces were extracted to their own package to keep the code clean and improve readability.
Considering that the project could grow in the future, I find it a good approach to share types.

### AI
To speed up development and take care of manual tasks, I used Opencode as the agent and Minimax as the model.
Every architectural decision was made by me, and every implementation by the agent was carefully observed and reviewed by me.

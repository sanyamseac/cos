# Central Ordering System (COS)

A comprehensive web application for managing canteen orders, menus, and notifications. Built with SvelteKit, Drizzle ORM, and PostgreSQL.

## Features

- **User & Canteen Management**:
  - **Consumers**: Browse menus, manage baskets, place orders, and track status.
  - **Canteen Managers**: Manage menu items, variants, addons, operating hours, and view dashboard statistics.
- **Real-time Updates**:
  - Server-Sent Events (SSE) for live order status updates.
  - Web Push Notifications for important alerts.
- **Ordering System**:
  - Shared baskets for group ordering.
  - Customizable menu items with variants and addons.
- **PWA Support**: Installable as a Progressive Web App with offline capabilities.
- **Email Notifications**: Integrated with Azure Communication Services.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide Svelte](https://lucide.dev/), [Phosphor Svelte](https://phosphoricons.com/)
- **Containerization**: Docker & Docker Compose

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── server/         # Server-side logic (DB, Email, SSE)
│   │   ├── db/         # Database schema and connection
│   │   └── ...
│   └── ...
├── routes/             # Application routes
│   ├── api/            # API endpoints (SSE, Push, etc.)
│   ├── auth/           # Authentication routes
│   ├── basket/         # Basket management
│   ├── canteen/        # Canteen dashboard & management
│   ├── menu/           # Menu browsing
│   ├── orders/         # Order tracking
│   └── ...
└── static/             # Static assets (manifest, sw.js, images)
```

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- Docker & Docker Compose

### Installation

1.  **Clone the repository:**

    ```bash
    git clone git@gitlab.iiit.ac.in:stallcomm/cos.git
    cd cos
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory. You can use the configuration from `docker-compose.yml` as a reference for database credentials.

4.  **Start the Database:**

    ```bash
    npm run db:start
    ```

5.  **Push Database Schema:**

    ```bash
    npm run db:push
    ```

6.  **Start Development Server:**

    ```bash
    npm run dev
    ```

## Command Reference

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm install`      | Install dependencies                         |
| `npm run dev`      | Start the development server                 |
| `npm run build`    | Build the application for production         |
| `npm run preview`  | Preview the production build locally         |
| `npm run check`    | Run SvelteKit sync and TypeScript check      |
| `npm run format`   | Format code using Prettier                   |
| `npm run lint`     | Check code formatting                        |
| `npm run db:start` | Start the PostgreSQL container via Docker    |
| `npm run db:push`  | Push schema changes to the database          |
| `npm run db:studio`| Open Drizzle Studio to manage data           |

## Deployment

The application is containerized using Docker.

1.  **Build and Run with Docker Compose:**

    ```bash
    docker compose up -d --build
    ```

    This will start the database, the application, and an Nginx reverse proxy as defined in `docker-compose.yml`.

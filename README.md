# Central Ordering System (COS)

A web application for managing canteen orders, menus, and notifications. Built with SvelteKit and PostgreSQL.

## Features

- Browse menus and place orders
- Real-time order status updates
- Shared baskets for group ordering
- Canteen management dashboard
- PWA support with offline capabilities

## Deployment

Deploy using the pre-built Docker image from [Docker Hub](https://hub.docker.com/r/arihanttr/cos).

### Prerequisites

- Docker & Docker Compose

### Quick Start

1. **Pull the image:**

    ```bash
    docker pull arihanttr/cos:latest
    ```

2. **Create a `docker-compose.yml` file:**

    ```yaml
    version: '3.8'
    services:
      cos:
        image: arihanttr/cos:latest
        ports:
          - "3000:3000"
        environment:
          - DATABASE_URL=postgres://root:${POSTGRES_PASSWORD}@db:5432/local
          - CAS_URL=https://login.yourinstitution.edu/cas
          - ORIGIN=https://yourdomain.com
        depends_on:
          - db

      db:
        image: postgres:16-alpine
        environment:
          - POSTGRES_USER=root
          - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
          - POSTGRES_DB=local
        volumes:
          - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:
    ```

3. **Create a `.env` file:**

    ```bash
    POSTGRES_PASSWORD=your_secure_password
    ```

4. **Start the application:**

    ```bash
    docker compose up -d
    docker compose exec cos npm run db:push
    ```

5. **Access the application:**

    Navigate to <http://localhost:3000>

**Configuration:**

- `CAS_URL`: Your institution's CAS authentication server
- `ORIGIN`: Your domain (for production deployments)
- `POSTGRES_PASSWORD`: Secure password for the database

## Why Use COS?

The Central Ordering System is a comprehensive solution designed to streamline canteen operations and enhance the ordering experience for both consumers and canteen managers.

### For Consumers

- **Intuitive Menu Browsing**: Easily explore available items with detailed descriptions, variants, and pricing
- **Flexible Ordering**: Customize items with variants and addons to match your preferences
- **Shared Baskets**: Create group orders with friends or colleagues, perfect for team lunches
- **Real-time Updates**: Track your order status with live notifications via Server-Sent Events (SSE) and Web Push
- **Order History**: Access your complete transaction history and reorder favorite items with ease
- **Mobile-First Design**: Responsive interface that works seamlessly on all devices
- **PWA Support**: Install as a native app on your device with offline capabilities

### For Canteen Managers

- **Complete Menu Control**: Manage items, variants, addons, and pricing with an intuitive dashboard
- **Operating Hours Management**: Set and update canteen availability and timings
- **Order Management**: View, track, and update order statuses in real-time
- **Dashboard Analytics**: Monitor sales, popular items, and operational metrics
- **Inventory Tracking**: Keep track of available items and manage stock
- **Email Notifications**: Automated notifications via Azure Communication Services

### Technical Benefits

- **Modern Tech Stack**: Built with SvelteKit (Svelte 5) and Tailwind CSS v4 for optimal performance
- **Scalable Architecture**: PostgreSQL database with Drizzle ORM for reliable data management
- **Real-time Communication**: Server-Sent Events for instant order updates without polling
- **Security First**: CAS authentication integration for institutional security
- **Easy Deployment**: Pre-built Docker images with simple compose setup
- **Offline Capable**: Progressive Web App with service worker support
- **Type-Safe**: Full TypeScript implementation for maintainability

### Use Cases

- **Educational Institutions**: Perfect for college and university canteens managing high volumes
- **Corporate Cafeterias**: Streamline employee meal ordering and management
- **Food Courts**: Coordinate multiple vendors and shared dining spaces
- **Event Catering**: Manage pre-orders and group orders for events and conferences

COS eliminates the chaos of traditional ordering systems, reduces wait times, improves accuracy, and provides valuable insights for better canteen operations.

## For Developers

Want to contribute or customize COS? Here's how to set up a development environment.

### Prerequisites

- Node.js (v20+ recommended)
- Docker & Docker Compose

### Development Setup

1. **Clone the repository:**

    ```bash
    git clone git@gitlab.iiit.ac.in:stallcomm/cos.git
    cd cos
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Environment Setup:**

    Create a `.env` file in the root directory. You can use the configuration from `docker-compose.yml` as a reference for database credentials.

4. **Start the Database:**

    ```bash
    npm run db:start
    ```

5. **Push Database Schema:**

    ```bash
    npm run db:push
    ```

6. **Start Development Server:**

    ```bash
    npm run dev
    ```

### Command Reference

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

### Building from Source

If you want to build and deploy your own Docker image:

```bash
docker compose -f docker-compose.build.yml up -d --build
```

### Publishing Docker Images

To build and publish multi-platform images:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t arihanttr/cos:latest \
  --push \
  -f dockerfile .
```

### Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide Svelte](https://lucide.dev/), [Phosphor Svelte](https://phosphoricons.com/)
- **Containerization**: Docker & Docker Compose

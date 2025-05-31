# Central Ordering System

## Getting Started

Run the following commands to start the application locally:

```bash
npm i
npm run db:start
npm run db:push
npm run dev
```

## Command Reference

| Command | When to run |
|---------|-------------|
| `npm i` | When package.json dependencies change |
| `npm run db:start` | When Docker database container isn't running |
| `npm run db:push` | When you modify your database schema |
| `npm run dev` | Start development server |
# LoyaltyOS Frontend

React frontend for the Loyalty Program System.

## Setup

```bash
npm install
```

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:3000
```

## Development

```bash
npm start
```

App runs on http://localhost:3000 (backend) and http://localhost:3000 for Vite (if you migrate).

> **Note**: The backend CORS is set to `http://localhost:5173`. If using CRA (port 3000), either:
> - Change CRA port: add `PORT=5173` to `.env`
> - Or update backend CORS to include `http://localhost:3000`

Add to `.env`:
```
PORT=5173
REACT_APP_API_URL=http://localhost:3000
```

## Roles

| Role | Login → | Access |
|------|---------|--------|
| `admin` | `/admin` | Full system: users, brands, transactions, redemptions, profiles |
| `brand_manager` | `/brand` | Campaigns, rewards, tiers, rules, redemptions |
| `customer` | `/customer` | Profile, earn points, browse rewards, redemptions |

## Tech Stack

- React 18 + React Router v6
- Redux Toolkit (auth state)
- TanStack Table (sortable, paginated tables)
- Axios (API client with interceptors)
- react-hot-toast (notifications)
- Lucide React (icons)

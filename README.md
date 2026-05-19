# Customer Loyalty & Rewards Platform

A full-stack loyalty management system with role-based dashboards (Admin, Brand Manager, Customer).

## 🛠 Tech Stack
- **Backend**: Node.js | Express | TypeORM | PostgreSQL | JWT
- **Frontend**: React + Vite

---

## 🚀 Setup Guide

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL
- Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/iffat-s/web-project
cd web-project
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

**Create `.env` file** inside the `backend/` folder:

```env
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password_here
DB_NAME=your_database_name_here

# JWT Secrets (Change these to strong random strings)
JWT_SECRET=your_super_long_random_jwt_secret_here
JWT_REFRESH_SECRET=your_super_long_random_refresh_secret_here
```

**Start Backend:**
```bash
# Run migrations (if needed)
npm run typeorm migration:run

# Start server
npm start
```
Backend runs at **http://localhost:3000**

---

### 3. Frontend Setup
Open a **new terminal** and run:

```bash
cd frontend
npm install
```

**Create `.env.local` file** inside the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:3000
PORT=5173
```

**Start Frontend:**
```bash
npm run dev
```
Frontend runs at **http://localhost:5173**

---

### 4. Test the Application
1. Open `http://localhost:5173` in your browser
2. Register a new user (select role: `admin`, `brand_manager`, or `customer`)
3. Log in and explore

**Optional – Seed test data:**
```bash
cd backend
node seed.js
```

---

### 5. Troubleshooting

| Issue                        | Solution |
|-----------------------------|---------|
| Database connection failed  | Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD` |
| CORS error                  | Update `FRONTEND_URL` in backend `.env` |
| API calls not working       | Make sure `REACT_APP_API_URL` is correct in frontend `.env.local` |
| Port already in use         | Change `PORT` in backend `.env` or frontend `.env.local` |
| Tables not appearing        |  enable `synchronize: true` |

---

## Project Structure
```
web-project/
├── backend/
│   └── .env
├── frontend/
│   └── .env
└── README.md
```

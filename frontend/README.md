# Customer Loyalty & Rewards Platform - Frontend

React + Vite frontend for the Customer Loyalty & Rewards Platform.

## ✨ Features

- User registration and login
- Role-based dashboards (Admin, Brand Manager, Customer)
- Points earning & reward redemption
- Campaign browsing and loyalty profile
- Responsive and modern UI

## 🛠 Tech Stack

- React + Vite
- React Router
- Axios (for API calls)
- Context API / State Management

---

## 🚀 Frontend Setup

### 1. Navigate to Frontend Folder

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a file named `.env.local` in the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:3000
PORT=5173
```

> **Note**: Change `REACT_APP_API_URL` if your backend is running on a different port or URL.

### 4. Start the Development Server

```bash
npm start
```

Frontend will run at **http://localhost:5173**

---

## How to Connect with Backend

Make sure:

- Backend is running on `http://localhost:3000`
- `REACT_APP_API_URL` in `.env.local` matches the backend URL
- CORS is properly configured in the backend

---

**Made with ❤️**

---

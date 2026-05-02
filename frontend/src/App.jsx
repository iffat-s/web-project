//import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

// Layout Components
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RewardsCatalog from './pages/RewardsCatalog'
import MyRewards from './pages/MyRewards'
import TransactionHistory from './pages/TransactionHistory'
import LoyaltyProfile from './pages/LoyaltyProfile'
import AdminPanel from './pages/AdminPanel'
import Unauthorized from './pages/Unauthorized'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rewards" element={<RewardsCatalog />} />
            <Route path="/my-rewards" element={<MyRewards />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/loyalty-profile" element={<LoyaltyProfile />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
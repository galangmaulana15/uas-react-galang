import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// ================================
// PROTECTED ROUTE COMPONENT
// ================================
// Digunakan untuk melindungi halaman tertentu
// Jika user belum login → redirect ke /login
// Jika requireAdmin = true dan user bukan admin → redirect ke /
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()

  // ================================
  // LOADING STATE
  // ================================
  // Ditampilkan saat proses pengecekan login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  // ================================
  // JIKA BELUM LOGIN
  // ================================
  if (!user) {
    return <Navigate to="/login" />
  }

  // ================================
  // JIKA BUTUH ADMIN TAPI BUKAN ADMIN
  // ================================
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />
  }

  // ================================
  // JIKA LOLOS SEMUA PENGECEKAN
  // ================================
  return children
}

export default ProtectedRoute

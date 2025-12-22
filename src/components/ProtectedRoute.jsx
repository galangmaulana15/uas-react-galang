import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // ✅ PERUBAHAN: Tambah delay untuk mencegah flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  // ✅ PERUBAHAN: Jika belum login, redirect ke login dengan state asal
  if (!user) {
    // Simpan halaman yang ingin diakses untuk redirect setelah login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // ✅ PERUBAHAN: Jika butuh admin tapi bukan admin
  if (requireAdmin && user.role !== 'admin') {
    // Tampilkan pesan error atau redirect ke home
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-gray-400">Hanya admin yang dapat mengakses halaman ini</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  // ✅ PERUBAHAN: Tambah wrapper untuk children dengan key berdasarkan route
  return (
    <div key={location.pathname} className="transition-opacity duration-300">
      {children}
    </div>
  )
}

export default ProtectedRoute
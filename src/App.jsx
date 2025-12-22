import React from 'react'
// ================================
// IMPORT ROUTER
// ================================
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

// ================================
// IMPORT CONTEXT
// ================================
import { AuthProvider } from './context/AuthContext'

// ================================
// IMPORT KOMPONEN GLOBAL
// ================================
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'

// ================================
// IMPORT PAGES
// ================================
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Favorites from './pages/Favorites'
import Dashboard from './pages/Dashboard'
import AddMovie from './pages/AddMovie'
import Profile from './pages/Profile'

// ================================
// LAYOUT UTAMA APLIKASI
// ================================
// AppLayout digunakan untuk mengatur layout global
// seperti Header, Footer, dan isi halaman (Routes)
const AppLayout = () => {
  const location = useLocation()

  // Footer disembunyikan pada halaman login & register
  const hideFooter =
    location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-slate-900">
      {/* Header tampil di semua halaman */}
      <Header />

      {/* Konten utama halaman */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />

          {/* Protected Routes (wajib login) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Route khusus admin */}
          <Route
            path="/add-movie"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddMovie />
              </ProtectedRoute>
            }
          />

          {/* Jika route tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer hanya muncul jika tidak di halaman login/register */}
      {!hideFooter && <Footer />}
    </div>
  )
}

// ================================
// ROOT APP
// ================================
// Membungkus aplikasi dengan AuthProvider dan Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}

export default App

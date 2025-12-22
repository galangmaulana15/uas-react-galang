import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import AddMovie from './pages/AddMovie';
import Profile from './pages/Profile';

const AppLayout = () => {
  const location = useLocation();

  // Footer tidak tampil di halaman login & register
  const hideFooter =
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-slate-900">
      <Header />

      <main className="flex-grow">
        <Routes>

          {/* ===================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===================== */}
          {/* PROTECTED ROUTES */}
          {/* ===================== */}

          {/* Home sekarang WAJIB LOGIN */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetail />
              </ProtectedRoute>
            }
          />

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

          <Route
            path="/add-movie"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddMovie />
              </ProtectedRoute>
            }
          />

          {/* ===================== */}
          {/* FALLBACK */}
          {/* ===================== */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

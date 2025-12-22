# 🎬 RoncoMovie - Movie Discovery Platform

RoncoMovie is a modern movie discovery platform built with React, Tailwind CSS v4, and integrated with The Movie Database (TMDb) API. This project fulfills all requirements for the React Project 2025 assignment.

## 🚀 Features

### ✅ Required Features (Ketentuan Projekan)
- **Frontend**
  - ✅ Uses PNPM package manager
  - ✅ Built with React + Vite
  - ✅ Styling with Tailwind CSS v4 (single index.css file)
  - ✅ React Router for navigation
  - ✅ React Hooks: useState, useEffect, useContext
  - ✅ Login & Registration with validation
  - ✅ 6 pages (Home, Movies, Movie Detail, Favorites, Dashboard, Add Movie)
  - ✅ CRUD operations (Create, Read, Update, Delete favorites)
  - ✅ Filter, Sorting, and Search functionality
  - ✅ Responsive design

- **DevOps**
  - ✅ Version Control with Git & GitHub
  - ✅ Deployment ready for Vercel

- **Prohibited Items**
  - ✅ No other UI frameworks (Angular, Vue, Svelte)
  - ✅ No Bootstrap
  - ✅ No AJAX (uses Fetch API)
  - ✅ No deprecated HTML/JSX tags
  - ✅ No `var` declarations
  - ✅ No direct DOM manipulation methods

### 🎯 Additional Features
- **Authentication System**
  - Login/Register with form validation
  - Role-based access (Admin/User)
  - Protected routes
  - Persistent sessions

- **Movie Management**
  - Browse movies by categories (Popular, Top Rated, Upcoming)
  - Advanced search with filters
  - Movie details with trailers
  - Add to favorites
  - Admin movie addition

- **User Experience**
  - Dark theme with gradient designs
  - Smooth animations and transitions
  - Responsive on all devices
  - Loading states and error handling
  - Interactive UI components

- **Dashboard**
  - User activity statistics
  - Genre distribution charts
  - Watch time tracking
  - Admin controls (for admin users)


roncomovie/
├── public/                         # Folder untuk file statis (gambar, icon, dll)
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Komponen header / navigasi utama
│   │   ├── Footer.jsx              # Komponen footer website
│   │   ├── MovieCard.jsx           # Komponen card untuk menampilkan data film
│   │   ├── MovieModal.jsx          # Modal / popup detail film (jika diperlukan)
│   │   └── ProtectedRoute.jsx      # Proteksi halaman (hanya bisa diakses jika login)
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Halaman utama (landing page)
│   │   ├── Login.jsx               # Halaman login user
│   │   ├── Register.jsx            # Halaman registrasi user
│   │   ├── Movies.jsx              # Halaman daftar semua film
│   │   ├── MovieDetail.jsx         # Halaman detail satu film
│   │   ├── Favorites.jsx           # Halaman film favorit user
│   │   ├── Dashboard.jsx           # Halaman dashboard user / admin
│   │   ├── AddMovie.jsx            # Halaman tambah film (khusus admin)
│   │   └── Profile.jsx             # Halaman profil user / admin
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Context untuk autentikasi (login, logout, data user)
│   │
│   ├── services/
│   │   └── api.js                  # File integrasi API film (TMDB)
│   │
│   ├── utils/
│   │   └── validation.js           # Fungsi validasi form (email, password, dll)
│   │
│   ├── App.jsx                     # Router utama aplikasi
│   ├── main.jsx                    # Entry point aplikasi React
|   |-- vercel.json
│   └── index.css                   # Style global aplikasi
│
├── README.md                       # Dokumentasi project
├── .gitignore                     
├── package.json                    # Dependency & konfigurasi project
└── vite.config.js                 

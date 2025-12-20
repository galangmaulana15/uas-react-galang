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


## 📁 Project Structure
roncomovie/
├── public/
├── src/
│ ├── components/
│ │ ├── Header.jsx # Navigation header
│ │ ├── Footer.jsx # Site footer
│ │ ├── MovieCard.jsx # Movie display card
│ │ ├── MovieModal.jsx # Movie modal(ifneeded)
│ │ └── ProtectedRoute.jsx # Auth protection
│ ├── pages/
│ │ ├── Home.jsx # Landing page
│ │ ├── Login.jsx # Login page
│ │ ├── Register.jsx # Registration page
│ │ ├── Movies.jsx # Movie listing
│ │ ├── MovieDetail.jsx # Single movie view
│ │ ├── Favorites.jsx # User favorites
│ │ ├── Dashboard.jsx # User dashboard
│ │ └── AddMovie.jsx # Add movie (admin)
| | |-- Profile.jsx # Profile user /admin
│ ├── context/
│ │ └── AuthContext.jsx # Authentication context
│ ├── services/
│ │ └── api.js # TMDB API integration
│ ├── utils/
│ │ └── validation.js # Form validation utilities
│ ├── App.jsx # Main router
│ ├── main.jsx # App entry point
│ └── index.css # Global styles
└── README.md
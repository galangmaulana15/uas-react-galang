// ================================
// IMPORT LIBRARY REACT
// ================================
// React digunakan untuk StrictMode (pengecekan error saat development)
import React from 'react'

// ReactDOM digunakan untuk me-render aplikasi ke DOM
import ReactDOM from 'react-dom/client'

// ================================
// IMPORT KOMPONEN UTAMA & STYLE
// ================================
// App adalah root component dari seluruh aplikasi
import App from './App.jsx'

// File CSS global untuk seluruh aplikasi
import './index.css'

// ================================
// RENDER APLIKASI KE DOM
// ================================
// createRoot digunakan oleh React 18 untuk performa rendering yang lebih baik
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* StrictMode membantu mendeteksi bug saat development */}
    <App />
  </React.StrictMode>
)

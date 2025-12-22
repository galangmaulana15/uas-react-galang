// Import modul React dan hooks yang diperlukan
import React, { useState, useEffect } from 'react'
// Import Link untuk navigasi internal React Router
import { Link } from 'react-router-dom'
// Import ikon-ikon dari lucide-react
import {
  Trash2,
  Filter,
  Search,
  Heart,
  Star,
  Calendar,
  Play,
  Film,
  Home,
} from 'lucide-react'
// Import komponen MovieCard
import MovieCard from '../components/MovieCard'
// Import useAuth untuk akses fungsi favorites yang benar
import { useAuth } from '../context/AuthContext'

// Komponen untuk menampilkan daftar film favorit
const Favorites = () => {
  // ================================
  // STATE MANAGEMENT
  // ================================
  const [favorites, setFavorites] = useState([]) // Daftar favorit asli
  const [filteredFavorites, setFilteredFavorites] = useState([]) // Favorit yang sudah difilter
  const [loading, setLoading] = useState(true) // Status loading
  const [searchQuery, setSearchQuery] = useState('') // Query pencarian
  const [sortBy, setSortBy] = useState('date') // Kriteria pengurutan

  // PERBAIKAN: Gunakan useAuth untuk akses favorites yang benar
  const { user, getUserFavorites, removeFromFavorites } = useAuth()

  // ================================
  // EFFECT UNTUK LOAD DATA
  // ================================
  // Effect untuk memuat data favorit saat komponen pertama kali dirender
  useEffect(() => {
    loadFavorites()
  }, [user]) // Tambahkan user sebagai dependency

  // Effect untuk memfilter dan mengurutkan favorit saat ada perubahan
  useEffect(() => {
    filterAndSortFavorites()
  }, [favorites, searchQuery, sortBy])

  // ================================
  // FUNGSI UTILITAS
  // ================================
  // PERBAIKAN: Gunakan getUserFavorites dari AuthContext
  const loadFavorites = () => {
    if (!user) {
      setFavorites([])
      setFilteredFavorites([])
      setLoading(false)
      return
    }

    try {
      // PERBAIKAN: Gunakan fungsi dari AuthContext untuk mendapatkan favorites yang benar
      const userFavorites = getUserFavorites()

      // Urutkan berdasarkan waktu ditambahkan (terbaru pertama)
      const sortedFavorites = userFavorites.sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0)
        const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0)
        return dateB - dateA // Terbaru di atas
      })

      setFavorites(sortedFavorites)
      setFilteredFavorites(sortedFavorites)
    } catch (error) {
      console.error('Error loading favorites:', error)
      // Fallback ke array kosong jika error
      setFavorites([])
      setFilteredFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk memfilter dan mengurutkan daftar favorit
  const filterAndSortFavorites = () => {
    let result = [...favorites]

    // Terapkan filter pencarian
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (movie) =>
          movie.title?.toLowerCase().includes(query) ||
          movie.overview?.toLowerCase().includes(query) ||
          (movie.genre_names &&
            movie.genre_names.some((genre) =>
              genre.toLowerCase().includes(query)
            ))
      )
    }

    // Terapkan pengurutan berdasarkan kriteria
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title?.localeCompare(b.title))
        break
      case 'rating':
        result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        break
      case 'date':
        // Urutkan berdasarkan waktu ditambahkan ke favorit
        result.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0)
          const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0)
          return dateB - dateA
        })
        break
      case 'release':
        // Urutkan berdasarkan tanggal rilis
        result.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date) : new Date(0)
          const dateB = b.release_date ? new Date(b.release_date) : new Date(0)
          return dateB - dateA // Terbaru di atas
        })
        break
      default:
        break
    }

    setFilteredFavorites(result)
  }

  // PERBAIKAN: Gunakan removeFromFavorites dari AuthContext
  const removeFavorite = (movieId) => {
    if (!user) return

    const success = removeFromFavorites(movieId)
    if (success) {
      // Perbarui state lokal
      const updatedFavorites = favorites.filter((fav) => fav.id !== movieId)
      setFavorites(updatedFavorites)

      // Tampilkan pesan sukses
      alert('Movie removed from favorites!')
    } else {
      alert('Failed to remove movie from favorites')
    }
  }

  // PERBAIKAN: Gunakan fungsi yang sesuai untuk menghapus semua favorit
  const removeAllFavorites = () => {
    if (!user) return

    if (
      window.confirm(
        'Are you sure you want to remove all favorites? This action cannot be undone.'
      )
    ) {
      // Untuk menghapus semua, kita perlu menghapus satu per satu
      // atau hapus key di localStorage
      const favoriteIds = favorites.map((movie) => movie.id)

      // Hapus satu per satu menggunakan fungsi dari AuthContext
      favoriteIds.forEach((movieId) => {
        removeFromFavorites(movieId)
      })

      // Clear state
      setFavorites([])
      setFilteredFavorites([])

      alert('All favorites have been removed!')
    }
  }

  // Fungsi toggle favorite untuk dikirim ke MovieCard
  const toggleFavorite = (movie) => {
    removeFavorite(movie.id)
  }

  // ================================
  // CONDITIONAL RENDERING
  // ================================
  // Tampilan loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  // Jika user tidak login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-full mb-6">
            <Heart className="h-10 w-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Please Login</h3>
          <p className="text-gray-400 mb-6">
            You need to be logged in to view your favorites.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            <Heart className="h-5 w-5 mr-2" />
            Login to View Favorites
          </Link>
        </div>
      </div>
    )
  }

  // ================================
  // RENDER COMPONENT
  // ================================
  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">My Favorites</h1>
                <p className="text-gray-400 flex items-center space-x-2">
                  <span>
                    {favorites.length} movie{favorites.length !== 1 ? 's' : ''}{' '}
                    saved
                  </span>
                  {favorites.length > 0 && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                      {favorites.filter((m) => m.addedAt).length} recently added
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tombol hapus semua favorit */}
            {favorites.length > 0 && (
              <button
                onClick={removeAllFavorites}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Trash2 size={20} />
                <span>Clear All Favorites</span>
              </button>
            )}
          </div>
        </div>

        {/* Pencarian dan Filter */}
        {favorites.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Input pencarian */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in favorites by title, description, or genre..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dropdown pengurutan */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[180px]"
                  >
                    <option value="date">Recently Added</option>
                    <option value="title">Title A-Z</option>
                    <option value="rating">Highest Rated</option>
                    <option value="release">Newest Release</option>
                  </select>
                </div>

                {/* Tombol reset pencarian */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daftar Favorit */}
        {favorites.length === 0 ? (
          // Tampilan jika tidak ada favorit
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full mb-6 border border-gray-700">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold mb-3">No favorites yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start adding movies to your favorites by clicking the heart icon
              on any movie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* PERBAIKAN: Ganti <a> dengan <Link> */}
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Browse Movies
              </Link>
              <Link
                to="/movies"
                className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors border border-gray-700 hover:border-gray-600"
              >
                <Film className="h-5 w-5 mr-2" />
                Explore All Movies
              </Link>
            </div>
          </div>
        ) : filteredFavorites.length === 0 ? (
          // Tampilan jika pencarian tidak menemukan hasil
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No matches found</h3>
            <p className="text-gray-400 mb-4">
              No favorites match your search for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              Clear search and show all favorites
            </button>
          </div>
        ) : (
          // Tampilan daftar favorit
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFavorites.map((movie) => (
                <div key={movie.id} className="relative group overflow-hidden">
                  <MovieCard
                    movie={movie}
                    onFavoriteToggle={() => toggleFavorite(movie)}
                    isFavorite={true}
                    onQuickView={() => {
                      // Anda bisa implementasikan modal quick view di sini
                      alert(`Quick view for: ${movie.title}`)
                    }}
                  />
                  {/* Tombol hapus film dari favorit */}
                  <button
                    onClick={() => removeFavorite(movie.id)}
                    className="absolute top-4 right-4 z-20 ..."
                    title="Remove from favorites"
                    aria-label={`Remove ${movie.title} from favorites`}
                  >
                    <Trash2 size={16} />
                  </button>
                  {/* Tampilkan tanggal film ditambahkan jika ada */}
                  {movie.addedAt && (
                    <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm text-xs text-gray-300 px-3 py-1.5 rounded-full">
                      📅 {new Date(movie.addedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Statistik Ringkasan */}
            <div className="mt-12 p-8 bg-gradient-to-br from-gray-800/50 to-black/50 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Heart className="h-6 w-6 text-red-400 mr-2" />
                Your Favorites Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-700/30 rounded-xl border border-blue-800/50 hover:border-blue-700 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {favorites.length}
                  </div>
                  <div className="text-gray-300 mt-2 flex items-center justify-center">
                    <Film className="h-4 w-4 mr-1" />
                    Total Movies
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-700/30 rounded-xl border border-yellow-800/50 hover:border-yellow-700 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {favorites.length > 0
                      ? (
                          favorites.reduce(
                            (sum, movie) => sum + (movie.vote_average || 0),
                            0
                          ) / favorites.length
                        ).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className="text-gray-300 mt-2 flex items-center justify-center">
                    <Star className="h-4 w-4 mr-1" />
                    Avg Rating
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-purple-700/30 rounded-xl border border-purple-800/50 hover:border-purple-700 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {(() => {
                      // Hitung jumlah genre unik
                      const allGenres = favorites.flatMap(
                        (movie) => movie.genre_ids || movie.genres || []
                      )
                      return new Set(allGenres).size
                    })()}
                  </div>
                  <div className="text-gray-300 mt-2">Unique Genres</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-green-700/30 rounded-xl border border-green-800/50 hover:border-green-700 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {(() => {
                      // Hitung jumlah tahun unik
                      const years = favorites
                        .map((movie) => movie.release_date?.substring(0, 4))
                        .filter((year) => year && year !== 'undefined')
                      return new Set(years).size
                    })()}
                  </div>
                  <div className="text-gray-300 mt-2 flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Years Span
                  </div>
                </div>
              </div>

              {/* Informasi tambahan */}
              {favorites.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
                    <div>
                      <p className="text-gray-400 text-sm">Latest Addition</p>
                      <p className="font-medium">
                        {favorites.length > 0 && favorites[0].title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Watch Time</p>
                      <p className="font-medium">
                        ~{Math.round(favorites.length * 2.15)} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Most Common Genre</p>
                      <p className="font-medium">
                        {/* Anda bisa menambahkan logika untuk menemukan genre paling umum */}
                        Action
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Favorites

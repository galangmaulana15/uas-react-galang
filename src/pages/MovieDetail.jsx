import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  Calendar,
  Clock,
  Heart,
  ChevronLeft,
  Pencil,
  Trash2,
  Users,
  Film,
  AlertTriangle,
} from 'lucide-react'
import { getMovieDetail, getImageUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  // CRUD STATES
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editOverview, setEditOverview] = useState('')
  const [editRating, setEditRating] = useState('')

  useEffect(() => {
    fetchMovie()
    checkFavorite()
  }, [id])

  const fetchMovie = async () => {
    setLoading(true)
    const adminData = JSON.parse(localStorage.getItem('admin_movies') || '{}')

    try {
      const apiMovie = await getMovieDetail(id)
      const mergedMovie = adminData[id]
        ? { ...apiMovie, ...adminData[id] }
        : apiMovie

      setMovie(mergedMovie)
      setEditTitle(mergedMovie.title)
      setEditOverview(mergedMovie.overview)
      setEditRating(mergedMovie.vote_average)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveEdit = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_movies') || '{}')
    adminData[id] = {
      title: editTitle,
      overview: editOverview,
      vote_average: parseFloat(editRating),
    }
    localStorage.setItem('admin_movies', JSON.stringify(adminData))
    setShowEdit(false)
    fetchMovie()
  }

  const deleteMovie = () => {
    const adminData = JSON.parse(localStorage.getItem('admin_movies') || '{}')
    adminData[id] = { deleted: true }
    localStorage.setItem('admin_movies', JSON.stringify(adminData))
    navigate('/movies')
  }

  const checkFavorite = () => {
    const favs = JSON.parse(
      localStorage.getItem('roncomovie_favorites') || '[]'
    )
    setIsFavorite(favs.some((f) => f.id === parseInt(id)))
  }

  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]')
    if (isFavorite) {
      favs = favs.filter((f) => f.id !== parseInt(id))
    } else {
      favs.push({ id: parseInt(id), title: movie.title })
    }
    localStorage.setItem('roncomovie_favorites', JSON.stringify(favs))
    setIsFavorite(!isFavorite)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-ungu-terang/30 border-t-ungu-terang rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading movie details...</p>
      </div>
    </div>
  )
  if (!movie) return null
  if (movie.deleted) return navigate('/movies')

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-900 to-gray-950">
      {/* BACK BUTTON */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-ungu-terang/20 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-medium">Back to Movies</span>
        </Link>
      </div>

      {/* HERO SECTION */}
      <div className="relative mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-ungu-terang/20 via-transparent to-biru-neon/10"></div>
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-[500px] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* POSTER */}
          <div className="lg:w-1/4">
            <div className="relative group">
              <img
                src={getImageUrl(movie.poster_path)}
                className="w-full max-w-sm rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300"
                alt={movie.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ungu-terang/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* FAVORITE BUTTON */}
            <div className="mt-6">
              <button
                onClick={toggleFavorite}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/20' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-ungu-terang/50'
                }`}
              >
                <Heart size={20} fill={isFavorite ? "white" : "none"} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>

          {/* MOVIE INFO */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
                  <Star className="text-yellow-400" size={18} />
                  <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">/10</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar size={18} />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={18} />
                  <span>{movie.runtime}m</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Users size={18} />
                  <span>{movie.vote_count.toLocaleString()} votes</span>
                </div>
              </div>
            </div>

            {/* GENRES */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-gradient-to-r from-ungu-terang/20 to-biru-neon/20 border border-ungu-terang/30 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Film size={24} className="text-ungu-terang" />
                Overview
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* ADDITIONAL INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-400">Production Companies</h3>
                <div className="space-y-2">
                  {movie.production_companies?.slice(0, 3).map((company) => (
                    <div key={company.id} className="flex items-center gap-3">
                      {company.logo_path ? (
                        <img 
                          src={getImageUrl(company.logo_path, 'w200')} 
                          alt={company.name}
                          className="h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                          <Film size={16} />
                        </div>
                      )}
                      <span className="text-sm">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-400">Budget & Revenue</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Budget</div>
                    <div className="text-xl font-bold">
                      ${(movie.budget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Revenue</div>
                    <div className="text-xl font-bold text-green-400">
                      ${(movie.revenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-400">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.spoken_languages?.map((lang) => (
                    <span
                      key={lang.iso_639_1}
                      className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm"
                    >
                      {lang.english_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ADMIN CRUD - ENHANCED */}
            {user?.role === 'admin' && (
              <div className="mt-12 bg-gradient-to-r from-gray-800/70 to-gray-900/70 p-6 rounded-2xl border border-gray-700 shadow-xl animate-slideUp">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-ungu-terang to-biru-neon rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Admin Controls</h3>
                    <p className="text-gray-400 text-sm">Manage movie details and metadata</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="group flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Pencil size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Edit Movie</div>
                      <div className="text-sm text-blue-200">Update title, description, etc.</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowEdit(true)}
                    className="group flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-600/20"
                  >
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Star size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Update Rating</div>
                      <div className="text-sm text-yellow-200">Adjust movie rating score</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowDelete(true)}
                    className="group flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/20"
                  >
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Trash2 size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Delete Movie</div>
                      <div className="text-sm text-red-200">Remove from database</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ENHANCED EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl w-full max-w-2xl border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-ungu-terang to-biru-neon">
              <div className="bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-ungu-terang/20 rounded-lg">
                      <Pencil size={24} className="text-ungu-terang" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Edit Movie Details</h3>
                      <p className="text-gray-400 text-sm">Update movie information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEdit(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movie Title
                    </label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-ungu-terang focus:ring-2 focus:ring-ungu-terang/30 text-white transition-all"
                      placeholder="Enter movie title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editOverview}
                      onChange={(e) => setEditOverview(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-ungu-terang focus:ring-2 focus:ring-ungu-terang/30 text-white resize-none transition-all"
                      placeholder="Enter movie description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editRating}
                          onChange={(e) => setEditRating(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-ungu-terang focus:ring-2 focus:ring-ungu-terang/30 text-white pr-10 transition-all"
                          placeholder="0.0 - 10.0"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400">
                          <Star size={20} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Release Year
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-ungu-terang focus:ring-2 focus:ring-ungu-terang/30 text-white transition-all"
                        placeholder="2024"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-ungu-terang focus:ring-2 focus:ring-ungu-terang/30 text-white transition-all"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => setShowEdit(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-6 py-3 bg-gradient-to-r from-ungu-terang to-biru-neon hover:from-ungu-terang/90 hover:to-biru-neon/90 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-ungu-terang/30"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-red-600 to-red-700">
              <div className="bg-gray-900 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">Delete Movie</h3>
                <p className="text-gray-400 mb-2">Are you sure you want to delete "{movie.title}"?</p>
                <p className="text-gray-500 text-sm mb-8">This action cannot be undone. All movie data will be permanently removed from the database.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowDelete(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteMovie}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
                  >
                    Delete Permanently
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertTriangle size={14} />
                    This will remove all associated data including ratings and reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieDetail
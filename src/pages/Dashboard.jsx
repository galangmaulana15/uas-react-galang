// Mengimpor modul React dan hooks yang diperlukan
import React, { useState, useEffect, useCallback } from 'react';
// Mengimpor berbagai ikon dari lucide-react
import { 
    BarChart3, Users, Film, Star, TrendingUp, 
    Calendar, Clock, PieChart, Download, Heart,
    Eye, Play, Award, Plus
} from 'lucide-react';
// Mengimpor context autentikasi
import { useAuth } from '../context/AuthContext';
// Mengimpor fungsi API untuk mendapatkan film berdasarkan kategori
import { getMoviesByCategory, getImageUrl } from '../services/api';

// Komponen Dashboard untuk menampilkan statistik pengguna
const Dashboard = () => {
    // ================================
    // STATE MANAGEMENT
    // ================================
    // Mendapatkan data user dan fungsi dari context auth
    const { user, getUserFavorites, addToFavorites, isMovieInFavorites } = useAuth();
    
    // State untuk menyimpan statistik dashboard
    const [stats, setStats] = useState({
        totalFavorites: 0,
        avgRating: 0,
        totalWatchTime: 0,
        genres: {},
        monthlyActivity: {},
        recentActivity: []
    });
    
    // State untuk menyimpan film-film terbaru
    const [recentMovies, setRecentMovies] = useState([]);
    // State untuk status loading
    const [loading, setLoading] = useState(true);
    // State untuk error handling
    const [error, setError] = useState(null);

    // ================================
    // EFFECT UNTUK LOAD DATA
    // ================================
    // Effect untuk mengambil data dashboard saat komponen mount atau user berubah
    useEffect(() => {
        fetchDashboardData();
        fetchRecentMovies();
    }, [user]);

    // ================================
    // FUNGSI UTILITAS
    // ================================
    // Fungsi untuk mengambil dan menghitung data statistik dashboard
    const fetchDashboardData = useCallback(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        try {
            // Mendapatkan daftar favorit user
            const favorites = getUserFavorites();
            
            // Menghitung total favorit
            const totalFavorites = favorites.length;
            
            // PERBAIKAN: Filter out movies with 0 or null ratings
            const ratedFavorites = favorites.filter(movie => movie.vote_average && movie.vote_average > 0);
            const totalRating = ratedFavorites.reduce((sum, movie) => sum + movie.vote_average, 0);
            const avgRating = ratedFavorites.length > 0 ? totalRating / ratedFavorites.length : 0;
            
            // Simulasi total waktu menonton (asumsi 2 jam per film)
            const totalWatchTime = totalFavorites * 120; // dalam menit
            
            // Distribusi genre (data dummy untuk saat ini)
            const genres = {};
            
            // Aktivitas bulanan (simulasi)
            const monthlyActivity = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthNames.forEach(month => {
                monthlyActivity[month] = Math.floor(Math.random() * 10);
            });

            // Aktivitas terbaru (5 favorit terakhir)
            const recentActivity = favorites.slice(0, 5).map(fav => ({
                type: 'favorite',
                title: fav.title,
                date: fav.addedAt || new Date().toISOString(),
                icon: Heart
            }));

            // Update state stats
            setStats({
                totalFavorites,
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalWatchTime,
                genres,
                monthlyActivity,
                recentActivity
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user, getUserFavorites]);

    // Fungsi untuk mengambil film-film populer terbaru
    const fetchRecentMovies = useCallback(async () => {
        try {
            const data = await getMoviesByCategory('popular');
            // Ambil 3 film pertama
            setRecentMovies(data.movies.slice(0, 3));
        } catch (error) {
            console.error('Error fetching recent movies:', error);
            setError('Failed to load recent movies');
        }
    }, []);

    // Fungsi untuk memformat waktu menonton dari menit ke format hari/jam
    const formatWatchTime = useCallback((minutes) => {
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (days > 0) {
            return `${days}d ${remainingHours}h`;
        }
        return `${hours}h`;
    }, []);

    // PERBAIKAN: Fungsi untuk handle favorite pada movie card di dashboard
    const handleAddToFavorite = useCallback((movie) => {
        if (!user) return;
        
        const success = addToFavorites(movie);
        if (success) {
            // Refresh dashboard data
            fetchDashboardData();
            alert(`${movie.title} has been added to your favorites!`);
        } else {
            alert('Failed to add movie to favorites');
        }
    }, [user, addToFavorites, fetchDashboardData]);

    // ================================
    // CONDITIONAL RENDERING
    // ================================
    // Jika user tidak login, tampilkan pesan
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                    <p className="text-gray-400">You need to be logged in to view the dashboard.</p>
                </div>
            </div>
        );
    }

    // Tampilan loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Tampilan error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchDashboardData();
                            fetchRecentMovies();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ================================
    // RENDER COMPONENT
    // ================================
    return (
        <div className="min-h-screen text-white py-8">
            <div className="container mx-auto px-4">
                {/* Header Dashboard */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
                    <p className="text-gray-400">
                        Welcome back, <span className="text-blue-400 font-semibold">{user.name}</span>! Here's your movie activity.
                    </p>
                </div>

                {/* Grid Statistik Utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Kartu Total Favorit */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm hover:border-blue-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <Heart className="h-10 w-10 text-blue-400" />
                            <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.totalFavorites}</div>
                        <div className="text-gray-400">Favorites</div>
                    </div>

                    {/* Kartu Rating Rata-rata */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm hover:border-purple-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <Star className="h-10 w-10 text-purple-400" />
                            <Award className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.avgRating}</div>
                        <div className="text-gray-400">Avg Rating</div>
                    </div>

                    {/* Kartu Waktu Menonton */}
                    <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl p-6 border border-green-800/30 backdrop-blur-sm hover:border-green-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <Clock className="h-10 w-10 text-green-400" />
                            <Play className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{formatWatchTime(stats.totalWatchTime)}</div>
                        <div className="text-gray-400">Watch Time</div>
                    </div>

                    {/* Kartu Aktivitas Terbaru */}
                    <div className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 rounded-2xl p-6 border border-pink-800/30 backdrop-blur-sm hover:border-pink-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="h-10 w-10 text-pink-400" />
                            <Eye className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.recentActivity.length}</div>
                        <div className="text-gray-400">Recent Activity</div>
                    </div>
                </div>

                {/* Bagian Bawah Dashboard - Charts dan Film Terbaru */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Panel Aktivitas Terbaru */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <TrendingUp className="h-6 w-6 mr-3 text-blue-400" />
                                Recent Activity
                            </h2>
                            {/* Tombol Export (simulasi) */}
                            <button 
                                onClick={() => alert('Export feature coming soon!')}
                                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                                aria-label="Export activity data"
                            >
                                <Download size={18} />
                                <span className="text-sm">Export</span>
                            </button>
                        </div>
                        
                        {/* Daftar Aktivitas Terbaru */}
                        <div className="space-y-4">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center mr-4">
                                            <activity.icon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold">Added to Favorites</div>
                                            <div className="text-sm text-gray-400 truncate">{activity.title}</div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No recent activity. Start adding movies to your favorites!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Film Populer Saat Ini */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <Film className="h-6 w-6 mr-3 text-purple-400" />
                            Popular Right Now
                        </h2>
                        
                        {/* Daftar Film Populer */}
                        <div className="space-y-4">
                            {recentMovies.length > 0 ? (
                                recentMovies.map((movie) => {
                                    const isFavorite = isMovieInFavorites(movie.id);
                                    
                                    return (
                                        <div key={movie.id} className="flex items-center p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors group">
                                            {/* PERBAIKAN: Gunakan getImageUrl dari services */}
                                            <img
                                                src={getImageUrl(movie.poster_path, 'w92')}
                                                alt={movie.title}
                                                className="w-16 h-24 object-cover rounded-lg mr-4 group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/92x138?text=No+Image';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold group-hover:text-blue-300 transition-colors truncate">
                                                    {movie.title}
                                                </h4>
                                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                                    <span className="flex items-center text-yellow-400">
                                                        <Star className="h-4 w-4 mr-1" />
                                                        {movie.vote_average?.toFixed(1) || 'N/A'}
                                                    </span>
                                                    <span className="text-gray-400">📅 {movie.release_date || 'N/A'}</span>
                                                </div>
                                            </div>
                                            {/* PERBAIKAN: Tombol Add to Favorites dengan logika yang benar */}
                                            <button 
                                                onClick={() => handleAddToFavorite(movie)}
                                                disabled={isFavorite}
                                                className={`text-sm px-3 py-1 rounded-lg transition-colors ${isFavorite 
                                                    ? 'bg-red-600 text-white cursor-default' 
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                                title={isFavorite ? 'Already in favorites' : 'Add to favorites'}
                                            >
                                                {isFavorite ? '❤️' : 'Add'}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No popular movies available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Statistik Pengguna */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm hover:border-blue-700/50 transition-colors">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Users className="h-6 w-6 mr-3 text-blue-400" />
                        Your Statistics
                    </h2>
                    
                    {/* Grid Statistik Detail */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalFavorites}</div>
                            <div className="text-gray-400">Movies Favorited</div>
                        </div>
                        
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors">
                            <div className="text-3xl font-bold text-green-400 mb-2">{formatWatchTime(stats.totalWatchTime)}</div>
                            <div className="text-gray-400">Total Watch Time</div>
                        </div>
                        
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.avgRating}</div>
                            <div className="text-gray-400">Average Rating Given</div>
                        </div>
                    </div>
                    
                    {/* Informasi Akun Pengguna */}
                    <div className="mt-6 pt-6 border-t border-gray-700/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="font-semibold mb-1">Account Type</h3>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full ${user.role === 'admin' 
                                    ? 'bg-red-900/30 text-red-300 border border-red-700/30' 
                                    : 'bg-blue-900/30 text-blue-300 border border-blue-700/30'
                                }`}>
                                    {user.role === 'admin' ? 'Administrator 👑' : 'Premium User ⭐'}
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <h3 className="font-semibold mb-1">Member Since</h3>
                                <p className="text-gray-400">
                                    {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Users, Film, Star, TrendingUp, 
    Calendar, Clock, PieChart, Download, Heart,
    Eye, Play, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMoviesByCategory } from '../services/api';

const Dashboard = () => {
    const { user, getUserFavorites } = useAuth();
    const [stats, setStats] = useState({
        totalFavorites: 0,
        avgRating: 0,
        totalWatchTime: 0,
        genres: {},
        monthlyActivity: {},
        recentActivity: []
    });
    const [recentMovies, setRecentMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchRecentMovies();
    }, [user]);

    const fetchDashboardData = () => {
        if (!user) return;
        
        const favorites = getUserFavorites();
        
        // Calculate stats
        const totalFavorites = favorites.length;
        
        const totalRating = favorites.reduce((sum, movie) => sum + (movie.vote_average || 0), 0);
        const avgRating = totalFavorites > 0 ? totalRating / totalFavorites : 0;
        
        // Simulate watch time (assuming 2 hours per movie)
        const totalWatchTime = totalFavorites * 120; // in minutes
        
        // Genre distribution
        const genres = {};
        // Since favorites don't have genre_ids, we'll simulate or fetch from API
        // For now, we'll use dummy data
        
        // Monthly activity (simulated)
        const monthlyActivity = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthNames.forEach(month => {
            monthlyActivity[month] = Math.floor(Math.random() * 10);
        });

        // Recent activity
        const recentActivity = favorites.slice(0, 5).map(fav => ({
            type: 'favorite',
            title: fav.title,
            date: fav.addedAt || new Date().toISOString(),
            icon: Heart
        }));

        setStats({
            totalFavorites,
            avgRating: parseFloat(avgRating.toFixed(1)),
            totalWatchTime,
            genres,
            monthlyActivity,
            recentActivity
        });
        setLoading(false);
    };

    const fetchRecentMovies = async () => {
        try {
            const data = await getMoviesByCategory('popular');
            setRecentMovies(data.movies.slice(0, 3));
        } catch (error) {
            console.error('Error fetching recent movies:', error);
        }
    };

    const formatWatchTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (days > 0) {
            return `${days}d ${remainingHours}h`;
        }
        return `${hours}h`;
    };

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
                    <p className="text-gray-400">
                        Welcome back, <span className="text-blue-400">{user.name}</span>! Here's your movie activity.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Favorites */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Heart className="h-10 w-10 text-blue-400" />
                            <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.totalFavorites}</div>
                        <div className="text-gray-400">Favorites</div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Star className="h-10 w-10 text-purple-400" />
                            <Award className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.avgRating}</div>
                        <div className="text-gray-400">Avg Rating</div>
                    </div>

                    {/* Watch Time */}
                    <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl p-6 border border-green-800/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Clock className="h-10 w-10 text-green-400" />
                            <Play className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{formatWatchTime(stats.totalWatchTime)}</div>
                        <div className="text-gray-400">Watch Time</div>
                    </div>

                    {/* Recently Added */}
                    <div className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 rounded-2xl p-6 border border-pink-800/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="h-10 w-10 text-pink-400" />
                            <Eye className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.recentActivity.length}</div>
                        <div className="text-gray-400">Recent Activity</div>
                    </div>
                </div>

                {/* Charts and Recent Movies */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Recent Activity */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <TrendingUp className="h-6 w-6 mr-3 text-blue-400" />
                                Recent Activity
                            </h2>
                            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                                <Download size={18} />
                                <span className="text-sm">Export</span>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center mr-4">
                                        <activity.icon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">Added to Favorites</div>
                                        <div className="text-sm text-gray-400">{activity.title}</div>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Movies */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <Film className="h-6 w-6 mr-3 text-purple-400" />
                            Popular Right Now
                        </h2>
                        
                        <div className="space-y-4">
                            {recentMovies.map((movie) => (
                                <div key={movie.id} className="flex items-center p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors group">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-16 h-24 object-cover rounded-lg mr-4 group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold group-hover:text-blue-300 transition-colors">
                                            {movie.title}
                                        </h4>
                                        <div className="flex items-center space-x-4 mt-2 text-sm">
                                            <span className="flex items-center text-yellow-400">
                                                <Star className="h-4 w-4 mr-1" />
                                                {movie.vote_average.toFixed(1)}
                                            </span>
                                            <span className="text-gray-400">📅 {movie.release_date}</span>
                                        </div>
                                    </div>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                                        Add to Favorites
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Stats */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Users className="h-6 w-6 mr-3 text-blue-400" />
                        Your Statistics
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalFavorites}</div>
                            <div className="text-gray-400">Movies Favorited</div>
                        </div>
                        
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-green-400 mb-2">{formatWatchTime(stats.totalWatchTime)}</div>
                            <div className="text-gray-400">Total Watch Time</div>
                        </div>
                        
                        <div className="text-center p-6 bg-gray-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.avgRating}</div>
                            <div className="text-gray-400">Average Rating Given</div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-700/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold mb-1">Account Type</h3>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full ${user.role === 'admin' 
                                    ? 'bg-red-900/30 text-red-300 border border-red-700/30' 
                                    : 'bg-blue-900/30 text-blue-300 border border-blue-700/30'
                                }`}>
                                    {user.role === 'admin' ? 'Administrator' : 'Premium User'}
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-semibold mb-1">Member Since</h3>
                                <p className="text-gray-400">
                                    {new Date(user.joinedDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
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
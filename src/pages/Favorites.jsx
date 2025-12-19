import React, { useState, useEffect } from 'react';
import { Trash2, Filter, Search, Heart } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { getMovieDetail } from '../services/api';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [filteredFavorites, setFilteredFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        filterAndSortFavorites();
    }, [favorites, searchQuery, sortBy]);

    const loadFavorites = async () => {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]');
            
            // If favorites have movie data, use it; otherwise fetch details
            const favoritesWithDetails = await Promise.all(
                savedFavorites.map(async (fav) => {
                    if (fav.id && !fav.title) {
                        // Fetch movie details if only ID is stored
                        const movieDetail = await getMovieDetail(fav.id);
                        return movieDetail || fav;
                    }
                    return fav;
                })
            );
            
            setFavorites(favoritesWithDetails.filter(fav => fav));
            setFilteredFavorites(favoritesWithDetails.filter(fav => fav));
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortFavorites = () => {
        let result = [...favorites];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(movie =>
                movie.title?.toLowerCase().includes(query) ||
                movie.overview?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'title':
                result.sort((a, b) => a.title?.localeCompare(b.title));
                break;
            case 'rating':
                result.sort((a, b) => b.vote_average - a.vote_average);
                break;
            case 'date':
                // Sort by when added to favorites (assuming we have a timestamp)
                result.sort((a, b) => b._timestamp - a._timestamp);
                break;
            default:
                break;
        }

        setFilteredFavorites(result);
    };

    const removeFavorite = (movieId) => {
        const updatedFavorites = favorites.filter(fav => fav.id !== movieId);
        setFavorites(updatedFavorites);
        localStorage.setItem('roncomovie_favorites', JSON.stringify(updatedFavorites));
    };

    const removeAllFavorites = () => {
        if (window.confirm('Are you sure you want to remove all favorites?')) {
            setFavorites([]);
            setFilteredFavorites([]);
            localStorage.removeItem('roncomovie_favorites');
        }
    };

    const toggleFavorite = (movie) => {
        removeFavorite(movie.id);
    };

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 flex items-center">
                                <Heart className="h-10 w-10 text-red-500 mr-3" />
                                My Favorites
                            </h1>
                            <p className="text-gray-400">
                                {favorites.length} movie{favorites.length !== 1 ? 's' : ''} saved
                            </p>
                        </div>
                        
                        {favorites.length > 0 && (
                            <button
                                onClick={removeAllFavorites}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                                <span>Clear All</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Search and Filter */}
                {favorites.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search in favorites..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">Recently Added</option>
                                    <option value="title">Title A-Z</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Favorites List */}
                {favorites.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
                            <Heart className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
                        <p className="text-gray-400 mb-8">
                            Start adding movies to your favorites by clicking the heart icon
                        </p>
                        <a
                            href="/movies"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Browse Movies
                        </a>
                    </div>
                ) : filteredFavorites.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No favorites match your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredFavorites.map((movie) => (
                                <div key={movie.id} className="relative">
                                    <MovieCard
                                        movie={movie}
                                        onFavoriteToggle={() => toggleFavorite(movie)}
                                        isFavorite={true}
                                    />
                                    <button
                                        onClick={() => removeFavorite(movie.id)}
                                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                                        title="Remove from favorites"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="mt-12 p-6 bg-gray-800/50 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">Your Favorites Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">{favorites.length}</div>
                                    <div className="text-gray-400">Total Movies</div>
                                </div>
                                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-400">
                                        {favorites.length > 0 
                                            ? (favorites.reduce((sum, movie) => sum + (movie.vote_average || 0), 0) / favorites.length).toFixed(1)
                                            : '0.0'
                                        }
                                    </div>
                                    <div className="text-gray-400">Average Rating</div>
                                </div>
                                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {new Set(favorites.flatMap(movie => movie.genre_ids || [])).size}
                                    </div>
                                    <div className="text-gray-400">Genres</div>
                                </div>
                                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {new Set(favorites.map(movie => movie.release_date?.substring(0, 4)).filter(Boolean)).size}
                                    </div>
                                    <div className="text-gray-400">Years</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Favorites;
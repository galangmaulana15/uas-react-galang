import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Globe, Heart, Share2, ChevronLeft } from 'lucide-react';
import { getMovieDetail, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchMovieDetail();
        checkFavorite();
    }, [id]);

    const fetchMovieDetail = async () => {
        setLoading(true);
        try {
            const data = await getMovieDetail(id);
            setMovie(data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]');
        setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
    };

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]');
        
        if (isFavorite) {
            const updatedFavorites = favorites.filter(fav => fav.id !== parseInt(id));
            localStorage.setItem('roncomovie_favorites', JSON.stringify(updatedFavorites));
        } else {
            favorites.push({ id: parseInt(id), title: movie?.title });
            localStorage.setItem('roncomovie_favorites', JSON.stringify(favorites));
        }
        
        setIsFavorite(!isFavorite);
    };

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
                <Link to="/" className="text-blue-400 hover:text-blue-300">
                    ← Back to home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            {/* Back Button */}
            <div className="container mx-auto px-4 pt-6">
                <Link
                    to="/movies"
                    className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>Back to Movies</span>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative">
                {/* Backdrop */}
                <div className="absolute inset-0 z-0">
                    {movie.backdrop_path && (
                        <img
                            src={getImageUrl(movie.backdrop_path, 'original')}
                            alt={movie.title}
                            className="w-full h-96 object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 py-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Poster */}
                        <div className="md:w-1/3">
                            <div className="rounded-xl overflow-hidden shadow-2xl">
                                <img
                                    src={getImageUrl(movie.poster_path, 'w500')}
                                    alt={movie.title}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>

                        {/* Movie Info */}
                        <div className="md:w-2/3">
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                                    <span className="flex items-center space-x-1">
                                        <Star className="h-5 w-5 text-yellow-400" />
                                        <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                        <span className="text-sm">({movie.vote_count} votes)</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Calendar className="h-5 w-5" />
                                        <span>{movie.release_date}</span>
                                    </span>
                                    {movie.runtime && (
                                        <span className="flex items-center space-x-1">
                                            <Clock className="h-5 w-5" />
                                            <span>{formatRuntime(movie.runtime)}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                {movie.trailer && (
                                    <a
                                        href={`https://www.youtube.com/watch?v=${movie.trailer.key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        <Play size={20} />
                                        <span>Watch Trailer</span>
                                    </a>
                                )}
                                
                                <button
                                    onClick={toggleFavorite}
                                    className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <Heart className={isFavorite ? 'fill-white' : ''} size={20} />
                                    <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                </button>

                                <button
                                    onClick={() => navigator.share?.({
                                        title: movie.title,
                                        text: movie.overview,
                                        url: window.location.href
                                    })}
                                    className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    <Share2 size={20} />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="mb-6">
                                <div className="flex space-x-1 border-b border-gray-700">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('cast')}
                                        className={`px-4 py-2 font-medium ${activeTab === 'cast' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Cast
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="py-6">
                                    {activeTab === 'overview' && (
                                        <div>
                                            <p className="text-lg leading-relaxed">{movie.overview}</p>
                                            
                                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-400">Status</div>
                                                    <div className="font-semibold">{movie.status}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-400">Budget</div>
                                                    <div className="font-semibold">{formatCurrency(movie.budget)}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-400">Revenue</div>
                                                    <div className="font-semibold">{formatCurrency(movie.revenue)}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-400">Language</div>
                                                    <div className="font-semibold flex items-center space-x-1">
                                                        <Globe size={16} />
                                                        <span>{movie.original_language?.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'details' && (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-lg font-semibold mb-2">Genres</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {movie.genres?.map(genre => (
                                                        <span
                                                            key={genre.id}
                                                            className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm"
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-semibold mb-2">Production Companies</h4>
                                                <div className="flex flex-wrap gap-4">
                                                    {movie.production_companies?.map(company => (
                                                        <div key={company.id} className="flex items-center space-x-2">
                                                            {company.logo_path && (
                                                                <img
                                                                    src={getImageUrl(company.logo_path, 'w92')}
                                                                    alt={company.name}
                                                                    className="h-8 object-contain"
                                                                />
                                                            )}
                                                            <span>{company.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'cast' && (
                                        <div>
                                            <h4 className="text-lg font-semibold mb-4">Top Cast</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                                {movie.cast?.slice(0, 10).map(person => (
                                                    <div key={person.id} className="text-center">
                                                        <img
                                                            src={getImageUrl(person.profile_path, 'w185')}
                                                            alt={person.name}
                                                            className="w-full h-48 object-cover rounded-lg mb-2"
                                                        />
                                                        <div className="font-semibold">{person.name}</div>
                                                        <div className="text-sm text-gray-400">{person.character}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CRUD Section for Admin */}
            {user?.role === 'admin' && (
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Admin Controls</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                Edit Movie Info
                            </button>
                            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                                Update Rating
                            </button>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                Delete Movie
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;
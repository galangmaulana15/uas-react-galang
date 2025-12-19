import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, Grid, List, ChevronLeft, ChevronRight, X, Sliders } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { getMoviesByCategory, searchMovies, getGenres } from '../services/api';

const Movies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'popular',
        sortBy: 'popularity.desc',
        year: '',
        minRating: '',
        maxRating: '',
        genre: ''
    });
    const [genres, setGenres] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    // State untuk MovieModal
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = [
        { id: 'popular', label: 'Popular', icon: '🔥' },
        { id: 'top_rated', label: 'Top Rated', icon: '⭐' },
        { id: 'upcoming', label: 'Upcoming', icon: '📅' },
        { id: 'now_playing', label: 'Now Playing', icon: '🎬' }
    ];

    const sortOptions = [
        { id: 'popularity.desc', label: 'Popularity', icon: '📈' },
        { id: 'vote_average.desc', label: 'Rating', icon: '⭐' },
        { id: 'release_date.desc', label: 'Release Date', icon: '📅' },
        { id: 'original_title.asc', label: 'Title A-Z', icon: '🔤' },
        { id: 'revenue.desc', label: 'Revenue', icon: '💰' }
    ];

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    useEffect(() => {
        fetchMovies();
        fetchGenres();
    }, [filters.category, searchQuery, page]);

    useEffect(() => {
        applyFilters();
    }, [movies, filters.sortBy, filters.year, filters.minRating, filters.maxRating, filters.genre]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            let data;
            if (searchQuery) {
                data = await searchMovies(searchQuery, page);
            } else {
                data = await getMoviesByCategory(filters.category, page);
            }
            
            setMovies(data.movies);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        const genreList = await getGenres();
        setGenres(genreList);
    };

    const applyFilters = useCallback(() => {
        let result = [...movies];

        // Apply sorting
        switch (filters.sortBy) {
            case 'popularity.desc':
                result.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'vote_average.desc':
                result.sort((a, b) => b.vote_average - a.vote_average);
                break;
            case 'release_date.desc':
                result.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
                break;
            case 'original_title.asc':
                result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'revenue.desc':
                result.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
                break;
            default:
                break;
        }

        // Apply year filter
        if (filters.year) {
            result = result.filter(movie => 
                movie.release_date && movie.release_date.startsWith(filters.year)
            );
        }

        // Apply rating filters
        if (filters.minRating) {
            result = result.filter(movie => 
                movie.vote_average >= parseFloat(filters.minRating)
            );
        }

        if (filters.maxRating) {
            result = result.filter(movie => 
                movie.vote_average <= parseFloat(filters.maxRating)
            );
        }

        // Apply genre filter
        if (filters.genre) {
            result = result.filter(movie => 
                movie.genre_ids && movie.genre_ids.includes(parseInt(filters.genre))
            );
        }

        setFilteredMovies(result);
    }, [movies, filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ search: searchQuery });
            setPage(1);
        } else {
            setSearchParams({});
        }
    };

    const handleCategoryChange = (category) => {
        setFilters(prev => ({ ...prev, category }));
        setSearchQuery('');
        setSearchParams({ category });
        setPage(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            category: filters.category,
            sortBy: 'popularity.desc',
            year: '',
            minRating: '',
            maxRating: '',
            genre: ''
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleOpenModal = (movieId) => {
        setSelectedMovieId(movieId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovieId(null);
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((query) => {
            setSearchQuery(query);
            setPage(1);
        }, 500),
        []
    );

    const activeFiltersCount = Object.values(filters).filter(
        (val, key) => key !== 'category' && val !== '' && val !== 'popularity.desc'
    ).length;

    return (
        <div className="min-h-screen text-white py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Movie Library
                    </h1>
                    <p className="text-gray-400 text-lg">Discover amazing movies from around the world</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                    placeholder="Search for movies, actors, or genres..."
                                    className="w-full pl-12 pr-24 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${filters.category === cat.id 
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                        : 'bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50'
                                    }`}
                                >
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Filters and View Toggle */}
                        <div className="flex items-center space-x-4">
                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-700/50 transition-all duration-300 group"
                            >
                                <Sliders className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                <span>Filters</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* View Toggle */}
                            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-xl p-1 border border-gray-700/50">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' 
                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' 
                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters (Collapsible) */}
                    {showFilters && (
                        <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/30 animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Filter className="h-5 w-5 mr-2 text-blue-400" />
                                    Advanced Filters
                                </h3>
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                    <span>Clear All</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sort By
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.icon} {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <Filter size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Release Year
                                    </label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2025"
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        placeholder="Filter by year"
                                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Rating Range */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Rating Range
                                    </label>
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={filters.minRating}
                                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                                placeholder="Min"
                                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={filters.maxRating}
                                                onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                                                placeholder="Max"
                                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Genre */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Genre
                                    </label>
                                    <select
                                        value={filters.genre}
                                        onChange={(e) => handleFilterChange('genre', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Genres</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-gray-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <p className="mt-6 text-gray-400">Loading movies...</p>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-gray-400">
                                Showing <span className="text-white font-semibold">{filteredMovies.length}</span> movies
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                            {activeFiltersCount > 0 && (
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-400">{activeFiltersCount} active filters</span>
                                    <button
                                        onClick={clearFilters}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Movies Grid/List */}
                        <div className={viewMode === 'grid' 
                            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                            : 'space-y-4'
                        }>
                            {filteredMovies.map((movie) => (
                                viewMode === 'grid' ? (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                        onQuickView={() => handleOpenModal(movie.id)}
                                    />
                                ) : (
                                    <div
                                        key={movie.id}
                                        className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/80 border border-gray-700/30 transition-all duration-300 group"
                                    >
                                        <div className="relative overflow-hidden rounded-lg w-24 h-36 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                            <img
                                                src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <h3 className="text-xl font-semibold group-hover:text-blue-300 transition-colors mb-2">
                                                {movie.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm line-clamp-2 mb-3">{movie.overview}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className="flex items-center">
                                                    ⭐ <span className="ml-1 font-medium">{movie.vote_average.toFixed(1)}</span>
                                                </span>
                                                <span className="text-gray-400">🗓️ {movie.release_date}</span>
                                                <span className="text-gray-400">👥 {movie.vote_count} votes</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center space-y-2">
                                            <button
                                                onClick={() => handleOpenModal(movie.id)}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                                            >
                                                Quick View
                                            </button>
                                            <a
                                                href={`/movie/${movie.id}`}
                                                className="text-gray-400 hover:text-white text-sm transition-colors"
                                            >
                                                Full Details →
                                            </a>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-12">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className={`p-2.5 rounded-xl transition-all duration-300 ${page === 1 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-800' 
                                        : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'
                                    }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex items-center space-x-2">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg transition-all duration-300 ${page === pageNum 
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    {totalPages > 5 && page < totalPages - 2 && (
                                        <>
                                            <span className="text-gray-400">...</span>
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className={`w-10 h-10 rounded-lg transition-all duration-300 ${page === totalPages 
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className={`p-2.5 rounded-xl transition-all duration-300 ${page === totalPages 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-800' 
                                        : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'
                                    }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* No Results */}
                        {filteredMovies.length === 0 && !loading && (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-6 border border-gray-700/30">
                                    🎬
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No movies found</h3>
                                <p className="text-gray-400 mb-8">
                                    Try adjusting your search or filters
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MovieModal */}
            <MovieModal
                movieId={selectedMovieId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Movies;
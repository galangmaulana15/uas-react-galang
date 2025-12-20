import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Star, Calendar, Heart, ChevronLeft, ChevronRight, Film, Clock, Zap } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { getMoviesByCategory } from '../services/api';


const Home = () => {
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // State untuk MovieModal
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [favorites, setFavorites] = useState([]);

    const carouselRef = useRef(null);
    const totalSlides = 4;

    // Load favorites saat component mount
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]');
        setFavorites(savedFavorites);
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const [popularData, topRatedData, upcomingData, nowPlayingData] = await Promise.all([
                    getMoviesByCategory('popular'),
                    getMoviesByCategory('top_rated'),
                    getMoviesByCategory('upcoming'),
                    getMoviesByCategory('now_playing')
                ]);

                setPopularMovies(popularData.movies.slice(0, 16));
                setTopRatedMovies(topRatedData.movies.slice(0, 8));
                setUpcomingMovies(upcomingData.movies.slice(1,5));
                setNowPlayingMovies(nowPlayingData.movies.slice(0, 8));
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();

        // Auto slide carousel
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    }, [currentSlide]);

    // FIXED: toggleFavorite function
    const toggleFavorite = (movie) => {
        // 1. Baca dari localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('roncomovie_favorites') || '[]');
        
        // 2. Cek apakah sudah favorite
        const isCurrentlyFavorite = savedFavorites.some(fav => fav.id === movie.id);
        
        let updatedFavorites;
        
        if (isCurrentlyFavorite) {
            // Hapus dari favorites
            updatedFavorites = savedFavorites.filter(fav => fav.id !== movie.id);
        } else {
            // Tambah ke favorites dengan data lengkap
            const movieWithDetails = {
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                backdrop_path: movie.backdrop_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview,
                genre_ids: movie.genre_ids || [],
                _timestamp: Date.now(),
                _addedDate: new Date().toISOString()
            };
            
            updatedFavorites = [...savedFavorites, movieWithDetails];
        }
        
        // 3. Simpan ke localStorage
        localStorage.setItem('roncomovie_favorites', JSON.stringify(updatedFavorites));
        
        // 4. Update state
        setFavorites(updatedFavorites);
        
        // Return status baru
        return !isCurrentlyFavorite;
    };

    const isFavorite = (movieId) => {
        return favorites.some(fav => fav.id === movieId);
    };

    // Fungsi untuk membuka modal
    const handleOpenModal = (movieId) => {
        setSelectedMovieId(movieId);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovieId(null);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-500 opacity-75"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Hero Section dengan Background Dinamis */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/20 to-pink-900/40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black"></div>
                    
                    {/* Floating movie posters background */}
                    <div className="absolute inset-0 opacity-10">
                        {popularMovies.slice(0, 9).map((movie, index) => (
                            <div
                                key={`bg-${movie.id}`}
                                className="absolute w-48 h-64 rounded-lg overflow-hidden animate-float"
                                style={{
                                    left: `${10 + (index * 10)}%`,
                                    top: `${15 + (index * 8)}%`,
                                    animationDelay: `${index * 2}s`,
                                    animationDuration: `${20 + index * 5}s`
                                }}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="container mx-auto relative z-10">
                    <div className="max-w-3xl animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Welcome to <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">RoncoMovie</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 animate-fade-in-up animation-delay-300">
                            Discover the best movies, track your favorites, and stay updated with the latest releases.
                        </p>
                        <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-500">
                            <Link
                                to="/movies"
                                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <Play size={20} className="group-hover:animate-pulse" />
                                <span>Browse Movies</span>
                            </Link>
                            <Link
                                to="/favorites"
                                className="group inline-flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 border border-gray-700 hover:border-gray-600"
                            >
                                <Heart size={20} className="group-hover:text-red-400 transition-colors" />
                                <span>My Favorites</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Now Carousel - 12 Movies */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-3 group">
                            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                Trending Now
                            </h2>
                        </div>
                        <Link
                            to="/movies?category=popular"
                            className="group flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                            <span>View All ({popularMovies.length})</span>
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                    
                    {/* Carousel Container */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900/50 to-black/50 p-6 backdrop-blur-sm border border-gray-800 mb-12">
                        <div 
                            className="flex transition-transform duration-500 ease-out"
                            ref={carouselRef}
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {[0, 1, 2, 3].map((slideIndex) => (
                                <div key={slideIndex} className="flex-shrink-0 w-full">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {popularMovies.slice(slideIndex * 3, slideIndex * 3 + 3).map((movie) => (
                                            <div 
                                                key={movie.id} 
                                                className="group cursor-pointer animate-fade-in"
                                                onClick={() => handleOpenModal(movie.id)}
                                            >
                                                <div className="relative overflow-hidden rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                        alt={movie.title}
                                                        className="w-full h-96 object-cover transform transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform transition-all duration-300 group-hover:translate-y-0">
                                                        <h3 className="text-xl font-bold mb-1 truncate">{movie.title}</h3>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Star className="h-4 w-4 text-yellow-400" />
                                                                <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                                            </div>
                                                            <span className="text-gray-300 text-sm">{movie.release_date.split('-')[0]}</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 right-4 z-20">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(movie);
                                                            }}
                                                            className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-red-500/20 transition-colors"
                                                        >
                                                            <Heart 
                                                                size={20} 
                                                                className={isFavorite(movie.id) ? "fill-red-500 text-red-500" : "text-white"}
                                                            />
                                                        </button>
                                                    </div>
                                                    <div className="absolute top-4 left-4 z-20">
                                                        <span className="bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            #{slideIndex * 3 + popularMovies.slice(slideIndex * 3, slideIndex * 3 + 3).findIndex(m => m.id === movie.id) + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Preview untuk film ke-4 di desktop */}
                                        <div className="hidden lg:block">
                                            {popularMovies[slideIndex * 3 + 3] && (
                                                <div 
                                                    className="group cursor-pointer animate-fade-in"
                                                    onClick={() => handleOpenModal(popularMovies[slideIndex * 3 + 3].id)}
                                                >
                                                    <div className="relative overflow-hidden rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w500${popularMovies[slideIndex * 3 + 3].poster_path}`}
                                                            alt={popularMovies[slideIndex * 3 + 3].title}
                                                            className="w-full h-96 object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <h3 className="text-lg font-bold truncate">{popularMovies[slideIndex * 3 + 3].title}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Carousel Controls */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all z-30"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all z-30"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                        
                        {/* Carousel Indicators */}
                        <div className="flex justify-center space-x-2 mt-6">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentSlide === index 
                                            ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500' 
                                            : 'w-2 bg-gray-600 hover:bg-gray-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 2 Baris Film di Bawah Carousel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {popularMovies.slice(12, 20).map((movie, index) => (
                            <div key={movie.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <MovieCard
                                    movie={movie}
                                    onFavoriteToggle={toggleFavorite}
                                    isFavorite={isFavorite(movie.id)}
                                    onQuickView={() => handleOpenModal(movie.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Now Playing & Top Rated */}
            <section className="py-16 px-4 bg-gradient-to-b from-gray-900/30 to-black/30">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* Now Playing */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3 group">
                                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                        <Film className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Now Playing in Theaters</h3>
                                </div>
                                <Link to="/movies?category=now_playing" className="text-green-400 hover:text-green-300 text-sm transition-colors">
                                    See More →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {nowPlayingMovies.map((movie, index) => (
                                    <div
                                        key={movie.id}
                                        className="group bg-gray-900/50 rounded-xl overflow-hidden hover:bg-gray-800/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                                        onClick={() => handleOpenModal(movie.id)}
                                    >
                                        <div className="flex">
                                            <div className="w-1/3">
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="w-2/3 p-4">
                                                <h4 className="font-bold mb-1 truncate group-hover:text-green-300 transition-colors">{movie.title}</h4>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400">{movie.release_date}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2">{movie.overview}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Rated */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3 group">
                                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Top Rated of All Time</h3>
                                </div>
                                <Link to="/movies?category=top_rated" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
                                    See More →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {topRatedMovies.map((movie, index) => (
                                    <div
                                        key={movie.id}
                                        className="group bg-gray-900/50 rounded-xl overflow-hidden hover:bg-gray-800/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                                        onClick={() => handleOpenModal(movie.id)}
                                    >
                                        <div className="flex">
                                            <div className="w-1/3 relative">
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                                    #{index + 1}
                                                </div>
                                            </div>
                                            <div className="w-2/3 p-4">
                                                <h4 className="font-bold mb-1 truncate group-hover:text-yellow-300 transition-colors">{movie.title}</h4>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span className="text-sm font-bold">{movie.vote_average.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400">{movie.vote_count} votes</span>
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2">{movie.overview}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Movies */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3 group">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold">Coming Soon</h3>
                        </div>
                        <Link to="/movies?category=upcoming" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                            View All Upcoming →
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {upcomingMovies.map((movie, index) => (
                            <div 
                                key={movie.id} 
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-[1.02]"
                                onClick={() => handleOpenModal(movie.id)}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h4 className="font-bold text-lg truncate">{movie.title}</h4>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{movie.release_date}</span>
                                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                                                Coming Soon
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Star className="h-4 w-4 text-yellow-400" />
                                        <span>{movie.vote_average.toFixed(1)}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2">{movie.overview || 'Synopsis coming soon...'}</p>
                                    <button 
                                        className="mt-4 w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors text-sm font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenModal(movie.id);
                                        }}
                                    >
                                        More Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-12 px-4 bg-gradient-to-r from-gray-900/50 to-black/50">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 p-6 rounded-2xl text-center backdrop-blur-sm border border-blue-800/50">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                {popularMovies.length}+
                            </div>
                            <div className="text-gray-300 mt-2">Popular Movies</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 p-6 rounded-2xl text-center backdrop-blur-sm border border-purple-800/50">
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {topRatedMovies.length}+
                            </div>
                            <div className="text-gray-300 mt-2">Top Rated</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/30 to-green-700/30 p-6 rounded-2xl text-center backdrop-blur-sm border border-green-800/50">
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                {upcomingMovies.length}+
                            </div>
                            <div className="text-gray-300 mt-2">Coming Soon</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/30 to-red-700/30 p-6 rounded-2xl text-center backdrop-blur-sm border border-red-800/50">
                            <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                {nowPlayingMovies.length}+
                            </div>
                            <div className="text-gray-300 mt-2">In Theaters</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MovieModal */}
            <MovieModal
                movieId={selectedMovieId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFavoriteToggle={toggleFavorite}
                isFavorite={selectedMovieId ? isFavorite(selectedMovieId) : false}
            />

            {/* Global CSS untuk animasi */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    33% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                    66% {
                        transform: translateY(20px) rotate(-5deg);
                    }
                }
                
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-float {
                    animation: float infinite ease-in-out;
                }
                
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                .animation-delay-300 {
                    animation-delay: 300ms;
                }
                
                .animation-delay-500 {
                    animation-delay: 500ms;
                }
                
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
                
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
                
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
};

export default Home;
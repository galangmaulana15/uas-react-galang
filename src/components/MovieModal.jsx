// Mengimpor modul React dan hook yang diperlukan
import React, { useState, useEffect } from 'react';
// Mengimpor Link untuk navigasi internal React Router
import { Link } from 'react-router-dom';
// Mengimpor ikon-ikon dari library lucide-react
import { X, Play, Star, Clock, Calendar, Heart, Share2, Globe, Users, Video, ExternalLink } from 'lucide-react';
// Mengimpor fungsi API dari service
import { getMovieDetail, getImageUrl } from '../services/api';

// Komponen Modal untuk menampilkan detail film
const MovieModal = ({ movieId, isOpen, onClose, onFavoriteToggle, isFavorite }) => {
    // ================================
    // STATE MANAGEMENT
    // ================================
    const [movie, setMovie] = useState(null);           // State untuk data film
    const [loading, setLoading] = useState(false);      // State untuk status loading
    const [activeTab, setActiveTab] = useState('overview'); // State untuk tab aktif
    const [trailerPlaying, setTrailerPlaying] = useState(false); // State untuk trailer

    // ================================
    // EFFECT UNTUK FETCH DATA
    // ================================
    
    // Effect untuk mengambil detail film ketika modal dibuka
    useEffect(() => {
        if (isOpen && movieId) {
            fetchMovieDetails();
        }
    }, [isOpen, movieId]);

    // Effect untuk mengatur scroll body dan event listener ESC
    useEffect(() => {
        // Mencegah scroll pada body saat modal terbuka
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Menutup modal saat tombol ESC ditekan
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        // Menambahkan event listener
        window.addEventListener('keydown', handleEsc);
        
        // Cleanup function untuk menghapus event listener
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // ================================
    // FUNGSI UTILITAS
    // ================================
    
    // Fungsi untuk mengambil detail film dari API
    const fetchMovieDetails = async () => {
        if (!movieId) return;
        
        setLoading(true);
        try {
            const data = await getMovieDetail(movieId);
            setMovie(data);
        } catch (error) {
            console.error('Error fetching movie details for modal:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani toggle favorit
    const handleFavoriteToggle = () => {
        if (!movie) return;
        
        if (onFavoriteToggle) {
            onFavoriteToggle(movie);
        }
    };

    // Fungsi untuk berbagi film
    const handleShare = () => {
        // Menggunakan Web Share API jika tersedia
        if (navigator.share && movie) {
            navigator.share({
                title: movie.title,
                text: movie.overview,
                url: window.location.href,
            });
        } else {
            // Fallback: copy ke clipboard
            navigator.clipboard.writeText(`${movie.title} - ${window.location.origin}/movie/${movie.id}`);
            alert('Link copied to clipboard!');
        }
    };

    // Fungsi untuk memformat durasi film dari menit ke format jam:menit
    const formatRuntime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Fungsi untuk memformat mata uang (USD)
    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Fungsi untuk menutup modal saat klik di luar konten modal
    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Jika modal tidak terbuka, tidak merender apa-apa
    if (!isOpen) return null;

    return (
        // Overlay modal
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={handleClose}
        >
            {/* Kontainer utama modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
                {/* Tombol tutup */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                {/* Kondisional rendering: loading, data film, atau error */}
                {loading ? (
                    // Tampilan loading
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : movie ? (
                    // Konten ketika data film tersedia
                    <div className="overflow-y-auto max-h-[90vh]">
                        {/* Section hero dengan backdrop */}
                        <div className="relative h-64 sm:h-80">
                            <div className="absolute inset-0">
                                {/* Backdrop image atau fallback gradient */}
                                {movie.backdrop_path ? (
                                    <img
                                        src={getImageUrl(movie.backdrop_path, 'w1280')}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
                                )}
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                            </div>
                            
                            {/* Info film di atas backdrop */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                                    {/* Poster film */}
                                    <div className="w-32 h-48 sm:w-40 sm:h-60 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                                        <img
                                            src={getImageUrl(movie.poster_path, 'w500')}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    
                                    {/* Judul dan info dasar */}
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                            {movie.title}
                                        </h2>
                                        {/* Rating, durasi, tanggal rilis, bahasa */}
                                        <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                                <span className="font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                                                <span className="text-sm">({movie.vote_count || 0})</span>
                                            </div>
                                            {movie.runtime && (
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-5 w-5" />
                                                    <span>{formatRuntime(movie.runtime)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-5 w-5" />
                                                <span>{movie.release_date || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Globe className="h-5 w-5" />
                                                <span className="uppercase">{movie.original_language || 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Tombol aksi */}
                                        <div className="flex flex-wrap gap-3">
                                            {/* Tombol trailer jika tersedia */}
                                            {movie.trailer && movie.trailer.key && ( // PERBAIKAN: Cek keberadaan trailer
                                                <button
                                                    onClick={() => setTrailerPlaying(true)}
                                                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    <Play size={20} />
                                                    <span>Watch Trailer</span>
                                                </button>
                                            )}
                                            
                                            {/* Tombol favorit */}
                                            <button
                                                onClick={handleFavoriteToggle}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                                            >
                                                <Heart className={isFavorite ? 'fill-white' : ''} size={20} />
                                                <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                            </button>
                                            
                                            {/* Tombol share */}
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <Share2 size={20} />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab konten */}
                        <div className="p-6">
                            {/* Navigasi tab */}
                            <div className="flex space-x-1 border-b border-gray-700 mb-6">
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

                            {/* Isi konten tab */}
                            <div className="min-h-[200px]">
                                {/* Tab Overview */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-4 text-white">Overview</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {movie.overview || 'No description available.'}
                                        </p>
                                        
                                        {/* Tagline film */}
                                        {movie.tagline && (
                                            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
                                                <p className="italic text-gray-300">"{movie.tagline}"</p>
                                            </div>
                                        )}
                                        
                                        {/* Grid info statistik */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Status</div>
                                                <div className="font-semibold text-white">{movie.status || 'N/A'}</div>
                                            </div>
                                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Budget</div>
                                                <div className="font-semibold text-white">{formatCurrency(movie.budget)}</div>
                                            </div>
                                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Revenue</div>
                                                <div className="font-semibold text-white">{formatCurrency(movie.revenue)}</div>
                                            </div>
                                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Popularity</div>
                                                <div className="font-semibold text-white">{movie.popularity?.toFixed(0) || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Details */}
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        {/* Genre */}
                                        <div>
                                            <h3 className="text-xl font-bold mb-3 text-white">Genres</h3>
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

                                        {/* Perusahaan produksi */}
                                        <div>
                                            <h3 className="text-xl font-bold mb-3 text-white">Production Companies</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {movie.production_companies?.map(company => (
                                                    <div key={company.id} className="flex items-center space-x-2">
                                                        {company.logo_path && (
                                                            <img
                                                                src={getImageUrl(company.logo_path, 'w92')}
                                                                alt={company.name}
                                                                className="h-8 object-contain"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <span className="text-gray-300">{company.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bahasa */}
                                        <div>
                                            <h3 className="text-xl font-bold mb-3 text-white">Spoken Languages</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.spoken_languages?.map(lang => (
                                                    <span
                                                        key={lang.iso_639_1}
                                                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                                                    >
                                                        {lang.english_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Cast */}
                                {activeTab === 'cast' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-white">Top Cast</h3>
                                            <span className="text-gray-400 text-sm">
                                                {movie.cast?.length || 0} members
                                            </span>
                                        </div>
                                        
                                        {/* Grid untuk anggota cast */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {movie.cast?.slice(0, 10).map(person => (
                                                <div key={person.id} className="text-center group">
                                                    <div className="relative mb-2 overflow-hidden rounded-lg">
                                                        <img
                                                            src={getImageUrl(person.profile_path, 'w185')}
                                                            alt={person.name}
                                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                        {person.name}
                                                    </div>
                                                    <div className="text-sm text-gray-400 truncate">
                                                        {person.character}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Tombol lihat semua cast jika lebih dari 10 */}
                                        {movie.cast?.length > 10 && (
                                            <div className="text-center mt-6">
                                                <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                    View Full Cast ({movie.cast.length} members)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* PERBAIKAN: Ganti <a> dengan <Link> untuk navigasi internal */}
                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <Link
                                    to={`/movie/${movie.id}`}
                                    className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    <ExternalLink size={20} />
                                    <span>View Full Movie Details</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Tampilan ketika data film tidak ditemukan
                    <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
                        <Video className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Movie Not Found</h3>
                        <p className="text-gray-400">Unable to load movie details. Please try again.</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Close Modal
                        </button>
                    </div>
                )}
            </div>

            {/* Modal untuk trailer YouTube */}
            {trailerPlaying && movie?.trailer?.key && ( // PERBAIKAN: Cek keberadaan trailer.key
                <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/90 p-4 animate-fadeIn">
                    <div className="relative w-full max-w-4xl">
                        <button
                            onClick={() => setTrailerPlaying(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            aria-label="Close trailer"
                        >
                            <X size={30} />
                        </button>
                        
                        {/* Container iframe dengan aspect ratio 16:9 */}
                        <div className="relative pt-[56.25%]">
                            {/* PERBAIKAN: Hapus autoplay=1 untuk menghindari policy violations */}
                            <iframe
                                src={`https://www.youtube.com/embed/${movie.trailer.key}?rel=0`}
                                title={`${movie.title} Trailer`}
                                className="absolute inset-0 w-full h-full rounded-lg"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                sandbox="allow-same-origin allow-scripts allow-popups" // PERBAIKAN: Tambah sandbox untuk keamanan
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Export komponen
export default MovieModal;
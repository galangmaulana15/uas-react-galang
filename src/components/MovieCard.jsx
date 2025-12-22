import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, Play } from 'lucide-react';
import { getImageUrl } from '../services/api';

const MovieCard = ({ movie, onFavoriteToggle, isFavorite, onQuickView }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onQuickView) {
            onQuickView();
        }
    };

const handleFavorite = () => {
  onFavoriteToggle && onFavoriteToggle(movie)
}
    return (
        <div 
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isHovered ? 'animate-pulse-slow' : ''}`}></div>
            
            {/* Movie Poster with 3D Effect */}
            <div className="relative h-80 overflow-hidden">
                {imageError ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700/80 to-gray-900/80 flex flex-col items-center justify-center p-4">
                        <div className="text-4xl mb-4">🎬</div>
                        <div className="text-center">
                            <h3 className="font-bold text-white mb-1 truncate px-2">{movie.title}</h3>
                            <p className="text-gray-400 text-sm">No image available</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Main Poster with Zoom Effect */}
                        <img
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            onError={handleImageError}
                            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`}
                        />
                        
                        {/* Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-80'}`}></div>
                        
                        {/* Floating Elements on Hover */}
                        <div className={`absolute inset-0 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            {/* Floating Particles */}
                            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
                            <div className="absolute top-8 right-8 w-3 h-3 bg-purple-400 rounded-full animate-float-delay"></div>
                            <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float-delay-2"></div>
                            
                            {/* Play Button */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-ping-slow"></div>
                                    <button className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 group/play">
                                        <Play className="h-8 w-8 text-white ml-1 group-hover/play:scale-110 transition-transform duration-300" fill="white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-600/90 to-blue-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg">
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg">
                        {movie.release_date?.substring(0, 4) || 'N/A'}
                    </div>
                </div>
                
                {/* Favorite Button */}
                <button
                    onClick={handleFavorite}
                    className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg ${isFavorite 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white scale-110' 
                        : 'bg-gray-900/80 text-gray-300 hover:bg-red-500/20 hover:text-red-400 hover:scale-110'
                    }`}
                >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Movie Info with Slide-up Effect */}
            <div className={`p-5 transition-all duration-500 ${isHovered ? 'bg-gray-800/90 backdrop-blur-sm' : ''}`}>
                <h3 className="font-bold text-lg text-white truncate mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    {movie.title}
                </h3>
                
                {/* Rating and Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.round(movie.vote_average / 2) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-200">
                            {movie.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                    </div>
                    <span className="text-sm text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                        {movie.release_date?.substring(0, 4) || 'N/A'}
                    </span>
                </div>

                {/* Description with Expand on Hover */}
                <p className={`text-gray-300 text-sm mb-5 transition-all duration-500 ${isHovered ? 'line-clamp-3' : 'line-clamp-2'}`}>
                    {movie.overview || 'No description available.'}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleQuickView}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group/quickview"
                    >
                        <Eye className="h-4 w-4 group-hover/quickview:scale-110 transition-transform duration-300" />
                        <span className="text-sm font-medium">Quick View</span>
                    </button>
                    
                    <Link
                        to={`/movie/${movie.id}`}
                        className="text-gray-400 hover:text-white text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center group/details"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Details
                        <svg className="w-4 h-4 ml-1 transform group-hover/details:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Bottom Glow Effect */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
};


export default MovieCard;
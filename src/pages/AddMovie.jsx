import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, Calendar, Clock, Star, Globe } from 'lucide-react';
import { validateMovieForm } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

const AddMovie = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rating: '',
        releaseDate: '',
        runtime: '',
        language: 'en',
        genres: [],
        poster: null
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    
    const { user } = useAuth();
    const navigate = useNavigate();

    const genreOptions = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleGenreToggle = (genreId) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId]
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, poster: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, poster: null }));
        setPreviewUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateMovieForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Create movie object
            const newMovie = {
                id: Date.now(),
                title: formData.title,
                overview: formData.description,
                vote_average: parseFloat(formData.rating),
                release_date: formData.releaseDate,
                runtime: parseInt(formData.runtime),
                original_language: formData.language,
                genre_ids: formData.genres,
                poster_path: '/placeholder.jpg', // In real app, upload to server
                backdrop_path: '/backdrop.jpg',
                popularity: 50,
                vote_count: 0,
                _timestamp: Date.now(),
                _userAdded: user?.email
            };

            // Save to localStorage (simulating database)
            const existingMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
            localStorage.setItem('user_movies', JSON.stringify([...existingMovies, newMovie]));

            alert('Movie added successfully!');
            navigate('/movies');
        } catch (error) {
            alert('Error adding movie. Please try again.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            rating: '',
            releaseDate: '',
            runtime: '',
            language: 'en',
            genres: [],
            poster: null
        });
        setErrors({});
        setPreviewUrl('');
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="text-gray-400">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Add New Movie</h1>
                        <p className="text-gray-400">Fill in the details below to add a new movie to the collection</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Movie Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-gray-900 border ${errors.title ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        placeholder="Enter movie title"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Rating (0-10) *
                                    </label>
                                    <div className="relative">
                                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-400" />
                                        <input
                                            type="number"
                                            name="rating"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={formData.rating}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${errors.rating ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="8.5"
                                        />
                                    </div>
                                    {errors.rating && (
                                        <p className="mt-1 text-sm text-red-400">{errors.rating}</p>
                                    )}
                                </div>

                                {/* Release Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Release Date *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="releaseDate"
                                            value={formData.releaseDate}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${errors.releaseDate ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        />
                                    </div>
                                    {errors.releaseDate && (
                                        <p className="mt-1 text-sm text-red-400">{errors.releaseDate}</p>
                                    )}
                                </div>

                                {/* Runtime */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Runtime (minutes)
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="runtime"
                                            min="1"
                                            value={formData.runtime}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="120"
                                        />
                                    </div>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Language
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                        >
                                            <option value="en">English</option>
                                            <option value="id">Indonesian</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="ja">Japanese</option>
                                            <option value="ko">Korean</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className={`w-full px-4 py-3 bg-gray-900 border ${errors.description ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="Enter movie description..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Genres</h2>
                            <div className="flex flex-wrap gap-3">
                                {genreOptions.map((genre) => (
                                    <button
                                        type="button"
                                        key={genre.id}
                                        onClick={() => handleGenreToggle(genre.id)}
                                        className={`px-4 py-2 rounded-full transition-colors ${formData.genres.includes(genre.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Poster Upload */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Movie Poster</h2>
                            
                            {previewUrl ? (
                                <div className="relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-64 h-96 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
                                    <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <div className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors">
                                            <Upload size={20} />
                                            <span>Upload Poster Image</span>
                                        </div>
                                    </label>
                                    <p className="text-gray-400 mt-4 text-sm">
                                        Recommended: 500x750px, JPEG or PNG
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Reset Form
                            </button>
                            
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/movies')}
                                    className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Adding Movie...
                                        </div>
                                    ) : (
                                        'Add Movie'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMovie;
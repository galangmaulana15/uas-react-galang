const API_KEY = 'c9ee16d63e6fc68fe4b8f2e4b7aedf5a';
const BASE_URL = 'https://api.themoviedb.org/3';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p';

// Fungsi utama yang dapat mengambil data berdasarkan kategori
export const getMoviesByCategory = async (category, page = 1) => {
    const endpoint = `/movie/${category}`;
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${category} movies`);
        }
        const data = await response.json();
        return {
            movies: data.results,
            totalPages: data.total_pages
        };
    } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
        throw error;
    }
};

// Fungsi untuk mencari film
export const searchMovies = async (query, page = 1) => {
    if (!query.trim()) return { movies: [], totalPages: 0 };
    
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
        );
        if (!response.ok) {
            throw new Error('Search failed');
        }
        const data = await response.json();
        return {
            movies: data.results,
            totalPages: data.total_pages
        };
    } catch (error) {
        console.error("Error searching movies:", error);
        return { movies: [], totalPages: 0 };
    }
};

// Fungsi untuk detail film
export const getMovieDetail = async (movieId) => {
    try {
        const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
            fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
        ]);

        if (!movieResponse.ok) {
            throw new Error('Failed to fetch movie details');
        }

        const movie = await movieResponse.json();
        const credits = await creditsResponse.json();
        const videos = await videosResponse.json();

        // Cari trailer
        const trailer = videos.results?.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        return {
            ...movie,
            cast: credits.cast?.slice(0, 10) || [],
            trailer: trailer || null
        };
    } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error);
        return null;
    }
};

// Fungsi untuk mendapatkan gambar
export const getImageUrl = (path, size = 'w500') => {
    return path ? `${BASE_IMAGE_URL}/${size}${path}` : '/placeholder.jpg';
};

// Fungsi untuk genre
export const getGenres = async () => {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.genres || [];
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
};
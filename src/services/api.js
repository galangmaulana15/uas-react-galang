// Konstanta untuk API key (kunci akses ke TMDB API)
const API_KEY = 'c9ee16d63e6fc68fe4b8f2e4b7aedf5a';
// Base URL untuk endpoint API TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
// Base URL untuk gambar dari TMDB
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p';

// Fungsi utama yang dapat mengambil data berdasarkan kategori
export const getMoviesByCategory = async (category, page = 1) => {
    // Endpoint berdasarkan kategori (popular, top_rated, upcoming, now_playing)
    const endpoint = `/movie/${category}`;
    
    try {
        // Fetch data dari API TMDB dengan parameter page dan API key
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`);
        // Cek jika response tidak OK (status code bukan 200-299)
        if (!response.ok) {
            throw new Error(`Failed to fetch ${category} movies`);
        }
        // Parse response JSON
        const data = await response.json();
        // Return objek berisi movies array dan total pages
        return {
            movies: data.results,
            totalPages: data.total_pages
        };
    } catch (error) {
        // Log error jika terjadi
        console.error(`Error fetching ${category} movies:`, error);
        throw error;
    }
};

// Fungsi untuk mencari film berdasarkan query
export const searchMovies = async (query, page = 1) => {
    // Jika query kosong, return array kosong
    if (!query.trim()) return { movies: [], totalPages: 0 };
    
    try {
        // Fetch data pencarian dari API TMDB
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
        );
        // Cek jika response tidak OK
        if (!response.ok) {
            throw new Error('Search failed');
        }
        // Parse response JSON
        const data = await response.json();
        // Return objek berisi movies array dan total pages
        return {
            movies: data.results,
            totalPages: data.total_pages
        };
    } catch (error) {
        // Log error dan return array kosong jika terjadi error
        console.error("Error searching movies:", error);
        return { movies: [], totalPages: 0 };
    }
};

// Fungsi untuk mendapatkan detail film lengkap berdasarkan movie ID
export const getMovieDetail = async (movieId) => {
    try {
        // Mengambil 3 data sekaligus: detail film, kredit (cast), dan video (trailer)
        const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
            fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
        ]);

        // Cek jika response detail film tidak OK
        if (!movieResponse.ok) {
            throw new Error('Failed to fetch movie details');
        }

        // Parse semua response JSON
        const movie = await movieResponse.json();
        const credits = await creditsResponse.json();
        const videos = await videosResponse.json();

        // Cari trailer di antara video yang tersedia
        const trailer = videos.results?.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        // Return objek gabungan yang berisi detail film, 10 cast pertama, dan trailer
        return {
            ...movie,
            cast: credits.cast?.slice(0, 10) || [],
            trailer: trailer || null
        };
    } catch (error) {
        // Log error jika terjadi
        console.error(`Error fetching movie ${movieId}:`, error);
        return null;
    }
};

// Fungsi untuk mendapatkan URL gambar dengan ukuran tertentu
export const getImageUrl = (path, size = 'w500') => {
    // Jika path ada, kembalikan URL lengkap, jika tidak kembalikan placeholder
    return path ? `${BASE_IMAGE_URL}/${size}${path}` : '/placeholder.jpg';
};

// Fungsi untuk mendapatkan daftar genre film
export const getGenres = async () => {
    try {
        // Fetch daftar genre dari API TMDB
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        // Return array genre atau array kosong jika tidak ada
        return data.genres || [];
    } catch (error) {
        // Log error dan return array kosong jika terjadi error
        console.error("Error fetching genres:", error);
        return [];
    }
};
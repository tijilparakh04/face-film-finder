
import { Film } from "lucide-react";
import { parseCSV, csvRowsToObjects } from "./csvParser";

// Types for the TMDB dataset
export interface Movie {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  status: string;
  release_date: string;
  revenue: number;
  runtime: number;
  adult: boolean;
  backdrop_path: string;
  budget: number;
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  tagline: string;
  genres: string[];
  production_companies: string[];
  production_countries: string[];
  spoken_languages: string[];
  keywords: string[];
  year?: number; // Extracted from release_date
  rating?: number; // Normalized rating (0-5 scale)
  score?: number; // Used for recommendation scoring
}

// Genre and keyword mappings for different emotions
const emotionGenreMappings: Record<string, string[]> = {
  happy: ['Comedy', 'Animation', 'Adventure', 'Romance', 'Musical', 'Family'],
  sad: ['Drama', 'Romance', 'War', 'Film-Noir'],
  angry: ['Action', 'Crime', 'Thriller', 'War'],
  disgust: ['Horror', 'Thriller', 'Crime'],
  fear: ['Horror', 'Thriller', 'Mystery', 'Science Fiction'],
  surprise: ['Science Fiction', 'Fantasy', 'Mystery', 'Adventure'],
  neutral: ['Documentary', 'Drama', 'Adventure', 'Fantasy']
};

// Keywords that might indicate certain emotional responses
const emotionKeywordMappings: Record<string, string[]> = {
  happy: ['funny', 'comedy', 'joy', 'happiness', 'love', 'friendship', 'uplifting', 'heartwarming'],
  sad: ['tragedy', 'loss', 'emotional', 'tearjerker', 'melancholy', 'grief', 'heartbreak'],
  angry: ['revenge', 'fight', 'battle', 'action', 'explosive', 'violence', 'rebellion'],
  disgust: ['gore', 'disturbing', 'dark', 'twisted', 'controversial', 'bloody'],
  fear: ['scary', 'terror', 'horror', 'suspense', 'supernatural', 'monster', 'paranormal'],
  surprise: ['twist', 'unexpected', 'mind-bending', 'unpredictable', 'shocking', 'surreal'],
  neutral: ['thought-provoking', 'informative', 'educational', 'historical', 'biography']
};

// Store all movies from the CSV
let allMovies: Movie[] = [];

// Process movie data from CSV row
const processMovieData = (movieObj: any): Movie => {
  const result: Movie = {
    id: Number(movieObj.id) || 0,
    title: movieObj.title || '',
    vote_average: Number(movieObj.vote_average) || 0,
    vote_count: Number(movieObj.vote_count) || 0,
    status: movieObj.status || '',
    release_date: movieObj.release_date || '',
    revenue: Number(movieObj.revenue) || 0,
    runtime: Number(movieObj.runtime) || 0,
    adult: movieObj.adult === 'TRUE',
    backdrop_path: movieObj.backdrop_path || '',
    budget: Number(movieObj.budget) || 0,
    homepage: movieObj.homepage || '',
    imdb_id: movieObj.imdb_id || '',
    original_language: movieObj.original_language || '',
    original_title: movieObj.original_title || '',
    overview: movieObj.overview || '',
    popularity: Number(movieObj.popularity) || 0,
    poster_path: movieObj.poster_path || '',
    tagline: movieObj.tagline || '',
    genres: movieObj.genres ? movieObj.genres.split(',').map((g: string) => g.trim()) : [],
    production_companies: movieObj.production_companies ? movieObj.production_companies.split(',').map((c: string) => c.trim()) : [],
    production_countries: movieObj.production_countries ? movieObj.production_countries.split(',').map((c: string) => c.trim()) : [],
    spoken_languages: movieObj.spoken_languages ? movieObj.spoken_languages.split(',').map((l: string) => l.trim()) : [],
    keywords: movieObj.keywords ? movieObj.keywords.split(',').map((k: string) => k.trim()) : [],
  };
  
  // Extract year from release date
  if (result.release_date) {
    const dateParts = result.release_date.split('-');
    if (dateParts.length >= 1) {
      result.year = parseInt(dateParts[0], 10);
    }
  }
  
  // Normalize rating to 5-star scale
  if (result.vote_average) {
    result.rating = parseFloat((result.vote_average / 2).toFixed(1));
  }
  
  return result;
};
export const loadTmdbDataset = async (): Promise<void> => {
  try {
    const response = await fetch('/data/tmdb.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }


    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);
    console.log("First 300 characters of CSV:\n", csvText.slice(0, 300));

    const rows = parseCSV(csvText, '\t');
    console.log("Parsed rows:", rows.length);
    if (rows.length > 0) {
      console.log("Sample row:", rows[0]);
    }

    const movieObjects = csvRowsToObjects<any>(rows);
    console.log("Parsed movie objects:", movieObjects.length);
    if (movieObjects.length > 0) {
      console.log("Sample movie object before processing:", movieObjects[0]);
    }

    allMovies = movieObjects
      .map(processMovieData)
      .filter(movie => movie.id > 0);

    console.log(`✅ Loaded ${allMovies.length} movies from TMDB dataset`);
    if (allMovies.length > 0) {
      console.log("Sample processed movie:", allMovies[0]);
    }

  } catch (error) {
    console.error("❌ Error loading TMDB dataset:", error);
    allMovies = sampleMovies;
  }
};

// A subset of movies from TMDB dataset for fallback purposes
const sampleMovies: Movie[] = [
  // Sample movie data as fallback
  { 
    id: 27205, 
    title: "Inception", 
    vote_average: 8.364, 
    vote_count: 34495, 
    status: "Released", 
    release_date: "15-07-2010", 
    revenue: 825532764, 
    runtime: 148, 
    adult: false, 
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", 
    budget: 160000000, 
    homepage: "https://www.warnerbros.com/movies/inception", 
    imdb_id: "tt1375666", 
    original_language: "en", 
    original_title: "Inception", 
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.", 
    popularity: 83.952, 
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", 
    tagline: "Your mind is the scene of the crime.", 
    genres: ["Action", "Science Fiction", "Adventure"], 
    production_companies: ["Legendary Pictures", "Syncopy", "Warner Bros. Pictures"], 
    production_countries: ["United Kingdom", "United States of America"], 
    spoken_languages: ["English", "French", "Japanese", "Swahili"],
    keywords: ["rescue", "mission", "dream", "airplane", "paris", "france", "virtual reality", "kidnapping", "philosophy", "spy", "allegory", "manipulation", "car crash", "heist", "memory", "architecture", "los angeles", "california", "dream world", "subconscious"],
    year: 2010,
    rating: 4.2
  },
  // ... more sample movies if needed
];

export const getMovieRecommendationsByEmotion = async (emotion: string, limit: number = 10): Promise<Movie[]> => {
  // Load data if not already loaded
  if (allMovies.length === 0) {
    console.log("Movies not loaded yet, calling loadTmdbDataset()");
    await loadTmdbDataset();
  } else {
    console.log(`Movies already loaded: ${allMovies.length} movies`);
  }

  console.log(`Getting recommendations for emotion: ${emotion}`);

  const targetGenres = emotionGenreMappings[emotion.toLowerCase()] || emotionGenreMappings.neutral;
  const targetKeywords = emotionKeywordMappings[emotion.toLowerCase()] || emotionKeywordMappings.neutral;

  console.log("Target genres:", targetGenres);
  console.log("Target keywords:", targetKeywords);

  const scoredMovies = allMovies.map(movie => {
    const genreMatch = movie.genres ? movie.genres.filter(genre => 
      targetGenres.some(target => genre.toLowerCase().includes(target.toLowerCase()))
    ).length : 0;

    const keywordMatch = movie.keywords ? movie.keywords.filter(keyword => 
      targetKeywords.some(target => keyword.toLowerCase().includes(target.toLowerCase()))
    ).length : 0;

    const genreScore = movie.genres && movie.genres.length > 0 ? 
      genreMatch / Math.min(targetGenres.length, movie.genres.length) : 0;

    const keywordScore = movie.keywords && movie.keywords.length > 0 ? 
      keywordMatch / Math.min(targetKeywords.length, movie.keywords.length) : 0;

    const ratingScore = (movie.vote_average || 0) / 10;
    const popularityScore = Math.min((movie.popularity || 0) / 100, 1);
    const voteCountBonus = Math.min((movie.vote_count || 0) / 10000, 1) * 0.2;

    const score = (
      (genreScore * 0.4) + 
      (keywordScore * 0.2) + 
      (ratingScore * 0.2) + 
      (popularityScore * 0.1) +
      voteCountBonus
    );

    // Log scoring details for debugging
    console.log(`Movie: ${movie.title}`);
    console.log(`  Genre Match: ${genreMatch}, Keyword Match: ${keywordMatch}`);
    console.log(`  Scores - Genre: ${genreScore}, Keyword: ${keywordScore}, Rating: ${ratingScore}, Popularity: ${popularityScore}, Vote Bonus: ${voteCountBonus}`);
    console.log(`  Final Score: ${score}`);

    return {
      ...movie,
      score
    };
  });

  const topMovies = scoredMovies
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  console.log(`Top ${limit} recommended movies:`, topMovies.map(m => m.title));

  return topMovies;
};

// Helper function to get recommendation message based on emotion
export const getRecommendationMessage = (emotion: string): string => {
  switch (emotion.toLowerCase()) {
    case 'happy':
      return "Since you're feeling happy, here are some uplifting movies to maintain your good mood:";
    case 'sad':
      return "We noticed you're feeling down. These thoughtful films might resonate with you:";
    case 'angry':
      return "To channel that intensity, check out these powerful and dynamic films:";
    case 'disgust':
      return "Based on your expression, these thought-provoking films might intrigue you:";
    case 'fear':
      return "If you're in the mood for something that matches your cautious feeling:";
    case 'surprise':
      return "Since you're looking surprised, these mind-bending films might keep you engaged:";
    case 'neutral':
      return "For your balanced mood, we've selected these well-rounded films:";
    default:
      return "Here are some movie recommendations you might enjoy:";
  }
};

// Helper function to get poster URL
export const getPosterUrl = (posterPath: string | null | undefined): string => {
  if (!posterPath) return '';
  // Check if the path already contains the base URL
  if (posterPath.startsWith('http')) {
    return posterPath;
  }
  // TMDB poster base URL
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

// Initial data load
loadTmdbDataset();

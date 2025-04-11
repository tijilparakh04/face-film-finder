
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Movie } from '@/utils/movieData';

// API endpoint
const API_BASE_URL = 'http://localhost:5000/api';
const MOVIE_RECOMMENDATIONS_ENDPOINT = `${API_BASE_URL}/recommend-movies`;

export function useMovieData() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if the API is available
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/health`);
        setIsInitialized(response.data.status === 'healthy');
        if (response.data.status !== 'healthy') {
          setError(new Error('API is not healthy. Some services might not be available.'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect to movie recommendation API'));
        console.error('Error connecting to API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      checkApiHealth();
    }
  }, [isInitialized]);

  // Function to get recommendations
  const getRecommendations = async (emotion: string, limit: number = 8): Promise<Movie[]> => {
    if (!isInitialized) {
      throw new Error('API not available');
    }
    
    try {
      const response = await axios.get(`${MOVIE_RECOMMENDATIONS_ENDPOINT}/${emotion}?limit=${limit}`);
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isInitialized,
    error,
    getRecommendations
  };
}

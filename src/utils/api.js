import axios from 'axios';

// Base API URL from environment variables or fallback to default
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Set a timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle request errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

/**
 * Detect emotion from a base64-encoded image
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Promise resolving to emotion detection results
 */
export const detectEmotion = async (imageBase64) => {
  try {
    const response = await apiClient.post('/detect_emotion', { image: imageBase64 });
    return response.data;
  } catch (error) {
    console.error('Error detecting emotion:', error);
    throw error;
  }
};

/**
 * Get movie recommendations based on emotion scores
 * @param {Object} emotionScores - Object containing emotion scores
 * @param {string} dominantEmotion - The dominant emotion
 * @param {number} topN - Number of recommendations to return
 * @returns {Promise<Array>} Promise resolving to movie recommendations
 */


/**
 * Check the health of the backend API
 * @returns {Promise<boolean>} Promise resolving to true if API is healthy
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} [params={}] - Query parameters
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const get = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const post = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Generic PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const put = async (endpoint, data) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const del = async (endpoint) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    throw error;
  }
};

export default apiClient;
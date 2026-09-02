import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utils/config';

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach token
client.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth ---
export const signup = (data) => client.post('/auth/signup', data);
export const login = (data) => client.post('/auth/login', data);
export const checkUsername = (username) => client.get(`/auth/check-username/${username}`);
export const getMe = () => client.get('/auth/me');

// --- Users ---
export const getUserProfile = (username) => client.get(`/users/${username}`);
export const searchUsers = (q, page = 1) => client.get(`/users/search?q=${q}&page=${page}&limit=10`);
export const toggleFollow = (id) => client.post(`/users/${id}/follow`);

// --- Posts ---
export const getFeed = (page = 1) => client.get(`/posts/feed?page=${page}&limit=10`);
export const getPost = (id) => client.get(`/posts/${id}`);
export const searchPosts = (q, page = 1) => client.get(`/posts/search?q=${q}&page=${page}&limit=10`);
export const createPost = (formData) => 
  client.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
export const toggleLike = (id) => client.post(`/posts/${id}/like`);
export const toggleDislike = (id) => client.post(`/posts/${id}/dislike`);

// --- Comments ---
export const addComment = (postId, text) => client.post(`/posts/${postId}/comments`, { text });

// --- Notifications ---
export const getNotifications = (page = 1) => client.get(`/notifications?page=${page}&limit=10`);

export default client;

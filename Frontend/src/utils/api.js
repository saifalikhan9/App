import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL|| 'http://localhost:8000/api'; // Replace with your actual API base URL
console.log(import.meta.env.VITE_API_BASE_URL,"env");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for handling cookies
});

function getAuthToken() {
  return localStorage.getItem('accessToken');  // Get the token from localStorage
}

// Intercept requests to add the token in Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;  // Add token to headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function loginUser(username, password) {
  try {
    const response = await api.post('/login', { username, password });

    // Store the access and refresh token in localStorage
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function logoutUser() {
  try {
    const response = await api.post('/logout');

    // Remove the tokens on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    const response = await api.post('/refresh-token', { refreshToken }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error(error.response?.data?.message || 'Token refresh failed');
  }
}


export async function fetchEmployees() {
  try {
    const response = await api.get('/getAllEmployee');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employees');
  }
}

export async function createEmployee(employeeData) {
  try {
    const formData = new FormData();
    for (const key in employeeData) {
      formData.append(key, employeeData[key]);
    }
    const response = await api.post('/createEmployee', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create employee');
  }
}

export async function updateEmployee(id, formData) {
  try {
    const response = await api.put(`/editEmployee/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: "accessToken" // Replace with your actual access token
      }
    });
    return response.data;
  } catch (error) {
    
    throw new Error(error || 'Failed to update employee');
  }
}

export async function deleteEmployee(id) {
  try {
    const response = await api.delete(`/deleteEmployee/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete employee');
  }
}
import axios from 'axios';

const API_BASE_URL = 'https://app-backend-api-pi.vercel.app/api'; // Replace with your actual API base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for handling cookies
});

export async function loginUser(username, password) {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function logoutUser() {
  try {
    const response = await api.post('/logout');
    
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
    const response = await api.get('/getAllEmployee',
      {
        headers: {Authorization : "accessToken"}
      }
    );
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
      headers: { 'Content-Type': 'multipart/form-data' ,Authorization:"accessToken" }
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
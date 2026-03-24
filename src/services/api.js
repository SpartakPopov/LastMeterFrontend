import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const packageAPI = {
  getPackageByTrackingNumber: async (trackingNumber) => {
    try {
      const response = await api.get(`/packages/${trackingNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  },
};

export default api;

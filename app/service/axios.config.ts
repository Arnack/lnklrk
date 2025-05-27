import axios from 'axios';
import { useRouter } from 'next/navigation';
import LS from './LS';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const { user } = LS.getUserInfo();
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const router = useRouter();
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          LS.removeUserInfo();
          router.push('/auth/login');
          break;
        case 403:
          router.push('/auth/forbidden');
          break;
        case 404:
          router.push('/404');
          break;
        case 500:
          router.push('/500');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 
// utils/tokenUtils.js
import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return true; // No token means expired or not present

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token', error);
    return true; // If decoding fails, consider the token expired
  }
};

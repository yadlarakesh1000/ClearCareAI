import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';
import api from '../api/axiosConfig';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);

  const role = user?.role ?? null;

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken: token, refreshToken, userId, email: userEmail, role: userRole } = data.data;
    const userData = { id: userId, email: userEmail, role: userRole };
    dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
    return userRole;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    const { accessToken: token, refreshToken, userId, email: userEmail, role: userRole } = data.data;
    const userData = { id: userId, email: userEmail, role: userRole };
    dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
    return userRole;
  }

  function logout() {
    dispatch(logoutAction());
    navigate('/login');
  }

  return { user, accessToken, isAuthenticated, role, login, register, logout };
}

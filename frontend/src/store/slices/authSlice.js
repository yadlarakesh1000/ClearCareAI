import { createSlice } from '@reduxjs/toolkit';

const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
const hasRefreshToken = !!localStorage.getItem('refreshToken');

const initialState = {
  user: storedUser,
  accessToken: null,
  isAuthenticated: storedUser !== null && hasRefreshToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

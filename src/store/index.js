import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // Assuming you have an authSlice

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here if needed
  },
});

export default store;

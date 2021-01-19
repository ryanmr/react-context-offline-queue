import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { reducer as data } from './data-slice';

export const store = configureStore({
  reducer: combineReducers({
    data,
  }),
});

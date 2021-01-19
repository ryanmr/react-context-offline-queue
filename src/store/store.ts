import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { reducer as data } from './data-slice';

const rootReducer = combineReducers({
  data,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

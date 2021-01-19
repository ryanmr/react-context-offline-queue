import { createSlice } from '@reduxjs/toolkit';

export interface Data {
  id: string;
  value: string;
  createdAt: string;
}

const todosSlice = createSlice({
  name: 'data',
  initialState: [] as Data[],
  reducers: {
    addData(state, action) {
      const { id, value } = action.payload;
      const val = { id, value, createdAt: new Date().toISOString() };
      state.push(val);
    },
  },
});

export const { addData } = todosSlice.actions;

export const { reducer } = todosSlice;

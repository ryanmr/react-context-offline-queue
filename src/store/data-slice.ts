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
    addData(state, { payload: { id, value } }) {
      const val = { id, value, createdAt: new Date().toISOString() };
      state.push(val);
    },
    clearData(state) {
      state.length = 0;
    },
  },
});

export const { addData, clearData } = todosSlice.actions;

export const { reducer } = todosSlice;

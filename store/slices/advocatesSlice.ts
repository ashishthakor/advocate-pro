import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdvocateItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  experience_years: number;
  bar_number: string;
  license_number: string;
  is_approved: boolean;
  created_at: string;
}

interface AdvocatesState {
  items: AdvocateItem[];
  loading: boolean;
  error: string | null;
}

const initialState: AdvocatesState = {
  items: [],
  loading: false,
  error: null,
};

const advocatesSlice = createSlice({
  name: 'advocates',
  initialState,
  reducers: {
    fetchAdvocates(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAdvocatesSuccess(state, action: PayloadAction<AdvocateItem[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    fetchAdvocatesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    approveAdvocate(state, _action: PayloadAction<{ id: number; approved: boolean; notes?: string }>) {
      state.loading = true;
      state.error = null;
    },
    approveAdvocateSuccess(state, action: PayloadAction<{ id: number; approved: boolean }>) {
      state.items = state.items.map(a => a.id === action.payload.id ? { ...a, is_approved: action.payload.approved } : a);
      state.loading = false;
    },
    approveAdvocateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAdvocates,
  fetchAdvocatesSuccess,
  fetchAdvocatesFailure,
  approveAdvocate,
  approveAdvocateSuccess,
  approveAdvocateFailure,
} = advocatesSlice.actions;

export default advocatesSlice.reducer;




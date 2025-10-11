import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user' | 'advocate' | 'admin';
  is_approved: boolean;
  created_at: string;
}

interface UsersState {
  items: UserItem[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsers(state, _action: PayloadAction<{ role?: string; is_approved?: boolean; search?: string } | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(state, action: PayloadAction<UserItem[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUsers, fetchUsersSuccess, fetchUsersFailure } = usersSlice.actions;
export default usersSlice.reducer;




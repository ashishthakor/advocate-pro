import { combineReducers } from '@reduxjs/toolkit';
import usersReducer from '@/store/slices/usersSlice';
import advocatesReducer from '@/store/slices/advocatesSlice';
import casesReducer from '@/store/slices/casesSlice';
import assignmentsReducer from '@/store/slices/assignmentsSlice';

export const rootReducer = combineReducers({
  users: usersReducer,
  advocates: advocatesReducer,
  cases: casesReducer,
  assignments: assignmentsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;




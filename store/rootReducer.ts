import { combineReducers } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import advocatesReducer from './slices/advocatesSlice';
import casesReducer from './slices/casesSlice';
import assignmentsReducer from './slices/assignmentsSlice';

export const rootReducer = combineReducers({
  users: usersReducer,
  advocates: advocatesReducer,
  cases: casesReducer,
  assignments: assignmentsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;




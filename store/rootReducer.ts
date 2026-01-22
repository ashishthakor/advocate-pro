import { combineReducers } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import advocatesReducer from './slices/advocatesSlice';
import casesReducer from './slices/casesSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import noticesReducer from './slices/noticesSlice';

export const rootReducer = combineReducers({
  users: usersReducer,
  advocates: advocatesReducer,
  cases: casesReducer,
  assignments: assignmentsReducer,
  notices: noticesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;




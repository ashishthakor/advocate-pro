import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssignPayload { caseId: number; advocateId: number }

interface AssignmentsState {
  assigning: boolean;
  error: string | null;
}

const initialState: AssignmentsState = {
  assigning: false,
  error: null,
};

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    assignCase(state, _action: PayloadAction<AssignPayload>) {
      state.assigning = true;
      state.error = null;
    },
    assignCaseSuccess(state) {
      state.assigning = false;
    },
    assignCaseFailure(state, action: PayloadAction<string>) {
      state.assigning = false;
      state.error = action.payload;
    },
  },
});

export const { assignCase, assignCaseSuccess, assignCaseFailure } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;




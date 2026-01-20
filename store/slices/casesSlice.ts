import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CaseItem {
  id: number;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  status: 'open' | 'in_progress' | 'closed' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  user_id: number;
  advocate_id: number | null;
  tracking_id?: string | null;
  court_name: string;
  judge_name: string;
  next_hearing_date: string | null;
  fees: string;
  fees_paid: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  advocate_name?: string | null;
  advocate_email?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FetchCasesSuccessPayload {
  cases: CaseItem[];
  pagination: Pagination;
}

interface CasesState {
  items: CaseItem[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: CasesState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
};

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    fetchCases(state, _action: PayloadAction<{ page?: number; limit?: number; status?: string; case_type?: string; priority?: string } | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchCasesSuccess(state, action: PayloadAction<FetchCasesSuccessPayload>) {
      state.items = action.payload.cases;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    fetchCasesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchCases, fetchCasesSuccess, fetchCasesFailure } = casesSlice.actions;
export default casesSlice.reducer;




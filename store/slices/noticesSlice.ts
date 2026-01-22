import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NoticeItem {
  id: number;
  case_id: number;
  respondent_name: string;
  respondent_address: string;
  respondent_pincode: string;
  subject: string | null;
  date: string | null;
  content: string;
  pdf_filename: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_sent_count: number;
  recipient_email: string | null;
  notice_number: number;
  created_at: string;
  case?: {
    id: number;
    case_number: string;
    title: string;
  };
}

interface NoticesByCase {
  [caseId: number]: {
    notices: NoticeItem[];
    loading: boolean;
    error: string | null;
  };
}

interface NoticesState {
  noticesByCase: NoticesByCase;
}

const initialState: NoticesState = {
  noticesByCase: {},
};

const noticesSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {
    // Fetch notices for a specific case
    fetchCaseNotices(state, _action: PayloadAction<number>) {
      const caseId = _action.payload;
      if (!state.noticesByCase[caseId]) {
        state.noticesByCase[caseId] = {
          notices: [],
          loading: true,
          error: null,
        };
      } else {
        state.noticesByCase[caseId].loading = true;
        state.noticesByCase[caseId].error = null;
      }
    },
    fetchCaseNoticesSuccess(state, action: PayloadAction<{ caseId: number; notices: NoticeItem[] }>) {
      const { caseId, notices } = action.payload;
      if (!state.noticesByCase[caseId]) {
        state.noticesByCase[caseId] = {
          notices: [],
          loading: false,
          error: null,
        };
      }
      // Sort by notice_number
      const sortedNotices = [...notices].sort((a, b) => (a.notice_number || 0) - (b.notice_number || 0));
      state.noticesByCase[caseId].notices = sortedNotices;
      state.noticesByCase[caseId].loading = false;
      state.noticesByCase[caseId].error = null;
    },
    fetchCaseNoticesFailure(state, action: PayloadAction<{ caseId: number; error: string }>) {
      const { caseId, error } = action.payload;
      if (!state.noticesByCase[caseId]) {
        state.noticesByCase[caseId] = {
          notices: [],
          loading: false,
          error: null,
        };
      }
      state.noticesByCase[caseId].loading = false;
      state.noticesByCase[caseId].error = error;
    },
    // Delete a notice
    deleteNotice(state, _action: PayloadAction<{ caseId: number; noticeId: number }>) {
      const { caseId } = _action.payload;
      if (state.noticesByCase[caseId]) {
        state.noticesByCase[caseId].loading = true;
      }
    },
    deleteNoticeSuccess(state, action: PayloadAction<{ caseId: number; noticeId: number }>) {
      const { caseId, noticeId } = action.payload;
      if (state.noticesByCase[caseId]) {
        state.noticesByCase[caseId].notices = state.noticesByCase[caseId].notices.filter(
          (n) => n.id !== noticeId
        );
        state.noticesByCase[caseId].loading = false;
      }
    },
    deleteNoticeFailure(state, action: PayloadAction<{ caseId: number; error: string }>) {
      const { caseId, error } = action.payload;
      if (state.noticesByCase[caseId]) {
        state.noticesByCase[caseId].loading = false;
        state.noticesByCase[caseId].error = error;
      }
    },
    // Update notice in state after edit
    updateNoticeInState(state, action: PayloadAction<{ caseId: number; notice: NoticeItem }>) {
      const { caseId, notice } = action.payload;
      if (state.noticesByCase[caseId]) {
        const index = state.noticesByCase[caseId].notices.findIndex((n) => n.id === notice.id);
        if (index !== -1) {
          state.noticesByCase[caseId].notices[index] = notice;
          // Re-sort after update
          state.noticesByCase[caseId].notices.sort((a, b) => (a.notice_number || 0) - (b.notice_number || 0));
        }
      }
    },
    // Add notice to state after creation
    addNoticeToState(state, action: PayloadAction<{ caseId: number; notice: NoticeItem }>) {
      const { caseId, notice } = action.payload;
      if (!state.noticesByCase[caseId]) {
        state.noticesByCase[caseId] = {
          notices: [],
          loading: false,
          error: null,
        };
      }
      state.noticesByCase[caseId].notices.push(notice);
      // Re-sort after adding
      state.noticesByCase[caseId].notices.sort((a, b) => (a.notice_number || 0) - (b.notice_number || 0));
    },
  },
});

export const {
  fetchCaseNotices,
  fetchCaseNoticesSuccess,
  fetchCaseNoticesFailure,
  deleteNotice,
  deleteNoticeSuccess,
  deleteNoticeFailure,
  updateNoticeInState,
  addNoticeToState,
} = noticesSlice.actions;

export default noticesSlice.reducer;

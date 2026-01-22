import { call, put, takeLatest } from 'redux-saga/effects';
import { apiFetch } from '@/lib/api-client';
import {
  fetchCaseNotices,
  fetchCaseNoticesSuccess,
  fetchCaseNoticesFailure,
  deleteNotice,
  deleteNoticeSuccess,
  deleteNoticeFailure,
  NoticeItem,
} from '@/store/slices/noticesSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

// Fetch notices for a case
function* handleFetchCaseNotices(action: PayloadAction<number>) {
  try {
    const caseId = action.payload;
    const res: { success: boolean; data: { notices: NoticeItem[] }; message?: string } = yield call(
      apiFetch,
      `/api/cases/${caseId}/notices`
    );
    if (res.success && res.data) {
      yield put(fetchCaseNoticesSuccess({ caseId, notices: res.data.notices || [] }));
    } else {
      yield put(fetchCaseNoticesFailure({ caseId, error: res.message || 'Failed to fetch notices' }));
    }
  } catch (e: any) {
    const caseId = action.payload;
    yield put(fetchCaseNoticesFailure({ caseId, error: e.message || 'Failed to fetch notices' }));
  }
}

// Delete a notice
function* handleDeleteNotice(action: PayloadAction<{ caseId: number; noticeId: number }>) {
  try {
    const { caseId, noticeId } = action.payload;
    const res: { success: boolean; message?: string } = yield call(apiFetch, `/api/notices/${noticeId}`, {
      method: 'DELETE',
    });
    if (res.success) {
      yield put(deleteNoticeSuccess({ caseId, noticeId }));
    } else {
      yield put(deleteNoticeFailure({ caseId, error: res.message || 'Failed to delete notice' }));
    }
  } catch (e: any) {
    const { caseId } = action.payload;
    yield put(deleteNoticeFailure({ caseId, error: e.message || 'Failed to delete notice' }));
  }
}

export default function* noticesSaga() {
  yield takeLatest(fetchCaseNotices.type, handleFetchCaseNotices);
  yield takeLatest(deleteNotice.type, handleDeleteNotice);
}

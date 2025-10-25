import { call, put, takeLatest } from 'redux-saga/effects';
import { apiFetch } from '@/lib/api-client';
import {
  fetchAdvocates,
  fetchAdvocatesFailure,
  fetchAdvocatesSuccess,
  approveAdvocate,
  approveAdvocateFailure,
  approveAdvocateSuccess,
  AdvocateItem,
} from '../slices/advocatesSlice';

function* handleFetchAdvocates() {
  try {
    const res: { success: boolean; data: AdvocateItem[] } = yield call(apiFetch, '/api/users?role=advocate');
    if (res.success) {
      yield put(fetchAdvocatesSuccess(res.data || []));
    } else {
      yield put(fetchAdvocatesFailure('Failed to fetch advocates'));
    }
  } catch (e: any) {
    yield put(fetchAdvocatesFailure(e.message || 'Failed to fetch advocates'));
  }
}

function* handleApproveAdvocate(action: ReturnType<typeof approveAdvocate>) {
  try {
    const { id, approved, notes } = action.payload;
    const res: { success: boolean } = yield call(apiFetch, `/api/users/${id}`, {
      method: 'PUT',
      json: { is_approved: approved, approval_notes: notes },
    });
    if (res.success) {
      yield put(approveAdvocateSuccess({ id, approved }));
    } else {
      yield put(approveAdvocateFailure('Failed to update advocate'));
    }
  } catch (e: any) {
    yield put(approveAdvocateFailure(e.message || 'Failed to update advocate'));
  }
}

export default function* advocatesSaga() {
  yield takeLatest(fetchAdvocates.type, handleFetchAdvocates);
  yield takeLatest(approveAdvocate.type, handleApproveAdvocate);
}




import { call, put, takeLatest } from 'redux-saga/effects';
import { apiFetch } from '@/lib/api-client';
import { assignCase, assignCaseFailure, assignCaseSuccess } from '@/store/slices/assignmentsSlice';

function* handleAssignCase(action: ReturnType<typeof assignCase>) {
  try {
    const { caseId, advocateId } = action.payload;
    const res: { success: boolean } = yield call(apiFetch, '/api/cases/assign', {
      method: 'POST',
      json: { caseId, advocateId },
    });
    if (res.success) {
      yield put(assignCaseSuccess());
    } else {
      yield put(assignCaseFailure('Failed to assign case'));
    }
  } catch (e: any) {
    yield put(assignCaseFailure(e.message || 'Failed to assign case'));
  }
}

export default function* assignmentsSaga() {
  yield takeLatest(assignCase.type, handleAssignCase);
}




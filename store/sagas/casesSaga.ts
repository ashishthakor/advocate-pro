import { call, put, takeLatest } from 'redux-saga/effects';
import { apiFetch } from 'lib/api-client';
import { fetchCases, fetchCasesFailure, fetchCasesSuccess, CaseItem, Pagination } from '../slices/casesSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

function buildQuery(params?: { page?: number; limit?: number; status?: string; case_type?: string; priority?: string }) {
  const usp = new URLSearchParams();
  if (params?.page) usp.set('page', String(params.page));
  if (params?.limit) usp.set('limit', String(params.limit));
  if (params?.status) usp.set('status', params.status);
  if (params?.case_type) usp.set('case_type', params.case_type);
  if (params?.priority) usp.set('priority', params.priority);
  const qs = usp.toString();
  return qs ? `/api/cases?${qs}` : '/api/cases';
}

function* handleFetchCases(action: PayloadAction<{ page?: number; limit?: number; status?: string; case_type?: string; priority?: string } | undefined>) {
  try {
    const url = buildQuery(action.payload);
    const res: { success: boolean; data: { cases: CaseItem[]; pagination: Pagination } } = yield call(apiFetch, url);
    if (res.success && res.data) {
      yield put(fetchCasesSuccess(res.data));
    } else {
      yield put(fetchCasesFailure('Failed to fetch cases'));
    }
  } catch (e: any) {
    yield put(fetchCasesFailure(e.message || 'Failed to fetch cases'));
  }
}

export default function* casesSaga() {
  yield takeLatest(fetchCases.type, handleFetchCases);
}




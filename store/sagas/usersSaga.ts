import { call, put, takeLatest } from 'redux-saga/effects';
import { apiFetch } from '@/lib/api-client';
import { fetchUsers, fetchUsersFailure, fetchUsersSuccess, UserItem } from '@/store/slices/usersSlice';

function* handleFetchUsers(action: ReturnType<typeof fetchUsers>) {
  try {
    const params = action.payload || {};
    const search = new URLSearchParams();
    if (params.role) search.set('role', params.role);
    if (typeof params.is_approved === 'boolean') search.set('is_approved', String(params.is_approved));
    if (params.search) search.set('search', params.search);

    const qs = search.toString();
    const url = qs ? `/api/users?${qs}` : '/api/users';

    const res: { success: boolean; data: UserItem[] } = yield call(apiFetch, url);
    if (res.success) {
      yield put(fetchUsersSuccess(res.data || []));
    } else {
      yield put(fetchUsersFailure('Failed to fetch users'));
    }
  } catch (e: any) {
    yield put(fetchUsersFailure(e.message || 'Failed to fetch users'));
  }
}

export default function* usersSaga() {
  yield takeLatest(fetchUsers.type, handleFetchUsers);
}




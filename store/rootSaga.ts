import { all, fork } from 'redux-saga/effects';
import usersSaga from '@/store/sagas/usersSaga';
import advocatesSaga from '@/store/sagas/advocatesSaga';
import casesSaga from '@/store/sagas/casesSaga';
import assignmentsSaga from '@/store/sagas/assignmentsSaga';

export default function* rootSaga() {
  yield all([
    fork(usersSaga),
    fork(advocatesSaga),
    fork(casesSaga),
    fork(assignmentsSaga),
  ]);
}




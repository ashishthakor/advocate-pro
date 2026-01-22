import { all, fork } from 'redux-saga/effects';
import usersSaga from './sagas/usersSaga';
import advocatesSaga from './sagas/advocatesSaga';
import casesSaga from './sagas/casesSaga';
import assignmentsSaga from './sagas/assignmentsSaga';
import noticesSaga from './sagas/noticesSaga';

export default function* rootSaga() {
  yield all([
    fork(usersSaga),
    fork(advocatesSaga),
    fork(casesSaga),
    fork(assignmentsSaga),
    fork(noticesSaga),
  ]);
}




import {
  LOGOUT_USER,
  SET_LOGIN_INFO,
  UPDATE_USER_BASIC_INFO,
} from '../actionConstants';

export function setLoginInfoAction(info) {
  return {
    type: SET_LOGIN_INFO,
    payload: info,
  };
}

export function updateUserBasicInfo(info) {
  return {
    type: UPDATE_USER_BASIC_INFO,
    payload: info,
  };
}
export function logoutUserAction(info) {
  return {
    type: LOGOUT_USER,
    payload: info,
  };
}

import {
  LOGOUT_USER,
  SET_LOGIN_INFO,
  UPDATE_USER_BASIC_INFO,
} from '../actionConstants';
const initialState = {
  isUserLoggedIn: false,
};
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOGIN_INFO:
      return action.payload;
    case UPDATE_USER_BASIC_INFO:
      return {...state, userDetails: action.payload};
    case LOGOUT_USER:
      return action.payload;
    default:
      return state;
  }
};
export default authReducer;

import { legacy_createStore as createStore, combineReducers} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import EncryptedStorage from 'react-native-encrypted-storage';

import authReducer from '../reducers/authReducer';

const persistConfig = {
  key: 'root',
  storage: EncryptedStorage,
  whitelist: ['userInfo'],
};
const rootReducer = combineReducers({
  userInfo: authReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
const configureStore = () => {
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  return {store, persistor};
};
export default configureStore;

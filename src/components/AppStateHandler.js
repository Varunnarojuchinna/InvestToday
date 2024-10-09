import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUserAction } from '../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OneSignal } from 'react-native-onesignal';

const AppStateHandler = () => {
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else if (nextAppState.match(/inactive|background/)) {
        timerRef.current = setTimeout(async () => {
          await AsyncStorage.setItem('isUserLoggedIn', JSON.stringify(false));
          dispatch(logoutUserAction({ isUserLoggedIn: false, userDetails: {} }));
          OneSignal.logout();
        }, 10 * 60 * 1000); 
      }

      appState.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState?.removeEventListener('change', handleAppStateChange);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dispatch]);

  return null;
};

export default AppStateHandler;

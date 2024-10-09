import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUserAction } from '../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OneSignal } from 'react-native-onesignal';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogoutState = async () => {
      const isUserLoggedIn = JSON.parse(await AsyncStorage.getItem('isUserLoggedIn'));

      if (isUserLoggedIn === false) {
        dispatch(logoutUserAction({ isUserLoggedIn: false, userDetails: {} }));
        OneSignal.logout();
      } 
      setLoading(false);
    };

    checkLogoutState();
  }, [dispatch]);

  if (loading) {
    return null; 
  }

  return children;
};

export default AppInitializer;

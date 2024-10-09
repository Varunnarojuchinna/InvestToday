import * as React from 'react';
import { Platform, StatusBar } from 'react-native';
import MainNavigation from './src/navigation/MainNavigation';
import { Provider } from 'react-redux';
import configureStore from './src/redux/store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppStateHandler from './src/components/AppStateHandler';
import AppInitializer from './src/components/AppInitializer';
import { WebSocketProvider } from './src/components/WebSocketProvider';
import {OneSignal,LogLevel} from 'react-native-onesignal';
const { store, persistor } = configureStore();
import Config from 'react-native-config';
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const oneSignalAppId = Config.ONESIGNAL_APP_ID;
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal Initialization
  OneSignal.initialize(oneSignalAppId);

  // requestPermission will show the native iOS or Android notification permission prompt.
  // We recommend removing the following code and instead using an In-App Message to prompt for notification permission
  OneSignal.Notifications.requestPermission(true);
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('OneSignal: notification clicked:', event);
  });

  return (
    <GestureHandlerRootView>
      <Provider store={store}>       
        <PersistGate loading={null} persistor={persistor}>
          <WebSocketProvider>
        <AppInitializer>
        <AppStateHandler />
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 ,paddingTop:-20}}>
            <StatusBar barStyle={'light-content'} backgroundColor={'#000'}/>
              <MainNavigation></MainNavigation>
          </SafeAreaView>
          </SafeAreaProvider>
          </AppInitializer>
          </WebSocketProvider>
        </PersistGate>   
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

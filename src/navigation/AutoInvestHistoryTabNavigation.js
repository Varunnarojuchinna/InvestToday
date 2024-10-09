import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import OrderHistory from '../screens/autoInvestment/OrderHistory';
import HistoryDetails from '../screens/autoInvestment/HistoryDetails';
import OpenPositions from '../screens/autoInvestment/OpenPositions';

const Tab = createMaterialTopTabNavigator();

const AutoInvestHistoryTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="OrderHistory"
      screenOptions={{
      lazy: true,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ccc',
        tabBarLabelStyle: {
          fontFamily: 'NotoSans-Bold',
          fontWeight: '700',
          textAlign: 'center',
          textTransform: 'none',
          lineHeight: 20,
          fontSize: 14,
          padding: 0,
          margin: 0,
        },
        tabBarStyle: {backgroundColor: '#0158aa',paddingVertical: 0},
        tabBarIndicatorStyle: {backgroundColor: '#fff'},
      }}>
      <Tab.Screen
        name="OpenPositions"
        component={OpenPositions}
        options={{ tabBarLabel: 'Open Positions' }}
      />
         <Tab.Screen
        name="OrderHistory"
        component={OrderHistory}
        options={{tabBarLabel: 'Order History'}}
      />
        <Tab.Screen
        name="HistoryDetails"
        component={HistoryDetails}
        options={{tabBarLabel: 'Trade History'}}
      />   
      
    </Tab.Navigator>
  );
};

export default AutoInvestHistoryTabNavigation;

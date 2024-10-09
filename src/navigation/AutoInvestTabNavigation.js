import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SearchStocks from '../screens/autoInvestment/SearchStocks';
import AutoInvestHistoryTabNavigation from './AutoInvestHistoryTabNavigation';

const Tab = createMaterialTopTabNavigator();

const AutoInvestTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="TrickDetails"
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
        },
        tabBarStyle: {backgroundColor: '#0158aa'},
        tabBarIndicatorStyle: {backgroundColor: '#fff'},
      }}>
      <Tab.Screen
        name="SearchStocks"
        component={SearchStocks}
        options={{tabBarLabel: 'Bot'}}
      />
      <Tab.Screen
        name="AutoInvestHistory"
        component={AutoInvestHistoryTabNavigation}
        options={{tabBarLabel: 'History'}}
      />
    </Tab.Navigator>
  );
};

export default AutoInvestTabNavigation;

import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import DealsBulk from '../screens/dealsScreens/BulkDeals';
import DealsBlock from '../screens/dealsScreens/BlockDeals';

const Tab = createMaterialTopTabNavigator();

const DealsTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="BulkDeals"
      screenOptions={{
        lazy: true,
        tabBarActiveTintColor: '#0158aa',
        tabBarInactiveTintColor: '#000',
        tabBarLabelStyle: {
          fontFamily: 'NotoSans-Bold',
          fontWeight: '700',
          textAlign: 'center',
          textTransform: 'none',
          lineHeight: 20,
          fontSize: 14,
        },
        tabBarStyle: {backgroundColor: '#fff'},
        tabBarIndicatorStyle: {backgroundColor: '#0158aa'},
      }}>
      <Tab.Screen
        name="BulkDeals"
        component={DealsBulk}
        options={{tabBarLabel: 'Bulk'}}
      />
      <Tab.Screen
        name="BlockDeals"
        component={DealsBlock}
        options={{tabBarLabel: 'Block'}}
      />
    </Tab.Navigator>
  );
};

export default DealsTabNavigation;

import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Prices from '../screens/dealsScreens/dealsCompanyDetails/Prices';
import Deliveries from '../screens/dealsScreens/dealsCompanyDetails/Deliveries';
import Updates from '../screens/dealsScreens/dealsCompanyDetails/Updates';
import EdgeReports from '../screens/dealsScreens/dealsCompanyDetails/EdgeReports';
import Technicals from '../screens/dealsScreens/dealsCompanyDetails/Technicals';

const Tab = createMaterialTopTabNavigator();

const DealsCompanyDetailsTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Prices"
      screenOptions={{
        lazy: true,
        tabBarActiveTintColor: '#fff',
        tabBarLabelStyle: {
          color: '#fff',
          fontFamily: 'NotoSans-Bold',
          fontWeight: '700',
          textAlign: 'center',
          textTransform: 'none',
          lineHeight: 20,
          fontSize: 14,
        },
        tabBarStyle: {backgroundColor: '#0158aa'},
        tabBarIndicatorStyle: {backgroundColor: '#fff'},
        tabBarScrollEnabled: true,
        tabBarItemStyle: {width: 'auto'},
      }}>
      <Tab.Screen
        name="Prices"
        component={Prices}
        options={{tabBarLabel: 'Prices'}}
      />
      <Tab.Screen
        name="Deliveries"
        component={Deliveries}
        options={{tabBarLabel: 'Deliveries'}}
      />
      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{tabBarLabel: 'Updates'}}
      />
      <Tab.Screen
        name="EdgeReports"
        component={EdgeReports}
        options={{tabBarLabel: 'Edge Reports'}}
      />
      <Tab.Screen
        name="Technicals"
        component={Technicals}
        options={{tabBarLabel: 'Technicals'}}
      />
    </Tab.Navigator>
  );
};

export default DealsCompanyDetailsTabNavigation;

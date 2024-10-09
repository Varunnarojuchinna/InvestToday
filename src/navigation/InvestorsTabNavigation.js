import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import DealsInvestor from '../screens/investorsScreens/DealsInvestor';
import ShareholdingInvestor from '../screens/investorsScreens/ShareholdingInvestor';
import DealsTabNavigation from './DealsTabNavigation';

const Tab = createMaterialTopTabNavigator();

const InvestorsTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="DealsInvestor"
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
      }}>
      <Tab.Screen
        name="Deals"
        component={DealsTabNavigation}
        options={{tabBarLabel: 'Deals'}}
      />
      <Tab.Screen
        name="Shareholding"
        component={ShareholdingInvestor}
        options={{tabBarLabel: 'Shareholding'}}
      />
      
    </Tab.Navigator>
  );
};

export default InvestorsTabNavigation;

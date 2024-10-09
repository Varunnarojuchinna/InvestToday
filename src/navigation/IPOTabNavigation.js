import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import IPOOngoing from '../screens/ipoScreens/OngoingIPOS';
import IPOUpcoming from '../screens/ipoScreens/UpcomingIPOS';
import IPOListed from '../screens/ipoScreens/ListedIPOS';

const Tab = createMaterialTopTabNavigator();

const IpoTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="OnGoing"
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
        name="OnGoingIPO"
        component={IPOOngoing}
        options={{tabBarLabel: 'Ongoing'}}
      />
      <Tab.Screen
        name="UpComingIPO"
        component={IPOUpcoming}
        options={{tabBarLabel: 'Upcoming'}}
      />
      <Tab.Screen
        name="ListedIPO"
        component={IPOListed}
        options={{tabBarLabel: 'Listed'}}
      />
    </Tab.Navigator>
  );
};

export default IpoTabNavigation;

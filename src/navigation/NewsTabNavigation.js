import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AllNews from '../screens/newsScreens/AllNews';
import TechnologyNews from '../screens/newsScreens/TechnologyNews';
import SportsNews from '../screens/newsScreens/SportsNews';
import ScienceNews from '../screens/newsScreens/ScienceNews';
import HealthNews from '../screens/newsScreens/HealthNews';
import BusinessNews from '../screens/newsScreens/BusinessNews';

const Tab = createMaterialTopTabNavigator();

const NewsTabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Business"
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
        name="AllNews"
        component={AllNews}
        options={{tabBarLabel: 'All News'}}
      />
      <Tab.Screen
        name="Business"
        component={BusinessNews}
        options={{tabBarLabel: 'Business'}}
      />
      <Tab.Screen
        name="Health"
        component={HealthNews}
        options={{tabBarLabel: 'Health'}}
      />
      <Tab.Screen
        name="Science"
        component={ScienceNews}
        options={{tabBarLabel: 'Science'}}
      />
      <Tab.Screen
        name="Sports"
        component={SportsNews}
        options={{tabBarLabel: 'Sports'}}
      />
      <Tab.Screen
        name="Technology"
        component={TechnologyNews}
        options={{tabBarLabel: 'Technology'}}
      />
    </Tab.Navigator>
  );
};

export default NewsTabNavigation;

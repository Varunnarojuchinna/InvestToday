import React from 'react';
import {View, Image, Pressable} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/Splash';
import OTP from '../screens/authScreens/OTPValidataion';
import CreateAccount from '../screens/authScreens/CreateAccount';
import Login from '../screens/authScreens/Login';
import ResetPassword from '../screens/authScreens/ResetPassword';
import PhoneNumber from '../screens/authScreens/PhoneNumber';
import LoadingScreen from '../screens/Loading';
import AddPhoneNumber from '../screens/authScreens/AddPhoneNumber';
import LogoTitle from '../components/HeaderLogo_T';
import LogoTitleNotification from '../components/DashboardHeaderLogo_T';
import SignUpScreen from '../screens/authScreens/SignUp';
import DashboardScreen from '../screens/Dashboard';
import NewsTabNavigation from './NewsTabNavigation';
import ViewNewsFullDetails from '../screens/newsScreens/NewsSummary';
import IpoTabNavigation from './IPOTabNavigation';
import CompanyDetails from '../screens/ipoScreens/CompanyDetails';
import DealsTabNavigation from './DealsTabNavigation';
import DealsCompanyDetailsTabNavigation from './DealsCompanyDetailsTabNavigation';
import SearchInvestor from '../screens/investorsScreens/searchInvestor'
import InvestorsTabNavigation from './InvestorsTabNavigation'
import TricksList from '../screens/autoInvestment/TricksList';
import HistoryDetails from '../screens/autoInvestment/HistoryDetails';
import CreateTrick from '../screens/autoInvestment/CreateTrick';
import TrickDetails from '../screens/autoInvestment/TrickDetails';
import StockDetails from '../screens/autoInvestment/StockDetails';
import { useNavigation } from '@react-navigation/native';
import SearchStocks from '../screens/autoInvestment/SearchStocks';
import AutoInvestTabNavigation from './AutoInvestTabNavigation';
import ChangePassword from '../screens/authScreens/ChangePassword';
import PersonalDetails from '../screens/authScreens/PersonalDetails';
import EditProfile from '../screens/authScreens/EditProfile';
import Profile from '../screens/authScreens/Profile';
import Share from 'react-native-share';
import PricingPlans from '../screens/subscriptionScreens/PricingPlans';
import MySubscription from '../screens/subscriptionScreens/MySubscription';
import ConfirmSubscription from '../screens/subscriptionScreens/ConfirmSubscription';
import Notifications from '../screens/notificationScreens/Notifications';
import LevelDetails from '../screens/autoInvestment/LevelDetails';
import MyTransaction from '../screens/subscriptionScreens/MyTransaction';
import FII_DIIActivity from '../screens/FII_DIIScreens/FII_DIIActivity';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerStyle: {backgroundColor: '#000000'},
  headerTintColor: '#fff',
  headerTransparent: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right',
  animationDuration: 3000,
};

const AuthStackNavigation = () => {
  const navigation=useNavigation();

  const share = async() => {
    const shareOptions = {
      title: 'Share via',
      message: 'Check Out This Wonderful App InvesToday',
      url: 'https://play.google.com/store/apps/details?id=com.ai.geosentry',
    };
    try{
      const result = await Share.open(shareOptions);
    }
    catch(error){
      console.log('Error in sharing',error);
    }
  }

  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 3000,
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OTP}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerTitle: 'InvesToday',
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 3000,
        }}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccount}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />
      <Stack.Screen
        name="PhoneNumber"
        component={PhoneNumber}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />
      <Stack.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 3000,
        }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <LogoTitleNotification />,
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="AddPhoneNumber"
        component={AddPhoneNumber}
        options={{
          headerTitle: () => <LogoTitle />,
          ...defaultScreenOptions,
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerTintColor: '#fff',
          animation: 'slide_from_right',
          animationDuration: 3000,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 3000,
        }}
      />
      <Stack.Screen
        name="PersonalDetails"
        component={PersonalDetails}
        options={{
          headerTitle: 'Personal Details',
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerTintColor: '#fff',
          animation: 'slide_from_right',
          animationDuration: 3000,

        }}/>

      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          headerTitle: 'Change Password',
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerTintColor: '#fff',
          animation: 'slide_from_right',
          animationDuration: 3000,

        }}
      />

      <Stack.Screen
        name="News"
        component={NewsTabNavigation}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'News',
          headerRight: () => {
            return (
              <View style={{flexDirection: 'row'}}>
                <Image
                  style={{width: 20, height: 20}}
                  resizeMode="contain"
                  source={require('../assets/bell.png')}
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen
        name="ViewFullDetails"
        component={ViewNewsFullDetails}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: '',
          headerRight: () => {
            return (
              <View style={{flexDirection: 'row'}}>
                <Image
                  style={{width: 20, height: 20}}
                  resizeMode="contain"
                  source={require('../assets/bell.png')}
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen
        name="FII_DIIActivity"
        component={FII_DIIActivity}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'FII/FPI & DII Activity',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="IPO"
        component={IpoTabNavigation}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'IPO',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="CompanyDetails"
        component={CompanyDetails}
        options={({route}) => ({
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: route.params?.item?.companyName || '',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        })}
      />

      <Stack.Screen
        name="InvestorDetails"
        component={InvestorsTabNavigation}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Investor Name',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="Deals"
        component={DealsTabNavigation}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Deals',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="DealsCompanyDetails"
        component={DealsCompanyDetailsTabNavigation}
        options={({route}) => ({
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: route.params?.params?.item?.companyName || '',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        })}
      />

      <Stack.Screen
        name="Investors"
        component={SearchInvestor}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Investors',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />

      <Stack.Screen
        name="TricksList"
        component={TricksList}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
            title:'Sandbox',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryDetails}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
            title:'History',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CreateTrick"
        component={CreateTrick}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
            title:'Bot Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="TrickDetails"
        component={TrickDetails}
        options={({route}) => ({
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          title: route.params?.symbol || '',
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="LevelDetails"
        component={LevelDetails}
        options={({route}) => ({
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          title: route.params?.item?.symbol || '',
          headerShown: true,
          headerRight: () => {
            return (
              <Pressable
                onPress={() => {
                  navigation.navigate('TrickDetails', {
                    id: route?.params?.item.id,symbol:route?.params?.item.symbol,token:route?.params?.token
                  });
                }}>
                <Image
                  style={{width: 24, height: 24}}
                  resizeMode="contain"
                  source={require('./../assets/edit.png')}
                />
              </Pressable>
            );
            }
        })}
      />
      <Stack.Screen
        name="StockDetails"
        component={StockDetails}
        options={({route}) => ({
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          title: route.params?.item?.symbol || '',
          headerShown: true,
          headerRight: () => {
            return (
              <Pressable
                onPress={() => {
                  navigation.navigate('TrickDetails', {
                    item: route?.params?.item,
                  });
                }}>
                <Image
                  style={{width: 24, height: 24}}
                  resizeMode="contain"
                  source={require('./../assets/edit.png')}
                />
              </Pressable>
            );
            }
        })}
      />
      <Stack.Screen
        name="SearchStocks"
        component={SearchStocks}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
            title:'Search Stocks',
          headerShown: true,
          headerRight: () => {
            return (
                <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 24, height: 24}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
            }
        }}
      />
      <Stack.Screen
        name="AutoInvest"
        component={AutoInvestTabNavigation}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Auto Investment',
          headerRight: () => {
            return (
              <Pressable onPress={()=>share()}>
                <Image
                  style={{width: 20, height: 20, marginRight: 20}}
                  resizeMode="contain"
                  source={require('./../assets/shareFillWhite.png')}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="PricingPlans"
        component={PricingPlans}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Pricing & Plans',
        }}
      />
      <Stack.Screen
        name="MySubscription"
        component={MySubscription}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'MySubscriptions',
        }}
      />
      <Stack.Screen
        name="MyTransaction"
        component={MyTransaction}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'My Transactions',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="ConfirmSubscription"
        component={ConfirmSubscription}
        options={{
          ...defaultScreenOptions,
          headerStyle: {
            backgroundColor: '#0158aa',
          },
          headerShown: true,
          title: 'Confirm Subscription',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import AuthStackNavigation from './AuthStackNavigation';
import * as authAction from '../redux/actions/authAction';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

const MainNavigation = props => {
  return (
    <NavigationContainer>
      <AuthStackNavigation />
    </NavigationContainer>
  );
};

const mapStateToProps = state => ({
  userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(MainNavigation);

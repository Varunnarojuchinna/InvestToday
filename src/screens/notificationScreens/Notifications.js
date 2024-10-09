import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { get } from '../../services/axios';
import { urlConstants } from '../../constants/urlConstants';
import moment from 'moment';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const notificationTypes = {
  1:'Push',
  2:'General'
};
const NotificationStatus = {
  OPEN: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};
const NotificationCategory = {
  ALL_USERS: 1,
  SUBSCRIPTION_USERS: 2,
};
const Notifications = (props) => {
  const {userInfo}=props;
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
        getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      const response = await get(urlConstants.getNotifications);
      const sortedNotifications = response.filter((item) => item.status === NotificationStatus.COMPLETED);
      const filterNotificationOnSubscriptionStatus = userInfo?.userDetails?.isUserSubscribed
        ? sortedNotifications
        : sortedNotifications.filter(notification => NotificationCategory.ALL_USERS === notification.category);
      setNotifications(filterNotificationOnSubscriptionStatus);
    } catch (error) {
      console.log('Notification fetch error', error);
    }
  };

  const filteredNotifications = activeTab === 'All'
  ? notifications.sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on))
  : notifications.filter(notification => notificationTypes[notification.type] === activeTab).sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on));

  const formatTime = (dateTime)=>{
    const date = new Date(dateTime);
    const time = date.toISOString().replace('T',' ').split('.')[0];
    return time;
}
  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && { color: '#0158aa' }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'General' && styles.activeTab]}
          onPress={() => setActiveTab('General')}
        >
          <Text style={[styles.tabText, activeTab === 'General' && { color: '#0158aa' }]}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Push' && styles.activeTab]}
          onPress={() => setActiveTab('Push')}
        >
          <Text style={[styles.tabText, activeTab === 'Push' && { color: '#0158AA' }]}>Push</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {filteredNotifications.map(notification => (
          <View key={notification.id}>
            <View style={styles.notificationRow}>
              <Image source={require('../../assets/bellCategoryIcon.png')} style={styles.notificationIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.notificationTitle}numberOfLines={1}>{notification.message}</Text>
                <Text style={styles.notificationContent}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{moment(formatTime(notification.updated_on)).format("DD MMM YYYY")}</Text>
              </View>
            </View>
            <View style={styles.separator} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0158aa',
  },
  tabText: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: 16,
    color: '#d3d3d3',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: 16,
    marginBottom: 5,
    color: '#1b2533'
  },
  notificationContent: {
    fontFamily: 'NotoSans-Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'NotoSans-Regular',
  },
  notificationAction: {
    fontSize: 14,
    color: '#0158aa',
    fontFamily: 'NotoSans-SemiBold',
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});
const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});
const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
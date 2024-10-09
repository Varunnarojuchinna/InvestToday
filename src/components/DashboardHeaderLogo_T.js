import React, { useRef, useState, useCallback } from "react";
import { Image, Pressable, View, Modal, StyleSheet, Text } from "react-native";
import * as authAction from '../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BrokerInfoModal from "./BrokerInfoModal";
import { get } from "../services/axios";
import { urlConstants } from "../constants/urlConstants";
import { BrokerTypes, NotificationCategory } from "../constants/appConstants";

const LogoTitleNotification = (props) => {
  const navigation = useNavigation();
  const { userInfo } = props;
  const { userDetails } = userInfo;
  const [isBrokerListModalVisible, setBrokerListModalVisible] = useState(false);
  const [isBrokerInfoModalVisible, setBrokerInfoModalVisible] = useState(false);
  const [brokerListModalPosition, setBrokerListModalPosition] = useState({ top: 0, left: 0 });
  const [isAliceBlueConnected, setIsAliceBlueConnected] = useState(false);
  const [aliceBlueBalance, setAliceBlueBalance] = useState();
  const [isAngelOneConnected, setIsAngelOneConnected] = useState(false);
  const [angelOneBalance, setAngelOneBalance] = useState(); 
  const connectImageRef = useRef(null);
  const [brokerName, setBrokerName] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  
  useFocusEffect(
    useCallback(() => {
      getNotifications();
      if (userDetails?.id) {
        getBrokerDetails();
      }
    }, [userDetails?.id, isBrokerInfoModalVisible, isBrokerListModalVisible])
  );

  const getNotifications = async () => {
      get(urlConstants.getNotifications)
      .then(async (response) => {      
      const currentDate = new Date().toISOString().split('T')[0];
      let todayNotifications = [];
      if (!userDetails?.isUserSubscribed) {
         todayNotifications = response.filter(notification => notification.category === NotificationCategory.ALL_USERS).filter(notification => {
          const notificationDate = notification.updated_on.split('T')[0]
          return notificationDate === currentDate;
         });
      }
      else {
       todayNotifications = response.filter(notification => {
        const notificationDate = notification.updated_on.split('T')[0];
        return notificationDate === currentDate;
      });
    }
      setNotificationCount(todayNotifications.length);
    })
    .catch ((error)=> {
      console.log('error', error);
    });
  };
  
  const getBrokerDetails = async () => {
    getAliceBlueAccountStatus();
    getAngelOneAccountStatus();
  };

  const getAliceBlueAccountStatus = async () => {
    try {
      const response = await get(urlConstants.getBrokerAccountStatus, userDetails.token);
      if (response.brokerConnectionStatus && response.brokerConnectionStatus.length > 0) {
        response.brokerConnectionStatus.forEach(brokerStatus => {
          if (brokerStatus.type === BrokerTypes.ALICE_BLUE && brokerStatus.status === 'connected') {
            setIsAliceBlueConnected(true);
            setAliceBlueBalance(brokerStatus.balance);
          }
        });
      }
    } catch (error) {
      setIsAliceBlueConnected(false);
      console.log('error', error);
    }
  };

  const getAngelOneAccountStatus = async () => {
    try {
      const response = await get(urlConstants.getAngelOneAccountStatus, userDetails.token);
      if (response.brokerConnectionStatus && response.brokerConnectionStatus.length > 0) {
        response.brokerConnectionStatus.forEach(brokerStatus => {
          if (brokerStatus.type === BrokerTypes.ANGEL_ONE && brokerStatus.status === 'Connected') {
            setIsAngelOneConnected(true);
            setAngelOneBalance(brokerStatus.balance);
          }
        });
      }
    } catch (error) {
      setIsAngelOneConnected(false);
      console.log('error', error);
    }
  };

  const toggleProfileModal = () => {
    navigation.navigate('Profile');
  };
  const toggleBrokerListModal = () => {
    if (connectImageRef.current) {
      connectImageRef.current.measure((fx, fy, width, height, px, py) => {
        setBrokerListModalPosition({ top: py + height });
      });
    }
    setBrokerListModalVisible(!isBrokerListModalVisible);
  };
  const toggleBrokerInfoModal = () => {
    setBrokerInfoModalVisible(!isBrokerInfoModalVisible);
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };  

  const handleConnect = (broker) => {
    setBrokerName(broker);
    toggleBrokerListModal();
    toggleBrokerInfoModal();
  }
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Image
          style={{ width: 100, height: 60 }}
          resizeMode="contain"
          source={require('./../assets/logoWhite.png')}
        />
        {userInfo?.isUserLoggedIn && <Pressable onPress={() => toggleBrokerListModal()}>
          <Image
            style={{ width: 25, height: 25, marginLeft: 10 }}
            resizeMode="contain"
            source={require('./../assets/brokerIcon.png')}
            ref={connectImageRef}
          />
        </Pressable>}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: '10%', justifyContent: 'flex-end' }}>

        <Pressable onPress={handleNotifications} style={{ justifyContent: 'center', marginLeft: 16 }}>
        <View style={{ position: 'relative' }}>
            <Image
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
              source={require('./../assets/bell.png')}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
        <Pressable accessibilityLabel="menu" onPress={toggleProfileModal}>
          <Image accessibilityLabel="menuImage"
            style={{ width: 25, height: 25,marginLeft: 10,borderRadius:20 }}
            resizeMode="contain"
            source={userInfo?.userDetails?.metadata?.profile_url
              ?{uri:userInfo.userDetails?.metadata?.profile_url}:require('./../assets/profileSetting.png')}
          />
        </Pressable>
      </View>
      <Modal
  transparent={true}
  visible={isBrokerListModalVisible}
  onRequestClose={() => toggleBrokerListModal()}
>
  <Pressable style={{ flex: 1 }} onPress={toggleBrokerListModal}>
    <View style={[styles.modalContainer, brokerListModalPosition]}>
      <Pressable style={styles.modalContent} onPress={() => {}}>
        <Pressable style={[styles.closeCircle, styles.iconLayout1]} onPress={toggleBrokerListModal}>
          <Image
            style={styles.iconLayout}
            resizeMode="cover"
            source={require('../assets/closeFillBlue.png')}
          />
        </Pressable>

        <Pressable onPress={() => !isAliceBlueConnected && handleConnect('Alice Blue')}>
          <View style={{ paddingRight: 8, paddingLeft: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                style={{ width: 30, height: 30, borderWidth: 1, borderColor: '#0158aa', borderRadius: 8 }}
                resizeMode="contain"
                source={require('./../assets/aliceBlue.png')}
              />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                  <Text style={{ fontFamily: "NotoSans-Regular", fontWeight: "600", lineHeight: 20, fontSize: 14, color: '#445164' }}>
                   AliceBlue
                  </Text>
                  <Image
                      style={{ height: 12, width: 12, marginLeft: 4 }}
                      resizeMode="cover"
                      source={isAliceBlueConnected
                      ? require('../assets/dotLiveGreen.png')
                      : require('../assets/redDot.png')}
                  />
                </View>
                {isAliceBlueConnected && (
                  <Text style={{ marginLeft: 5, fontFamily: "NotoSans-Regular", fontWeight: "400", textAlign: "left", lineHeight: 20, fontSize: 12, color: "#445164" }}>
                    Bal: {aliceBlueBalance}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Pressable>

        <Pressable onPress={() => !isAngelOneConnected && handleConnect('AngelOne')}>
          <View style={{ padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                style={{ width: 30, height: 30, borderWidth: 1, borderColor: '#0158aa', borderRadius: 8 }}
                resizeMode="contain"
                source={require('./../assets/angelBroker.png')}
              />
              <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                <Text style={{ fontFamily: "NotoSans-Regular", fontWeight: "600", lineHeight: 20, fontSize: 14, color: '#445164' }}>
                  AngelOne
                </Text>
                <Image
                      style={{ height: 12, width: 12, marginLeft: 4 }} 
                      resizeMode="cover"
                      source={isAngelOneConnected
                      ? require('../assets/dotLiveGreen.png')
                      : require('../assets/redDot.png')}
                  />
              </View>
              {isAngelOneConnected && (
                <Text style={{ marginLeft: 5, fontFamily: "NotoSans-Regular", fontWeight: "400", textAlign: "left", lineHeight: 20, fontSize: 12, color: '#445164' }}>
                  Bal: {angelOneBalance}
                </Text>
              )}
            </View>
          </View>
          </View>
        </Pressable>
      </Pressable>
    </View>
  </Pressable>
</Modal>
      <BrokerInfoModal visible={isBrokerInfoModalVisible} broker={brokerName} onClose={toggleBrokerInfoModal} />

    </View>
  )
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  continuefieldFlexBox: {
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  saveBaseButton: {
    backgroundColor: "#0158aa",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  textSave: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff"
  },
  textTypo: {
    fontFamily: "NotoSans-Regular",
    fontWeight: "500"
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '38%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#eaecf0',
    borderWidth: 2
  },
  modalTitle: {
    fontFamily: "NotoSans-SemiBold",
    fontWeight: "600",
    textAlign: "left",
    lineHeight: 20,
    fontSize: 14,
    color: "#445164",

  },
  iconLayout1: {
    height: 16,
    width: 16,
  },
  iconLayout: {
    height: "100%",
    width: "100%"
  },
  closeCircle: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginRight: 2,

  },
});

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(LogoTitleNotification);
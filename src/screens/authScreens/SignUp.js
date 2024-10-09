import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  Image,
  TextInput,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { get, post, put } from '../../services/axios';
import { connect } from 'react-redux';
import { urlConstants } from '../../constants/urlConstants';
import * as authAction from '../../redux/actions/authAction';
import { bindActionCreators } from 'redux';
import { ErrorMessages, SourceType } from '../../constants/appConstants';
import Config from 'react-native-config';
import { OneSignal } from 'react-native-onesignal';

const { height } = Dimensions.get('window');

const SignUpScreen = props => {
  const [fadeAnim] = useState(new Animated.Value(height));
  const { actions } = props;
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [loading, setIsLoading] = useState(false);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: height * 0.06,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      // iosClientId:
      //   '841324790556-hmdj3qu2v766pqhve67v172voj0fcenj.apps.googleusercontent.com',
      iosClientId: '503888032959-bbv5p1ib77as5dtumj2bs86dc7ffm27h.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isPhoneNumber = (value) => /^\d{10}$/.test(value);

  const validateEmailOrPhoneNumber = (value) => {
    if (!value) {
      return ErrorMessages.EMAIL_OR_PHONE_NUMBER_REQUIRED;
    } else if (!isEmail(value) && !isPhoneNumber(value)) {
      return ErrorMessages.EMAIL_OR_PHONE_NUMBER_INVALID;
    }
    return true;
  };

  const authenticateUser = (loginParams) => {
    put(urlConstants.userLogin, loginParams)
      .then((res) => {
        getUserInfo(loginParams.email_id, res.token)
      })
      .catch(err => {
        setIsLoading(false);
        console.log('authenticate',err)
      })
  };
  const GoogleSingUp = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn().then(result => {
        setIsLoading(true);
        const loginParams = {
          "email_id": result.user.email,
          "password": result.idToken,
          "source_type": SourceType.CREATE_USER_GOOGLE_SIGN_IN
        }
        get(`${urlConstants.validateUser}emailId=${result.user.email}`)
          .then((res) => {
            setIsLoading(false)
            if (res.isUserValid) {
              authenticateUser(loginParams)
            }
            else {
              const params = {
                email_id: result.user.email,
                name: result.user.name,
                source_type: SourceType.CREATE_USER_GOOGLE_SIGN_IN,
                is_active: true,
              };
              post(urlConstants.createUser, params)
                .then(resp => {
                  const loginParams = {
                    "email_id": result.user.email,
                    "password": result.idToken,
                    "source_type": SourceType.CREATE_USER_GOOGLE_SIGN_IN
                  }
                  authenticateUser(loginParams)
                })
                .catch(error => {
                  console.log('Create err', error);
                })
            }
          })
          .catch(err => {
            setIsLoading(false);
            console.log('verify',err)
          })
      });
    } catch (error) {
      setIsLoading(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        alert('User cancelled the login flow !');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('Google play services not available or outdated !');
      } else {
        console.log(error);
      }
    }
  };

  const getUserInfo = (email, token) => {
    setIsLoading(true)
    get(urlConstants.validateEmail + email, token)
      .then(async (res) => {
        setIsLoading(false)
        const subscriptionStatus = await checkSubscriptionStatus(token);
        actions.setLoginInfoAction({ isUserLoggedIn: true, userDetails: { ...res.dbResponse, email_id: res.email, token: token,isUserSubscribed:subscriptionStatus } });
        OneSignal.login(res.dbResponse.id)
        if (res.dbResponse.is_phone_number_verified) {
          props.navigation.navigate('LoadingScreen')
        }
        else {
          props.navigation.navigate('AddPhoneNumber')
        }
      })
      .catch(err => {
        setIsLoading(false)
      })
  };

  const checkSubscriptionStatus = async (token) => {
    try {
      const response = await  get(urlConstants.getCurrentSubscription,token)
      if (response && response.subscription_is_active && response.is_active) {
        return true;
      } else {        
        console.log('User is not subscribed.');
        return false;
      }
    } catch (error) {
      
      console.log('Error fetching subscription status:', error);
      return false;
    }
  };

  const onSubmit = data => {
    setIsLoading(true);
    const { emailOrPhone } = data;
    try {
      if (isEmail(emailOrPhone)) {
        get(`${urlConstants.validateUser}emailId=${emailOrPhone}`)
          .then(res => {
            setIsLoading(false)
            if (res.isUserValid) {
              navigation.navigate('Login', { email: emailOrPhone })
            } else {
              setError("emailOrPhone", { type: "manual", message: ErrorMessages.EMAIL_NOT_REGISTERED });
            }
          })
          .catch(err => {
            setIsLoading(false)
            setError("emailOrPhone", { type: "manual", message: ErrorMessages.EMAIL_NOT_REGISTERED });
          })
      } else if (isPhoneNumber(emailOrPhone)) {
        let fullPhoneNumber = '91' + emailOrPhone;
        get(`${urlConstants.validateUser}phoneNumber=${fullPhoneNumber}`)
          .then(res => {
            setIsLoading(false)
            if (res.isUserValid) {
              put(urlConstants.sendOTP + res.userId, { phone_number: fullPhoneNumber })
                .then(resp => {
                  setIsLoading(false)
                  props.navigation.navigate('OTP', { phoneNumber: emailOrPhone, userId: res.userId, login: true });
                })
                .catch(err => {
                  setIsLoading(false)
                  console.log('err', err)
                })
            } else {
              setError("emailOrPhone", { type: "manual", message: ErrorMessages.PHONE_NUMBER_NOT_REGISTERED });
            }
          })
          .catch(err => {
            setIsLoading(false)
            setError("emailOrPhone", { type: "manual", message: ErrorMessages.PHONE_NUMBER_NOT_REGISTERED });
          })
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleCreateAccount = () => {
    Animated.timing(fadeAnim, {
      toValue: -height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('CreateAccount');
    });
  };

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: height * 0.06,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', handleBack);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0158aa" />
          <Text style={{ color: '#000', marginTop: 5, fontFamily: 'NotoSans-SemiBold' }}>Processing</Text>
        </View>
      )}
      <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
      <View style={styles.groupParent}>
        <View style={styles.groupWrapper}>
          <View style={styles.frame}>
            <Image
              style={[styles.shapeIcon]}
              resizeMode="stretch"
              source={require('../../assets/logoWhite.png')}
            />
          </View>
        </View>
        <Text style={styles.whereEveryDecision}>
          where every decision counts. Get real-time insights and expert
          analysis for your financial success."
        </Text>
      </View>
      <Animated.View
        style={[styles.formContainer, { transform: [{ translateY: fadeAnim }] }]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 220 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}keyboardShouldPersistTaps="handled">
        <View style={styles.socialButtonParent}>
          <View style={[styles.socialButton, styles.buttonFlexBox]}>
            <Image
              style={styles.socialIcon}
              resizeMode="cover"
              source={require('../../assets/apple.png')}
            />
            <Text style={[styles.text, styles.textTypo1]}>
              Sign in with Apple
            </Text>
          </View>
          <View style={styles.socialButtonGroup}>
            <Pressable onPress={() => GoogleSingUp()}>
              <View style={[styles.socialButton1, styles.fieldBorder]}>
                <Image
                  style={styles.socialIcon}
                  resizeMode="cover"
                  source={require('../../assets/googleicon.png')}
                />
                <Text style={[styles.text1, styles.textTypo1]}>
                  Log in / Sign up with Google
                </Text>
              </View>
            </Pressable>
            <View style={styles.orParent}>
              <View style={styles.or}>
                <View style={styles.orItemBorder} />
                <Text style={styles.or1}>Or</Text>
                <View style={[styles.orItem, styles.orItemBorder]} />
              </View>
              <View style={styles.baseInputFieldParent}>
                <Pressable style={styles.baseInputField} onPress={() => { }}>
                  <Text style={[styles.label, styles.textTypo]}>Email or Phone Number</Text>
                  <View style={[styles.field, styles.fieldFlexBox]}>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Enter Email or Phone Number"
                          placeholderTextColor={'#697483'}
                          style={{ color: '#000000', width: '100%' }}
                        />
                      )}
                      name="emailOrPhone"
                      rules={{
                        validate: validateEmailOrPhoneNumber
                      }}
                      defaultValue=""
                    />
                  </View>
                  {errors.emailOrPhone && <View style={styles.hintFlexBox}>
                    <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                    <Text style={[styles.hintText, styles.labelTypo]}>{errors.emailOrPhone.message}</Text>
                  </View>}
                </Pressable>
                <Pressable onPress={handleSubmit(onSubmit)}>
                  <View style={[styles.baseButton, styles.buttonFlexBox]}>
                    <Text style={[styles.text2, styles.textTypo]}>Login</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
          <Pressable accessibilityLabel="createAccount" accessibility
            style={styles.text3} onPress={handleCreateAccount}>
            <Text style={[styles.text4, styles.labelTypo]}>
              <Text style={styles.newUser}>
                <Text style={styles.newUser1}>New User?</Text>
                <Text style={styles.textTypo}>{` `}</Text>
              </Text>
              <Text accessibilityLabel="createAccountText" style={styles.createAnAccount}>Create an Account</Text>
            </Text>
          </Pressable>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
};
const mapStateToProps = state => ({
  userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(SignUpScreen);

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  shapeIcon: {
    alignSelf: 'center',
    width: 180,
    height: 75,
  },
  whereEveryDecision: {
    marginTop: 20,
    alignSelf: 'flex-end',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'NotoSans-Medium',
    color: '#758195',
    textAlign: 'center',
    justifyContent: 'center',
    width: 281,
  },
  buttonFlexBox: {
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  hintFlexBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  lock1Icon: {
    width: 18,
    height: 18,
  },
  hintText: {
    fontFamily: 'NotoSans-Regular',
    color: '#697483',
    marginLeft: 4,
    lineHeight: 18,
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  textTypo1: {
    marginLeft: 12,
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    lineHeight: 24,
    fontSize: 16,
  },
  fieldBorder: {
    borderWidth: 1,
    borderColor: '#d6dae1',
    borderStyle: 'solid',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 8,
  },
  orItemBorder: {
    height: 1,
    borderTopWidth: 1,
    borderColor: '#eceef0',
    borderStyle: 'solid',
    flex: 1,
  },
  textTypo: {
    fontFamily: 'NotoSans-Medium',
    fontWeight: '500',
  },
  labelTypo: {
    fontSize: 14,
    textAlign: 'left',
  },
  socialIcon: {
    width: 24,
    height: 24,
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
  },
  fieldFlexBox: {
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  socialButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowOpacity: 1,
    elevation: 16,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: 'rgba(27, 37, 51, 0.06)',
  },
  text1: {
    color: '#323e4f',
  },
  socialButton1: {
    justifyContent: 'center',
    shadowOpacity: 1,
    elevation: 16,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: 'rgba(27, 37, 51, 0.06)',
    borderColor: '#d6dae1',
    borderStyle: 'solid',
    backgroundColor: '#fff',
  },
  or1: {
    color: '#0158aa',
    marginLeft: 16,
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    lineHeight: 24,
    fontSize: 16,
  },
  orItem: {
    marginLeft: 16,
  },
  or: {
    zIndex: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    lineHeight: 20,
    fontSize: 14,
    textAlign: 'left',
    alignSelf: 'stretch',
    color: '#323e4f',
    fontSize: 16,
  },
  ofspacedesigncom: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'NotoSans-Regular',
    color: '#697483',
    textAlign: 'left',
    flex: 1,
  },
  field: {
    borderStyle: 'solid',
    borderColor: '#d6dae1',
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  baseInputField: {
    alignItems: 'flex-start',
  },
  text2: {
    textAlign: 'center',
    color: '#fff',
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'NotoSans-Medium',
    fontWeight: '500',
  },
  baseButton: {
    backgroundColor: '#0158aa',
    paddingHorizontal: 28,
    marginTop: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  baseInputFieldParent: {
    zIndex: 1,
    marginTop: 35,
  },
  frameChild: {
    position: 'absolute',
    top: 65,
    left: 345,
    width: 16,
    height: 16,
    zIndex: 2,
  },
  orParent: {
    marginTop: 24,
  },
  socialButtonGroup: {
    marginTop: 40,
  },
  newUser1: {
    fontFamily: 'Inter-Regular',
  },
  newUser: {
    color: '#697483',
  },
  createAnAccount: {
    fontFamily: 'Inter-SemiBold',
    color: '#0158aa',
    fontWeight: '600',
  },
  text4: {
    width: 343,
  },
  text3: {
    marginTop: 20,
  },
  socialButtonParent: {
    width: '100%',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#080808',
  },
  groupParent: {
    height: '10.92%',
    marginTop: '9.04%',
  },
  formContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    bottom: 0,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    height: '75%',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#dd3409',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 10,
  },
});

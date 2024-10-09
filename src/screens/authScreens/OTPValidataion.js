import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Text, StyleSheet, Pressable, View,ActivityIndicator, TextInput, Image, ScrollView,TouchableWithoutFeedback,KeyboardAvoidingView,Keyboard,Platform } from "react-native";
import { maskPhoneNumber } from "../../services/helpers";
import { put,get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import {bindActionCreators} from 'redux';
import * as authAction from '../../redux/actions/authAction';
import {connect} from 'react-redux';
import { ErrorMessages } from "../../constants/appConstants";
import OtpVerify from 'react-native-otp-verify';
import { OneSignal } from "react-native-onesignal";

const OTP = (props) => {
    const {userInfo,actions} = props;
    const {userDetails} = userInfo;
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isInvalidOtp, setIsInvalidOtp] = useState(false);
    const otpInputs = useRef([]);
    const { phoneNumber } = props.route.params;
    const { userId } = props?.route?.params;

    const { login } = props?.route?.params;
    const [loading,setIsLoading] = useState(false)   
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    useEffect(() => {
        let timer;
        if (isResendDisabled) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isResendDisabled]);

    useEffect(() => {
        OtpVerify.getHash()
            .then(hash => {
                console.log('Hash:', hash);
            })
            .catch(error => {
                console.log(error);
            });

        OtpVerify.getOtp()
            .then(p => OtpVerify.addListener(otpHandler))
            .catch(error => {
                console.log(error);
            });

        return () => {
            OtpVerify.removeListener();
        };
    }, []);

    const otpHandler = (message) => {
        const otpCode = message?.match(/\d{4}/)[0];
        if (otpCode) {
            const newOtp = otpCode.split('');
            setOtp(newOtp);
            newOtp.forEach((digit, index) => {
                if (otpInputs.current[index]) {
                    otpInputs.current[index].value = digit;
                }
            });
            handleLogin(otpCode);
        }
    };

    const handleOtpChange = (index, value) => {
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                otpInputs.current[index + 1].focus();
            }
            if (!value && index > 0) {
                otpInputs.current[index - 1].focus();
            }
        }
    };
    const ResendOTP = () => {
        if(isResendDisabled) return;
        setOtp(['','','',''])
        setIsInvalidOtp(false)
        setIsLoading(true)
        let countryCode = "91";
        let fullPhoneNumber = countryCode + phoneNumber;
        const params={
            phone_number:fullPhoneNumber
        }
        let id = userDetails.id||userId;
        put(urlConstants.sendOTP + id,params)
            .then(res => {
                setIsLoading(false);
                setIsResendDisabled(true);
            })
            .catch(err => {
                setIsLoading(false);
            })
   };

    const handleLogin = (enteredOtp = undefined) => {
        setIsLoading(true);
        setIsInvalidOtp(false);
        const params = {
            otp: enteredOtp || otp.join(''),
            phone_number: '91' + phoneNumber
        };
        let id = userDetails?.id || userId;
        put(urlConstants.verifyOTP + id, params)
            .then((resp) => {
                setIsLoading(false)
                if(resp.messageType=='WARN'){
                    setIsInvalidOtp(true)
                } 
                else{    
                    getUserInfo('91'+phoneNumber,resp.token);         
                }
            })
            .catch(error => {
                setIsLoading(false)
                setIsInvalidOtp(true);
            });
    };

    const getUserInfo = (phoneNumber,token) => {
        setIsLoading(true)
        get(urlConstants.validatePhoneNumber + phoneNumber,token)
            .then(async (res) => {
                setIsLoading(false)
                OneSignal.login(res.dbResponse.id)
                const subscriptionStatus = await checkSubscriptionStatus(token);
                actions.setLoginInfoAction({ isUserLoggedIn: true,userDetails:{...res.dbResponse,email_id:res.email,token:token,isUserSubscribed:subscriptionStatus} });
                props.navigation.navigate('LoadingScreen')     
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

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
             {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0158aa" />
          <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
        </View>
      )}
            <View style={styles.frameParent}>
                <View>
                    <Text style={[styles.weHave6Container, styles.wrongNumberClr]}>
                        <Text style={styles.text2Typo}>{`We have sent a 4 digit code to the mobile `}</Text>
                        <Text style={styles.labelTypo}>{maskPhoneNumber(phoneNumber)}</Text>
                        <Text style={styles.text}>.</Text>
                    </Text>
                    {!login && <Pressable style={styles.wrongNumberEditContainer} onPress={() => { props.navigation.navigate('PhoneNumber') }}>
                        <Text style={styles.text1}>
                            <Text style={[styles.wrongNumber, styles.text2Typo]}>{`Wrong number? `}</Text>
                            <Text style={[styles.edit, styles.editTypo]}>Edit</Text>
                        </Text>
                    </Pressable>}
                </View>
                <View style={[styles.otpFieldParent, styles.baseButtonSpaceBlock]}>
                    <Text style={[styles.label, styles.labelPosition]}>Enter 4 digit code sent to your mobile</Text>
                    <View style={styles.otpField}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (otpInputs.current[index] = el)}
                                style={[styles.otpInput, isInvalidOtp && { borderColor: '#f1ae9d' }, { color: '#000000' }]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(index, value)}
                                maxLength={1}
                                keyboardType="numeric"
                                textContentType="oneTimeCode"
                            />
                        ))}
                    </View>
                </View>
                {isInvalidOtp && (
                    <View style={styles.errorContainer}>
                        <Image style={styles.warningIcon} resizeMode="cover" source={require("../../assets/warning.png")} />
                        <Text style={[styles.hintText, styles.labelTypo]}>{ErrorMessages.OTP_INVALID}</Text>
                    </View>
                )}
                <Pressable onPress={()=>ResendOTP()}>
                    <Text style={styles.didntGetSmsContainer}>
                        <Text style={[styles.wrongNumber, styles.text2Typo]}>{`Didn’t get SMS? `}</Text>
                        <Text style={[styles.resend, styles.editTypo]}>{isResendDisabled ? `Resend in ${countdown}s` : 'Resend'}</Text>
                    </Text>
                </Pressable>
            </View>
            <View style={styles.buttonContainer}>
                <Pressable style={styles.baseButton} onPress={() => handleLogin()}>
                    <Text style={[styles.text2, styles.text2Typo]}>Verify</Text>
                </Pressable>
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
};

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
  });
  
  const ActionCreators = Object.assign({}, authAction);
  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
  });
  export default connect(mapStateToProps, mapDispatchToProps)(OTP);

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      },
    wrongNumberClr: {
        color: "#242f3e",
        fontSize: 14,
    },
    text2Typo: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
    },
    editTypo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 16,
    },
    baseButtonSpaceBlock: {
        marginTop: 40,
    },
    otpInput: {
        width: 45,
        height: 45,
        borderWidth: 1.2,
        borderColor: "#b4b9c1",
        borderRadius: 4,
        textAlign: 'center',
        fontSize: 18,
    },
    labelPosition: {
        top: 0,
    },
    labelTypo: {
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
    },
    text: {
        fontFamily: "NotoSans-Regular",
    },
    weHave6Container: {
        lineHeight: 21,
        textAlign: "left",
    },
    wrongNumber: {
        color: "#242f3e",
        fontSize: 14,
    },
    edit: {
        color: "#0158aa",
    },
    text1: {
        textAlign: "left",
    },
    wrongNumberEditContainer: {
        marginTop: 14,
    },
    otpField: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    label: {
        lineHeight: 23,
        color: "#323e4f",
        fontSize: 16,
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        textAlign: "left",
        alignSelf: 'flex-start',
    },
    otpFieldParent: {
        height: 120,
        paddingVertical: 20,
    },
    resend: {
        color: "#0158aa",
    },
    didntGetSmsContainer: {
        marginTop: 24,
        textAlign: "left",
    },
    text2: {
        lineHeight: 24,
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    },
    baseButton: {
        margin: 16,
        borderRadius: 8,
        backgroundColor: "#0158aa",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
    frameParent: {
        margin: 16,
        flex: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    warningIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    hintText: {
        color: '#f1ae9d',
        fontSize: 14,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        backgroundColor: '#fff'
    },
});


import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, ActivityIndicator, Pressable, ScrollView, Alert } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { urlConstants } from "../../constants/urlConstants";
import { get, put } from "../../services/axios";
import * as authAction from '../../redux/actions/authAction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ErrorMessages, SourceType } from "../../constants/appConstants";
import { OneSignal } from "react-native-onesignal";


const Login = (props) => {
    const { control, handleSubmit, formState: { errors }, setError } = useForm();
    const { email } = props?.route?.params
    const { actions, userInfo } = props;
    const { userDetails } = userInfo;
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setIsLoading] = useState(false)

    const handlePassword = () => {
        setShowPassword(!showPassword)
    }
    const onSubmit = (data) => {
        setIsLoading(true)
        const params = {
            "email_id": data.email,
            "password": data.password,
            "source_type": SourceType.CREATE_USER_SIGN_UP_LOGIN_IN
        }
        put(urlConstants.userLogin, params)
            .then((res) => {
                setIsLoading(false)
                getUserInfo(data.email,res.token)
            })
            .catch(err => {
                setIsLoading(false)
                setError("password", { type: "manual", message: ErrorMessages.PASSWORD_DOES_NOT_MATCH });
            })
    };

    const getUserInfo = (email,token) => {
        setIsLoading(true)
        get(urlConstants.validateEmail + email,token)
            .then(async (res) => {
                setIsLoading(false)
                const subscriptionStatus = await checkSubscriptionStatus(token);
                actions.setLoginInfoAction({ isUserLoggedIn: true,userDetails:{...res.dbResponse,email_id:res.email,token:token,isUserSubscribed:subscriptionStatus} });
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
    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
                </View>
            )}
            <ScrollView>

                <View style={[styles.frameWrapper, { flex: 1, margin: 10, marginLeft: 10 }]}>

                    <View style={styles.baseInputField}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.field, styles.fieldFlexBox, errors.email && { borderColor: '#dd3409' }]}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require('../../assets/mail.png')} />

                            <Controller
                                control={control}
                                rules={{
                                    required: ErrorMessages.EMAIL_REQUIRED,
                                    pattern: { value: /\S+@\S+\.\S+/, message: ErrorMessages.EMAIL_INVALID }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        placeholderTextColor={'#697483'}
                                        style={{ color: '#000000', width: '100%' }}
                                        placeholder="eg. Joe@gmail.com"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="email"
                                defaultValue={email}
                            />
                        </View>
                        {errors.email && <View style={styles.hintFlexBox}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                            <Text style={[styles.hintText, styles.labelTypo]}>{errors.email.message}</Text>
                        </View>}
                    </View>
                    <View style={styles.baseInputField1}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.field, styles.fieldFlexBox, errors.password && { borderColor: '#dd3409' }]}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require('../../assets/lock.png')} />

                            <Controller
                                control={control}
                                rules={{ required: ErrorMessages.PASSWORD_REQUIRED }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={{ width: '90%', color: '#000000' }}
                                        placeholderTextColor={'#697483'}
                                        placeholder="Enter Password"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry={!showPassword}
                                    />
                                )}
                                name="password"
                                defaultValue=""
                            />
                            <Pressable onPress={() => handlePassword()}>
                                {showPassword ?
                                    <Image style={[styles.lock1Icon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../../assets/eyeOpenIcon.png')} />

                                    : <Image style={[styles.lock1Icon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../../assets/eyeCloseIcon.png')} />
                                }
                            </Pressable>
                        </View>
                        {errors.password && <View style={styles.hintFlexBox}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                            <Text style={[styles.hintText, styles.labelTypo]}>{errors.password.message}</Text>
                        </View>}
                    </View>
                    <Pressable style={styles.button} onPress={() => { props.navigation.navigate('ResetPassword') }}>
                        <View style={styles.baseFlexBox}>
                            <Text style={[styles.text, styles.textTypo]}>Forgot Password?</Text>
                        </View>
                    </Pressable>
                    <Pressable style={[styles.baseButton1, styles.baseFlexBox, { alignItems: 'flex-end' }]} onPress={handleSubmit(onSubmit)}>
                        <Text style={[styles.text1, styles.textTypo]}>Login</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}
const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    groupChildPosition: {
        left: "0%",
        position: "absolute"
    },
    batteryIconLayout: {
        width: 24,
        position: "absolute"
    },
    parentPosition1: {
        left: 16,
        position: "absolute"
    },
    hintText: {
        fontFamily: "NotoSans-Regular",
        color: "#697483",
        marginLeft: 4,
        lineHeight: 20,
        textAlign: "left",
        fontSize: 14,
        flex: 1
    },
    labelTypo: {
        textAlign: "left",
        fontSize: 14
    },
    lock1Icon: {
        width: 20,
        height: 20
    },
    hintFlexBox: {
        marginTop: 8,
        flexDirection: "row",
        alignSelf: "stretch"
    },
    fieldFlexBox: {
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
        flex: 1
    },
    parentPosition: {
        bottom: "0%",
        top: "0%",
        height: "100%",
        position: "absolute"
    },
    todayTypo: {
        textAlign: "left",
        fontFamily: "MagistralCondW08-Medium",
        position: "absolute"
    },
    textTypo: {
        lineHeight: 24,
        fontSize: 16,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "center"
    },
    baseFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    emailChild: {
        top: 0,
        width: 393,
        height: 88,
        left: 0,
        position: "absolute"
    },
    batteryIcon: {
        marginTop: -4.17,
        right: 15,
        height: 11,
        top: "50%",
        width: 24
    },
    wifiIcon: {
        width: 15,
        height: 11
    },
    cellularIcon: {
        width: 17,
        height: 11
    },
    time: {
        marginTop: -5.5,
        left: 23,
        letterSpacing: 0,
        fontWeight: "600",
        fontFamily: "NotoSans-SemiBold",
        width: 30,
        height: 17,
        textAlign: "center",
        fontSize: 14,
        color: "#fff",
        top: "50%",
        position: "absolute"
    },
    statusbariphoneXLightBackg: {
        height: "5.99%",
        top: "-1.06%",
        bottom: "95.07%",
        right: "0%",
        width: "100%"
    },
    icon: {
        height: "100%",
        overflow: "hidden",
        width: "100%"
    },
    keyboardBackspace: {
        top: 10,
        height: 24,
        left: 0
    },
    invest: {
        height: "92.95%",
        width: "99.72%",
        fontSize: 28,
        lineHeight: 41,
        color: "#189877",
        top: "0%",
        fontFamily: "MagistralCondW08-Medium",
        left: "0%"
    },
    today: {
        height: "31.82%",
        width: "34.19%",
        top: "68.29%",
        left: "65.75%",
        fontSize: 9,
        lineHeight: 13,
        color: "#8f97a2"
    },
    investParent: {
        width: "72.37%",
        right: "-0.05%",
        left: "27.68%"
    },
    groupChild: {
        height: "79.09%",
        width: "31.13%",
        top: "7.47%",
        right: "68.87%",
        bottom: "13.44%",
        maxWidth: "100%",
        maxHeight: "100%",
        overflow: "hidden"
    },
    groupParent: {
        width: "70.8%",
        left: "29.2%",
        right: "0%"
    },
    keyboardBackspaceParent: {
        top: 37,
        width: 137,
        height: 44
    },
    label: {
        lineHeight: 20,
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        alignSelf: "stretch",
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14
    },
    sms1Icon: {
        width: 20,
        height: 20
    },
    ofspacedesigncom: {
        lineHeight: 16,
        fontFamily: "Inter-Medium",
        color: "#242f3e",
        marginLeft: 8,
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14,
        flex: 1
    },
    field: {
        borderStyle: "solid",
        borderColor: "#d6dae1",
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 16,
        marginTop: 8,
        alignSelf: "stretch",
        backgroundColor: "#fff",
        borderRadius: 8
    },
    
    baseInputField1: {
        marginTop: 24,
    },
    text: {
        color: "#0158aa"
    },
    button: {
        width: 173,
        marginTop: 24,
        flexDirection: "row"
    },
    text1: {
        color: "#fff",
        lineHeight: 24,
        fontSize: 16
    },
    baseButton1: {
        backgroundColor: "#0158aa",
        paddingHorizontal: 28,
        marginTop: 240,
        paddingVertical: 12,
    },
    frameParent: {
        top: 112
    },
    email: {
        height: 852,
        overflow: "hidden",
        flex: 1,
        backgroundColor: "#fff"
    },
    errorText: {
        color: '#dd3409',
        fontSize: 12,
        marginTop: 4,
    }
});

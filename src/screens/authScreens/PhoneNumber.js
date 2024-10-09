import * as React from "react";
import { Image, StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessages } from "../../constants/appConstants";
import { get,put } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';

const PhoneNumber = (props) => {
    const { control, handleSubmit, formState: { errors },setError } = useForm();
    const { actions, userInfo } = props;
    const { userDetails } = userInfo;

    const onSubmit = (data) => {
        let countryCode = "91";
        let fullPhoneNumber = countryCode + data.phoneNumber;
        const params = {
            phone_number: fullPhoneNumber
        }
        get(`${urlConstants.validateUser}phoneNumber=${'91'+data.phoneNumber}`)
            .then(res => {
                if (res.isUserValid) {
                    setError("phoneNumber", { type: "manual", message: "PhoneNumber already registered" });
                }
                else {
                    put(urlConstants.sendOTP + userDetails.id, params,userDetails?.token)
                    .then(res => {
                    props.navigation.navigate('OTP', { phoneNumber: data.phoneNumber });
                    }).catch(err => {
                        setError("phoneNumber", { type: "manual", message: err });
                    })
                }
            }).catch(err => {
                setError("phoneNumber", { type: "manual", message: err });
            })
    };

    return (
        <View style={styles.phonenumber}>
            <View style={{ flex: 1, margin: 10, marginLeft: 10 }}>
                <View style={styles.baseInputField}>
                    <Text style={styles.label}>
                        Phone Number
                    </Text>
                    <View style={[styles.field, styles.fieldFlexBox, errors.phoneNumber && { borderColor: '#dd3409' }]}>
                        <Image style={styles.mobileIcon} resizeMode="cover" source={require('../../assets/mobileIcon.png')} />
                        <Controller
                            control={control}
                            rules={{
                                required: ErrorMessages.PHONE_NUMBER_REQUIRED,
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: ErrorMessages.PHONE_NUMBER_INVALID
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="numeric"
                                    placeholder=""
                                    placeholderTextColor={'#697483'}
                                    style={{ color: '#000000',width:'100%' }}
                                />
                            )}
                            name="phoneNumber"
                        />
                    </View>
                    {errors.phoneNumber && <View style={styles.hintFlexBox}>
                        <Image style={styles.mobileIcon} resizeMode="cover" source={require("../../assets/warning.png")} />
                        <Text style={[styles.hintText, styles.labelTypo]}>{errors.phoneNumber.message}</Text>
                    </View>}
                </View>
                <Pressable style={[styles.baseButton, styles.buttonFlexBox]} onPress={handleSubmit(onSubmit)}>
                    <Text style={[styles.text, styles.textFlexBox]}>Proceed</Text>
                </Pressable>
            </View>
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

const styles = StyleSheet.create({
    baseInputFieldPosition: {
        top: 0,
        left: 0
    },
    baseLayout: {
        width: 361,
        position: "absolute"
    },
    labelTypo: {
        textAlign: "left",
        fontWeight: "500",
        fontSize: 14
    },
    fieldFlexBox: {
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    hintFlexBox: {
        marginTop: 8,
        flexDirection: "row",
        alignSelf: "stretch"
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
    buttonFlexBox: {
        paddingVertical: 12,
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    textFlexBox: {
        textAlign: "center",
        color: "#fff"
    },
    todayTypo: {
        fontFamily: "MagistralCondW08-Medium",
        textAlign: "left",
        position: "absolute"
    },
    batteryIconLayout: {
        width: 24,
        position: "absolute"
    },
    phonenumberChild: {
        width: 393,
        height: 88,
        left: 0,
        position: "absolute"
    },
    label: {
        lineHeight: 20,
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        alignSelf: "stretch"
    },
    mobileIcon: {
        width: 20,
        height: 20
    },
    ofspacedesigncom: {
        lineHeight: 16,
        color: "#242f3e",
        marginLeft: 8,
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
    errorText: {
        color: '#f1ae9d',
        fontSize: 12,
        marginTop: 4,
    },
    baseInputField: {
        left: 0,
        top: 0
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "center",
        color: "#fff"
    },
    baseButton: {
        backgroundColor: "#0158aa",
        justifyContent: "center",
        paddingHorizontal: 28,
        width: '100%',
        position: "absolute",
        bottom: 40
    },
    baseInputFieldParent: {
        top: 112,
        height: 622,
        left: 16
    },
    invest: {
        height: "92.95%",
        width: "99.72%",
        fontSize: 28,
        lineHeight: 41,
        color: "#189877",
        left: "0%",
        top: "0%"
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
        bottom: "0%",
        left: "27.68%",
        top: "0%",
        height: "100%",
        position: "absolute"
    },
    groupChild: {
        height: "79.09%",
        width: "31.13%",
        top: "7.47%",
        right: "68.87%",
        bottom: "13.44%",
        maxWidth: "100%",
        maxHeight: "100%",
        left: "0%",
        position: "absolute",
        overflow: "hidden"
    },
    groupParent: {
        height: "5.16%",
        width: "24.68%",
        top: "4.34%",
        right: "61.07%",
        bottom: "90.49%",
        left: "14.25%",
        position: "absolute"
    },
    batteryIcon: {
        marginTop: -4.17,
        right: 15,
        height: 11,
        top: "50%"
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
        top: "50%",
        textAlign: "center",
        color: "#fff",
        fontSize: 14,
        position: "absolute"
    },
    statusbariphoneXLightBackg: {
        height: "5.99%",
        top: "-1.06%",
        right: "0%",
        bottom: "95.07%",
        left: "0%",
        position: "absolute",
        width: "100%"
    },
    icon: {
        height: "100%",
        overflow: "hidden",
        width: "100%"
    },
    keyboardBackspace: {
        top: 48,
        height: 24,
        left: 16
    },
    phonenumber: {
        flex: 1,
        backgroundColor: "#fff"
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PhoneNumber);

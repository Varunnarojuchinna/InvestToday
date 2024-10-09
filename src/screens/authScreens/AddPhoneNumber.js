import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, ScrollView, TouchableWithoutFeedback } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { put, get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { ErrorMessages } from "../../constants/appConstants";

const AddPhonenumber = (props) => {
    const [loading, setIsLoading] = useState(false);
    const { control, handleSubmit, formState: { errors }, setError,setValue } = useForm();
    const { actions, userInfo } = props;
    const { userDetails } = userInfo;

    useEffect(() => {
        if (userDetails?.phone_number) {
            if (userDetails?.phone_number.startsWith('+')) {
                setValue('phoneNumber', userDetails?.phone_number.slice(3));
            } else {
                setValue('phoneNumber', userDetails?.phone_number.slice(2));
            }
        }
    }, [userDetails]);

    const onSubmit = (data) => {
        setIsLoading(true)
        let countryCode = "91";
        let fullPhoneNumber = countryCode + data.phoneNumber;
        const params = {
            phone_number: fullPhoneNumber
        }
        get(`${urlConstants.validateUser}phoneNumber=${fullPhoneNumber}`)
            .then(res => {
                setIsLoading(false)
                if (res.isUserValid) {
                    setError("phoneNumber", { type: "manual", message: "PhoneNumber already registered" });
                }
                else {
                    put(urlConstants.sendOTP + userDetails.id, params)
                        .then(res => {
                            setIsLoading(false)
                            props.navigation.navigate('OTP', { phoneNumber: data.phoneNumber });
                            Keyboard.dismiss();
                        })
                        .catch(err => {
                            setIsLoading(false)
                            setError("phoneNumber", { type: "manual", message: err });
                        })
                }
            }).catch(err => {
                setIsLoading(false)
                setError("phoneNumber", { type: "manual", message: err });
            })
    };

    const handleSkip = () => {
        props.navigation.navigate('LoadingScreen');
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.phonenumber}>
                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#0158aa" />
                                <Text style={{ color: '#000', marginTop: 5, fontFamily: 'NotoSans-SemiBold' }}>Processing</Text>
                            </View>
                        )}
                        <Text style={[styles.addYourPhone, styles.labelTypo, { color: '#000' }]}>Add your Phone number</Text>
                        <View style={styles.baseInputFieldParent}>
                            <View style={[styles.field, styles.fieldFlexBox, errors.phoneNumber && { borderColor: '#dd3409' }]}>
                                <Image style={styles.mobileIcon} resizeMode="cover" source={require('../../assets/mobileIcon.png')} />
                                <Controller
                                    control={control}
                                    rules={{
                                        required: ErrorMessages.PHONE_NUMBER_REQUIRED,
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: ErrorMessages.PHONE_NUMBER_INVALID,
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            keyboardType="numeric"
                                            placeholder=""
                                            placeholderTextColor={'#697483'}
                                            style={{ color: '#000000', width: '100%' }}
                                        />
                                    )}
                                    name="phoneNumber"
                                />
                            </View>
                            {errors.phoneNumber && (
                                <View style={styles.hintFlexBox}>
                                    <Image style={styles.mobileIcon} resizeMode="cover" source={require("../../assets/warning.png")} />
                                    <Text style={[styles.hintText, styles.labelTypo]}>{errors.phoneNumber.message}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.baseButton, styles.buttonFlexBox]} onPress={handleSubmit(onSubmit)}>
                                <Text style={[styles.text, styles.textFlexBox]}>Verify</Text>
                            </Pressable>
                        </View>
                        <View style={{ margin: 16, marginTop: 10 }}>
                            <Pressable style={[styles.baseButton, styles.buttonFlexBox]} onPress={handleSkip}>
                                <Text style={[styles.text, styles.textFlexBox]}>Skip</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddPhonenumber);

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
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
    hintText: {
        fontFamily: "NotoSans-Regular",
        color: "#697483",
        marginLeft: 4,
        lineHeight: 20,
        textAlign: "left",
        fontSize: 14,
        flex: 1
    },
    hintFlexBox: {
        marginTop: 8,
        flexDirection: "row",
        alignSelf: "stretch"
    },
    addYourPhone: {
        flex: 1,
        top: 15,
        lineHeight: 21,
        color: "#000",
        fontFamily: "NotoSans-Medium",
        left: 16,
        position: "absolute"
    },
    label: {
        lineHeight: 20,
        color: "#323e4f",
        alignSelf: "stretch",
        fontFamily: "NotoSans-Medium"
    },
    mobileIcon: {
        width: 25,
        height: 25,
    },
    field: {
        borderRadius: 8,
        borderStyle: "solid",
        borderColor: "#d6dae1",
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 16,
        marginTop: 8,
        width: '100%'
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
        paddingHorizontal: 28
    },
    baseInputFieldParent: {
        marginTop: 50,
        margin: 16,
        flex: 1
    },
    phonenumber: {
        flex: 1,
        backgroundColor: "#fff"
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        padding: 16,
        backgroundColor: '#fff'
    }
});

import React, { useState } from "react";
import { Image, StyleSheet, Text, View, Pressable, Modal, TextInput, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { post } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import * as authAction from '../../redux/actions/authAction';
import { bindActionCreators } from 'redux';
import { connect } from "react-redux";
import { ErrorMessages, InfoMessages, SourceType } from "../../constants/appConstants";
import { OneSignal } from "react-native-onesignal";
const CreateAccount = (props) => {
    const { actions } = props;

    const { control, handleSubmit, formState: { errors }, setError, watch } = useForm({
        defaultValues: {
            isSelected: true,
        },
    });
    const [loading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const closeModal = () => {
        setShowModal(false);
        props.navigation.navigate('Login', { email: '' });
    };

    const onSubmit = data => {
        setIsLoading(true)
        const params = {
            "email_id": data.email,
            "name": data.name,
            "source_type": SourceType.CREATE_USER_SIGN_UP_LOGIN_IN,
            "is_active": true
        }
        post(urlConstants.createUser, params)
            .then((resp) => {
                setIsLoading(false)
                actions.setLoginInfoAction({ isUserLoggedIn: false, userDetails: resp });
                OneSignal.login(resp.id)
                setShowModal(true);
            })
            .catch(error => {
                setIsLoading(false)
                setError("email", { type: "manual", message: error });
            });
    };

    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
                </View>
            )}
            <ScrollView style={{ backgroundColor: '#fff' }}>
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={styles.modalTitle}>Registration Successful</Text>

                            </View>
                            <Image style={styles.successIcon} source={require('../../assets/mailPost.png')} />
                            <Text style={styles.modalText}>
                                {InfoMessages.REGISTRATION_SUCCESSFUL_MESSAGE}
                            </Text>
                            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                                <Image style={styles.emailIcon} source={require('../../assets/messageIcon.png')} />
                                <Text style={styles.modalButtonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={[styles.frameWrapper, { margin: 10, marginLeft: 10 }]}>
                    <View>
                        <Text style={styles.createAnAccount1}>Create an Account</Text>
                        <Text style={styles.pleaseEnterThe}>Please enter the details below</Text>
                    </View>
                    <View style={styles.baseInputField}>
                        <Text style={styles.label}>Name</Text>
                        <View style={[styles.field, styles.fieldFlexBox, errors.name && { borderColor: '#dd3409' }]}>
                            <Image style={styles.userIcon} resizeMode="cover" source={require('.././../assets/profile.png')} />

                            <Controller
                                control={control}
                                rules={{
                                    required: ErrorMessages.NAME_REQUIRED,
                                    validate: value => {
                                        if (/^\d+$/.test(value.replace(/\s+/g, ''))) {
                                            return ErrorMessages.NAME_INVALID;
                                        }
                                        return true;
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        placeholder="e.g. Joe Will"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholderTextColor={'#697483'}
                                        style={{ color: '#000000',width:'100%' }}
                                    />
                                )}
                                name="name"
                                defaultValue=""
                            />
                        </View>
                        {errors.name && <View style={styles.hintFlexBox}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                            <Text style={[styles.hintText, styles.labelTypo]}>{errors.name.message}</Text>
                        </View>}
                    </View>
                    <View style={styles.baseInputField}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.field, styles.fieldFlexBox, errors.email && { borderColor: '#dd3409' }]}>
                            <Image style={styles.userIcon} resizeMode="cover" source={require('../../assets/mail.png')} />
                            <Controller
                                control={control}
                                rules={{
                                    required: ErrorMessages.EMAIL_REQUIRED,
                                    pattern: { value: /\S+@\S+\.\S+/, message: ErrorMessages.EMAIL_INVALID }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        placeholderTextColor={'#697483'}
                                        style={{ color: '#000000',width:'100%' }}
                                        placeholder="eg. Joe@gmail.com"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="email"
                                defaultValue=""
                            />
                        </View>
                        {errors.email && <View style={styles.hintFlexBox}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                            <Text style={[styles.hintText, styles.labelTypo]}>{errors.email.message}</Text>
                        </View>}
                    </View>
                    <View style={styles.hint}>
                        <Image style={styles.infoCircleIcon} resizeMode="cover" source={require('../../assets/i_Symbol.png')} />
                        <Text style={styles.infoText}>{InfoMessages.WILL_SEND_YOU_CONFIRMATION_MAIL}</Text>
                    </View>
                    <View>
                        <View style={[styles.checkbox, styles.checkboxFlexBox]}>
                            <Controller
                                control={control}
                                name="isSelected"
                                rules={{ required: ErrorMessages.ACCEPT_TERMS_AND_CONDITIONS }}
                                render={({ field: { onChange, value } }) => (
                                    <CheckBox
                                        value={value}
                                        onValueChange={onChange}
                                        tintColors={{ false: '#697483', true: '#0158aa' }}
                                    />

                                )}
                            />
                            <Text style={styles.accept}>{`Accept `}</Text>
                            <Text style={styles.termsConditions}>{`Terms & Conditions`}</Text>
                        </View>
                        {errors.isSelected && <View style={styles.hintFlexBox}>
                            <Image style={styles.lock1Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                            <Text style={[styles.hintText, styles.labelTypo]}>{errors.isSelected.message}</Text>
                        </View>}
                    </View>
                    <Pressable style={[styles.baseButton, styles.continuefieldFlexBox]} onPress={handleSubmit(onSubmit)}>
                        <Text style={[styles.text2, styles.textTypo]}>Continue</Text>
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
export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(100, 100, 100, 0.6)',

    },
    modalContent: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
    },
    closeIcon: {
        width: 24,
        height: 24,
    },
    successIcon: {
        width: 120,
        height: 130,
        marginVertical: 20,
        alignSelf: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 10,
        justifyContent: 'center',
        alignSelf: 'center',
        color:'#445164'
    },
    modalText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0158aa',
        padding: 10,
        borderRadius: 8,
    },
    emailIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    createPosition: {
        left: 0,
        top: 0,
        position: "absolute"
    },
    lock1Icon: {
        width: 20,
        height: 20
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
    timePosition: {
        top: "50%",
        position: "absolute"
    },
    labelTypo: {
        textAlign: "left",
        fontSize: 14
    },
    timeFlexBox: {
        textAlign: "center",
        color: "#fff"
    },
    checkboxFlexBox: {
        alignItems: "center",
        flexDirection: "row"
    },
    hintFlexBox: {
        marginTop: 8,
        flexDirection: "row",
        alignSelf: "stretch"
    },
    todayTypo: {
        fontFamily: "MagistralCondW08-Medium",
        textAlign: "left",
        position: "absolute"
    },
    parentPosition: {
        left: 16,
        position: "absolute"
    },
    timeTypo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    textTypo: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "500"
    },
    fieldFlexBox: {
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    continuefieldFlexBox: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
    },
    createAnAccountChild: {
        width: 393,
        height: 88
    },
    batteryIcon: {
        marginTop: -4.17,
        right: 15,
        height: 11,
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
        width: 30,
        height: 17,
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 14,
        top: "50%",
        position: "absolute"
    },
    statusbariphoneXLightBackg: {
        height: "5.99%",
        top: "-0.7%",
        right: "0%",
        bottom: "94.72%",
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
        height: 24,
        width: 24
    },
    invest: {
        height: "92.95%",
        width: "99.72%",
        fontSize: 28,
        lineHeight: 41,
        color: "#189877",
        textAlign: "left",
        top: "0%",
        left: "0%"
    },
    today: {
        height: "31.82%",
        width: "34.19%",
        top: "68.29%",
        left: "65.75%",
        fontSize: 9,
        lineHeight: 13,
        color: "#8f97a2",
        textAlign: "left"
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
        width: 97,
        height: 44,
        marginLeft: 16
    },
    keyboardBackspaceParent: {
        top: 37,
        left: 16,
        position: "absolute"
    },
    createAnAccount1: {
        fontSize: 20,
        lineHeight: 28,
        color: "#0158aa",
        textAlign: "left"
    },
    pleaseEnterThe: {
        color: "#445164",
        marginTop: 4,
        lineHeight: 20,
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14
    },
    label: {
        color: "#323e4f",
        alignSelf: "stretch",
        lineHeight: 20,
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14
    },
    userIcon: {
        width: 20,
        height: 20
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ofspacedesigncom: {
        lineHeight: 21,
        fontFamily: "NotoSans-Regular",
        marginLeft: 8,
        color: "#242f3e",
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
    baseInputField: {
        marginTop: 24,
    },
    baseCheckboxIcon: {
        borderRadius: 4,
        width: 16,
        height: 16
    },
    accept: {
        color: "#242f3e"
    },
    termsConditions: {
        textDecorationLine: "underline",
        color: "#0158aa"
    },
    text1: {
        lineHeight: 20,
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14
    },
    text: {
        marginLeft: 8
    },
    checkbox: {
        marginTop: 20
    },
    text2: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
        color: "#fff"
    },
    baseButton: {
        backgroundColor: "#0158aa",
        justifyContent: "center",
        paddingHorizontal: 28,
        marginTop: 52,
    },
    createAnAccount: {
        width: "100%",
        flex: 1,
        backgroundColor: "#fff"
    },
    infoCircleIcon: {
        width: 20,
        height: 20
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "NotoSans-Regular",
        color: "#0158aa",
        textAlign: "left",
        marginLeft: 4,
        flex: 1
    },
    hint: {
        width: "100%",
        flexDirection: "row",
        marginTop: 10,
        flex: 1
    }
});


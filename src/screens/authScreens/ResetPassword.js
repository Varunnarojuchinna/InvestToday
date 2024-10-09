import React, { useState } from "react";
import { Text, StyleSheet, Image, TextInput,ActivityIndicator, TouchableOpacity,View,Modal, Pressable, ScrollView } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { ErrorMessages } from "../../constants/appConstants";

const ResetPassword = (props) => {
    const { control, handleSubmit, formState: { errors }, setError, reset } = useForm();
    const [message, setMessage] = useState();
    const [loading,setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false);

    const closeModal = () => {
        setShowModal(false);
        props.navigation.navigate('Login',{email:''});
    };
    const onSubmit = (data) => {
        setIsLoading(true)
        reset()
        get(urlConstants.forgotPassword + data.email)
            .then(res => {
                setIsLoading(false)
                if (res.messageType == 'ERROR') {
                    setError("email", { type: "manual", message: res.message });
                } else {
                    setMessage(res.message);
                    setShowModal(true);
                }
            })
            .catch(err => {
                setIsLoading(false)
                setError("email", { type: "manual", message: ErrorMessages.EMAIL_NOT_REGISTERED });
            })
    };

    return (
        <View style={{ backgroundColor: '#fff',flex:1 }}>
            {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0158aa" />
          <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
        </View>
      )}
        <ScrollView>
        <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',width:'100%' }}>
                            <Text style={styles.modalTitle}>Reset Password Successful</Text>
                        </View>
                        <Image style={styles.successIcon} source={require('../../assets/mailPost.png')} />
                        <Text style={styles.modalText}>
                            {message && message}
                        </Text>
                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Image style={styles.emailIcon} source={require('../../assets/messageIcon.png')} />
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={{ flex: 1, margin: 10, marginLeft: 10 }}>
                <Text style={styles.pleaseEnterYour}>Please enter your email address below to receive a password reset link</Text>
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
                        <Image style={styles.Icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                        <Text style={[styles.hintText, styles.labelTypo]}>{errors.email.message}</Text>
                    </View>}
                </View>
                <Pressable style={[styles.baseButton, styles.buttonFlexBox]} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.text}>Send Link</Text>
                </Pressable>
            </View>
        </ScrollView>
        </View>
    );
};

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
        alignSelf:'center'
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
       zIndex: 1,
      },
    labelTypo: {
        fontSize: 14,
        textAlign: "left",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500"
    },
    fieldFlexBox: {
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: 8
    },
    buttonFlexBox: {
        paddingVertical: 12,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: 8
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
    hint: {
        width: "100%",
        flexDirection: "row",
        marginTop: 10,
        flex: 1
    },
    hintFlexBox: {
        marginTop: 8,
        flexDirection: "row",
        alignSelf: "stretch"
    },
    Icon: {
        width: 20,
        height: 20
    },
    pleaseEnterYour: {
        textAlign: "left",
        color: "#242f3e",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 24,
        fontSize: 16
    },
    lock1Icon: {
        width: 20,
        height: 20
    },
    label: {
        lineHeight: 20,
        color: "#323e4f",
        alignSelf: "stretch"
    },
    mobileIcon: {
        width: 20,
        height: 20
    },
    ofspacedesigncom: {
        lineHeight: 16,
        marginLeft: 8,
        color: "#242f3e",
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

    text: {
        color: "#fff",
        textAlign: "center",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 24,
        fontSize: 16
    },
    baseButton: {
        marginTop: 350,
        backgroundColor: "#0158aa",
        justifyContent: "center",
        paddingHorizontal: 28,
        left: 0,
    },
    frameParent: {
        width: "100%",
        height: 619,
        flex: 1,
    }
});

export default ResetPassword;

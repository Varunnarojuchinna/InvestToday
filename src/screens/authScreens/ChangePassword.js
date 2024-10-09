import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, ActivityIndicator, Pressable, ScrollView,Modal,TouchableOpacity } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { put } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


const ChangePassword = (props) => {
    const {userInfo}=props;
    const { control, handleSubmit, formState: { errors },getValues,setError } = useForm();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handlePasswordVisibility = (type) => {
        if (type === "current") setShowCurrentPassword(!showCurrentPassword);
        if (type === "new") setShowNewPassword(!showNewPassword);
        if (type === "confirm") setShowConfirmPassword(!showConfirmPassword);
    };

    const closeModal = () => {
        props.navigation.navigate('Dashboard');
    };

    const onSubmit = (data) => {
        setIsLoading(true);
        const params={
            "current_password": data?.currentPassword,
            "new_password": data.newPassword
          }
        put(urlConstants.changePassword,params,userInfo?.userDetails?.token)
        .then(x => {
            setIsLoading(false) 
            setShowModal(true);
        }) 
        .catch(error =>{ 
            setError('currentPassword', {
                type: 'manual',
                message: 'Invalid current password',
                });            
                setIsLoading(false) 
            console.log(error)
        })
    };

    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
                </View>
            )}
            <ScrollView contentContainerStyle={styles.container}>
            <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={styles.modalTitle}>Password changed successfully</Text>
                            </View>
                            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                                <Image style={styles.emailIcon} source={require('../../assets/messageIcon.png')} />
                                <Text style={styles.modalButtonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <PasswordField
                    label="Current Password"
                    control={control}
                    name="currentPassword"
                    showPassword={showCurrentPassword}
                    handlePasswordVisibility={() => handlePasswordVisibility("current")}
                    error={errors.currentPassword}
                />
                <PasswordField
                    label="New Password"
                    control={control}
                    name="newPassword"
                    showPassword={showNewPassword}
                    handlePasswordVisibility={() => handlePasswordVisibility("new")}
                    error={errors.newPassword}
                    validate={(value) => {
                        if (value.length < 8) {
                            return 'Password should be 8 characters or more';
                        }
                        if (/\s/.test(value)) {
                            return 'Password should not contain spaces';
                        }
                        if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
                            return 'Password should include both letters and numbers';
                        }
                        if (value === getValues('currentPassword')) {
                            return 'New password should not be the same as the current password';
                        }
                        return true;
                    }}
                />
                <PasswordField
                    label="Confirm New Password"
                    control={control}
                    name="confirmPassword"
                    showPassword={showConfirmPassword}
                    handlePasswordVisibility={() => handlePasswordVisibility("confirm")}
                    error={errors.confirmPassword}
                    validate={(value) => value === getValues('newPassword') || 'Passwords do not match'}
                />
                <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.submitButtonText}>Change Password</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};

const PasswordField = ({ label, control, name, showPassword, handlePasswordVisibility, error,validate }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputField, error && styles.errorBorder]}>
            <Image style={styles.icon} resizeMode="cover" source={require('../../assets/lock.png')} />
            <Controller
                control={control}
                rules={{ 
                    required: `${label} is required`,
                    validate:validate}}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.textInput}
                        placeholderTextColor='#697483'
                        placeholder={`Enter ${label}`}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showPassword}
                    />
                )}
                name={name}
                defaultValue=""
            />
            <Pressable onPress={handlePasswordVisibility}>
                <Image style={styles.icon} resizeMode="cover" source={showPassword ? require('../../assets/eyeOpenIcon.png') : require('../../assets/eyeCloseIcon.png')} />
            </Pressable>
        </View>
        {error && (
            <View style={styles.errorContainer}>
                <Image style={styles.icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeIcon: {
        width: 24,
        height: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 10,
        justifyContent: 'center',
        alignSelf: 'center',
        color: "#445164",
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        color: "#323e4f",
        alignSelf: "stretch",
        lineHeight: 20,
        fontWeight: "500",
        textAlign: "left",
        fontSize: 14,
        fontFamily: 'NotoSans-SemiBold',

    },
    inputField: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#d6dae1",
        borderWidth: 1,
        borderRadius: 8,
        height: 48, 
        paddingHorizontal: 16, 
        marginTop: 8,
        backgroundColor: "#fff",
    },
    textInput: {
        flex: 1,
        color: '#000',
        fontSize: 16, 
    },
    icon: {
        width: 20,
        height: 20,
    },
    errorBorder: {
        borderColor: '#dd3409',
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    errorMessage: {
        marginLeft: 4,
        color: "#697483",
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: "#0158aa",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    submitButtonText: {
        fontFamily: 'NotoSans-Regular',
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
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
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);

import React, { useEffect, useState,useRef } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Image, Modal, TouchableOpacity } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { put } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ErrorMessages } from "../../constants/appConstants";

const PersonalDetails = (props) => {
    const { control, handleSubmit, formState: { errors }, setValue, setError,clearErrors} = useForm();
    const [loading, setIsLoading] = useState(false);
    const { userInfo, actions } = props;
    const [showModal, setShowModal] = useState(false);
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {
        if (userInfo) {
            const { first_name, last_name, phone_number } = userInfo?.userDetails;
            setValue('firstName', first_name);
            setValue('lastName', last_name);
            const formattedPhoneNumber = phone_number ? (phone_number.startsWith('+') ? phone_number.slice(3) : phone_number.slice(2)) : '';
            setInitialValues({ firstName: first_name, lastName: last_name, phoneNumber: formattedPhoneNumber });
            if (phone_number) {
                if (phone_number?.startsWith('+')) {
                    setValue('phoneNumber', phone_number.slice(3));
                } else {
                    setValue('phoneNumber', phone_number.slice(2));
                }
            }
        }
    }, [userInfo]);
    const closeModal = () => {
        props.navigation.navigate('Dashboard');
    };
    const updateUserInfo = (updatedUserInfo) => {
        actions.setLoginInfoAction({
            isUserLoggedIn: true,
            userDetails: { ...userInfo.userDetails, ...updatedUserInfo },
        });
    };
    const onSubmit = (data) => {
        const { firstName, lastName, phoneNumber } = data;

        if (firstName === initialValues.firstName && lastName === initialValues.lastName && phoneNumber === initialValues.phoneNumber) {
            setError("form", { type: "manual", message: 'Please update the changes to save' });
            return;
        }
       
        setIsLoading(true);
        const params = {
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber?`91${data.phoneNumber}`:null,
        };
        put(urlConstants.updateUser, params,userInfo?.userDetails?.token)
            .then((res) => {
                updateUserInfo(res);
                setIsLoading(false);
                setShowModal(true);
            }
            )
            .catch((error) => {
                setIsLoading(false);
                setError("phoneNumber", { type: "manual", message: 'PhoneNumber already in use' });
                console.log('err',error);
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
            <ScrollView contentContainerStyle={styles.container}>
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={styles.modalTitle}>Saved changes successfully</Text>
                            </View>
                            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                                <Image style={styles.icon} source={require('../../assets/messageIcon.png')} />
                                <Text style={styles.modalButtonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <TextInputField
                    label="First Name"
                    control={control}
                    name="firstName"
                    rules={{
                        required: 'First Name is required',
                        validate: value => {
                            if (/^\d+$/.test(value.replace(/\s+/g, ''))) {
                                return ErrorMessages.NAME_INVALID;
                            }
                            return true;
                        }
                    }}
                    error={errors.firstName}
                    image={require('../../assets/profile.png')}
                    clearErrors={clearErrors}
                />
                <TextInputField
                    label="Last Name"
                    control={control}
                    name="lastName"
                    image={require('../../assets/profile.png')}
                    error={errors.lastName}
                    rules={{
                        validate: value => {
                            if (/^\d+$/.test(value.replace(/\s+/g, ''))) {
                                return ErrorMessages.NAME_INVALID;
                            }
                            return true;
                        }
                    }}
                    clearErrors={clearErrors}
                />
                <TextInputField
                    label="Phone Number"
                    control={control}
                    name="phoneNumber"
                    keyboardType="phone-pad"
                    rules={{
                        validate: value => value === '' || (/^\d{10}$/.test(value)) || 'Phone Number must be 10 digits'
                    }}
                    error={errors.phoneNumber}
                    image={require('../../assets/mobileNew.png')}
                    clearErrors={clearErrors}
                />
                {errors.form && (
                <View style={styles.errorContainer}>
                <Image style={styles.icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                <Text style={styles.errorMessage}>{errors.form.message}</Text>
                </View>
                )}
                <Pressable style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.submitButtonText}>Save Changes</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};

const TextInputField = ({ label, control, name, keyboardType, rules, error, image,clearErrors }) => {
    const inputRef = useRef(null);
    return (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputField, error && styles.errorBorder]}>
            <Image style={styles.icon} resizeMode="cover" source={image} />
                <Controller
                    control={control}
                    rules={rules}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput]}
                            placeholderTextColor='#697483'
                            placeholder={`Enter ${label}`}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType={keyboardType}
                            onFocus={() => clearErrors('form')}
                        />
                    )}
                    name={name}
                    defaultValue=""
                />

            <TouchableOpacity onPress={() => inputRef.current.focus()}>
                <Image style={styles.editIcon} source={require('../../assets/pen.png')} />
            </TouchableOpacity> 
        </View>
        {error && (
            <View style={styles.errorContainer}>
                <Image style={styles.icon} resizeMode="cover" source={require("../../assets/warning.png")} />
                <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
        )}
    </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(100, 100, 100, 0.6)',
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
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0158aa',
        padding: 10,
        borderRadius: 8,
    },
    modalContent: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
    },
    editIcon: {
        width: 25,
        height: 25,
        marginLeft: 10,
    },
    container: {
        padding: 16,
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
        fontSize: 14,
        color: "#323e4f",
        fontWeight: "500",
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
    disabledText: {
        color: '#697483',
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
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        fontFamily: 'NotoSans-Regular',
    },
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonalDetails);

import React,{useEffect, useState} from "react";
import { Modal, StyleSheet, View, Text, Pressable, Image, TextInput,ActivityIndicator } from "react-native";
import * as authAction from '../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Controller, useForm } from "react-hook-form";
import { post,get } from "../services/axios";
import { urlConstants } from "../constants/urlConstants";
import { BrokerTypes } from "../constants/appConstants";

const BrokerInfoModal = (props) => {
    const { visible, onClose, broker } = props;
    const { userInfo } = props;
    const userDetails = userInfo?.userDetails;
    const [loading, setLoading] = useState(false);
    const [showAPIKey, setShowAPIKey] = useState(false);
    const [showUserId, setShowUserId] = useState(false);
    const [showTotpAPIKey, setShowTotpAPIKey] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors }, setError, reset,clearErrors,setValue } = useForm();
	const onSubmit = (data) => {
        setLoading(true);
        if(broker==='Alice Blue')
        aliceBlueSubmit(data);
        if(broker==='AngelOne');
        angelOneSubmit(data);
    };

    const aliceBlueSubmit = (data) => {
        const params={
            broker_user_id:data.userId,
            broker_api_key:data.apiKey,
            broker_type:BrokerTypes.ALICE_BLUE
        }
        post(urlConstants.connectToBroker,params,userDetails?.token)
        .then((res)=>{
            setLoading(false);
            reset();
            onClose();
        })
        .catch((err)=>{
            console.log('broker connection',err)
            setLoading(false);
            setError('errorInfo', {
                type: 'manual',
                message: err,
                });
        })
    };

    const angelOneSubmit = (data) => {
        const params={
            "broker_type": BrokerTypes.ANGEL_ONE,
            "broker_user_id": data.userId,
            "broker_api_key": data.apiKey,
            "broker_totp_api_key": data.totpApiKey,
            "password": data.password
        }
        post(urlConstants.connectToAngelOne,params,userDetails?.token)
        .then((res)=>{
            setLoading(false);
            reset();
            onClose();
        })
        .catch((err)=>{
            console.log('AngelOne broker connection',err)
            setLoading(false);
            setError('errorInfo', {
                type: 'manual',
                message: err,
                });
        })
    };

    useEffect(() => {
        if(visible){
        getBrokerAccountDetails()
        }
    }, [visible]);
    const getBrokerAccountDetails = async () => {
            get(urlConstants.getBrokerAccountInfo,userDetails?.token).then((response) => {
            if(response && response.length>0 && broker==='Alice Blue'){
                const brokerInfo =  response.find((item)=>item.broker_type===BrokerTypes.ALICE_BLUE);
                setValue('userId',brokerInfo.broker_user_id);
                setValue('apiKey',brokerInfo.broker_api_key);
            }
            if(response && response.length>0 && broker==='AngelOne'){
                const brokerInfo =  response.find((item)=>item.broker_type===BrokerTypes.ANGEL_ONE);
                setValue('userId',brokerInfo.broker_user_id);
                setValue('apiKey',brokerInfo.broker_api_key);
                setValue('totpApiKey',brokerInfo.broker_totp_api_key);
            }
        }).catch((error) => {            
            console.log('error', error);
        });
    };

    const handleAPIKey = () => {
        setShowAPIKey(!showAPIKey)
    };

    const handleUserId = () => {
        setShowUserId(!showUserId)
    };

    const handleTotpAPIKey = () => {
        setShowTotpAPIKey(!showTotpAPIKey)
    };

    const handlePassword = () => {
        setShowPassword(!showPassword)
    };

    const handleDiscard = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
        >            
                <View style={[styles.iphone142]}>
                {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
                </View>
            )}
                    <Pressable style={[styles.closeCircle, styles.iconLayout1]} onPress={handleDiscard}>
                        <Image style={styles.iconLayout} resizeMode="cover" source={require('../assets/closeFillBlue.png')} />
                    </Pressable>
                    <Text style={[styles.menu, styles.menuClr]}>Broker Account Link</Text>
                    <View style={{flexDirection:'row',justifyContent:'center',marginTop:16,alignItems:'center'}}>
                    <Text style={[styles.text1, styles.text1Typo]}>Linking your account to : </Text>
                    {broker==='Alice Blue'?<View style={[styles.companyChildLayout]}>
								<Image style={[styles.avatar]} resizeMode="cover" source={require('../assets/aliceBlue.png')} />
							</View>
                            :
                            <View style={[styles.companyChildLayout]}>
								<Image style={[styles.avatar]} resizeMode="cover" source={require('../assets/angelBroker.png')} />
							</View> }                   
                            </View>
                    <View style={[styles.rectangleGroup, styles.groupChildLayout]}>
                    <View style={[styles.baseInputField, styles.basePosition2]}>
						<Text style={styles.label1}>User Id</Text>
						<View style={[styles.field, styles.hintFlexBox,{justifyContent:'space-between'}, errors.userId ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
							<Controller
								control={control}
								rules={{
									required: 'User Id is required',
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										placeholder={'Enter User Id'}
                                        onFocus={()=>clearErrors('errorInfo')}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										placeholderTextColor={'#697483'}
										style={{ color: '#000000',width:'90%' }}
                                        secureTextEntry={!showUserId}

									/>
								)}
								name="userId"
								defaultValue=""
							/>
                            <Pressable onPress={() => handleUserId()}>
                                {showUserId ?
                                    <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeOpenIcon.png')} />

                                    : <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeCloseIcon.png')} />
                                }
                            </Pressable>
						</View>
					</View>
					<View style={[styles.baseInputField, styles.basePosition2]}>
						<Text style={styles.label1}>API Key</Text>
						<View style={[styles.field, styles.hintFlexBox,{justifyContent:'space-between'}, errors.apiKey ? { borderColor: "red" } : { borderColor: "#d6dae1" }]}>
							<Controller
								control={control}
								rules={{
									required: 'API Key is required',

								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										placeholder={'Enter API Key'}
                                        onFocus={()=>clearErrors('errorInfo')}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										placeholderTextColor={'#697483'}
										style={{ color: '#000000',width:'90%' }}
                                        secureTextEntry={!showAPIKey}
                                        multiline={true}
                                        numberOfLines={4}
									/>
								)}
								name="apiKey"
								defaultValue=""
							/>
                            <Pressable onPress={() => handleAPIKey()}>
                                {showAPIKey ?
                                    <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeOpenIcon.png')} />

                                    : <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeCloseIcon.png')} />
                                }
                            </Pressable>
						</View>
					</View>
                    {broker === 'AngelOne' && <>
                    <View style={[styles.baseInputField, styles.basePosition2]}>
						<Text style={styles.label1}>Totp API Key</Text>
						<View style={[styles.field, styles.hintFlexBox,{justifyContent:'space-between'}, errors.totpApiKey ? { borderColor: "red" } : { borderColor: "#d6dae1" }]}>
							<Controller
								control={control}
								rules={{
									required: 'Totp API Key is required',

								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										placeholder={'Enter Totp API Key'}
                                        onFocus={()=>clearErrors('errorInfo')}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										placeholderTextColor={'#697483'}
										style={{ color: '#000000',width:'90%' }}
                                        secureTextEntry={!showTotpAPIKey}
									/>
								)}
								name="totpApiKey"
								defaultValue=""
							/>
                            <Pressable onPress={() => handleTotpAPIKey()}>
                                {showTotpAPIKey ?
                                    <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeOpenIcon.png')} />

                                    : <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeCloseIcon.png')} />
                                }
                            </Pressable>
						</View>
					</View>
                    <View style={[styles.baseInputField, styles.basePosition2]}>
						<Text style={styles.label1}>Password</Text>
						<View style={[styles.field, styles.hintFlexBox,{justifyContent:'space-between'}, errors.password ? { borderColor: "red" } : { borderColor: "#d6dae1" }]}>
							<Controller
								control={control}
								rules={{
									required: 'Password is required',

								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										placeholder={'Enter Password'}
                                        onFocus={()=>clearErrors('errorInfo')}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										placeholderTextColor={'#697483'}
										style={{ color: '#000000',width:'90%' }}
                                        secureTextEntry={!showPassword}
									/>
								)}
								name="password"
								defaultValue=""
							/>
                            <Pressable onPress={() => handlePassword()}>
                                {showPassword ?
                                    <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeOpenIcon.png')} />

                                    : <Image style={[styles.mobileIcon, { justifyContent: 'flex-end' }]} resizeMode="cover" source={require('../assets/eyeCloseIcon.png')} />
                                }
                            </Pressable>
						</View>
					</View>
                    </>}
                    {errors.errorInfo && (
                    <View style={[styles.hintFlexBox,{marginLeft:16}]}>
                        <Image style={styles.mobileIcon} resizeMode="cover" source={require("../assets/warning.png")} />
                        <Text style={[styles.hintText, styles.labelTypo]}>{errors.errorInfo.message}</Text>
                    </View>
                )}
                    </View>
                    <View style={styles.hint}>
                        <Image style={styles.infoCircleIcon} resizeMode="cover" source={require('../assets/i_Symbol.png')} />
                        <Text style={styles.infoText}> Please make sure that your Broker account is active</Text>
                    </View>
                    <View style={{ marginTop: 8 }}>
						<View style={styles.buttonContainer}>
							<Pressable style={[styles.saveBaseButton, styles.continuefieldFlexBox]} onPress={handleSubmit(onSubmit)}>
								<Text style={[styles.textSave, styles.textTypo]}>Connect</Text>
							</Pressable>
							<Pressable style={[styles.clearBaseButton, styles.continuefieldFlexBox]} onPress={handleDiscard}>
								<Text style={[styles.textClear, styles.textTypo]}>Discard</Text>
							</Pressable>
						</View>
					</View>
                </View>          
          </Modal>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
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
    },
    hint: {
        width: "100%",
        flexDirection: "row",
        margin: 16,
    },
    mobileIcon: {
        width: 20,
        height: 20
    },
    labelTypo: {
        textAlign: "left",
        fontWeight: "500",
        fontSize: 14
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
    companyChildLayout: {
		borderRadius: 8,
		borderColor: "#dadce0",
		borderWidth: 2
	},
    buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
	},
	saveBaseButton: {
		backgroundColor: "#0158aa",
		justifyContent: "center",
		paddingHorizontal: 28,
	},
	clearBaseButton: {
		justifyContent: "center",
		paddingHorizontal: 28,
		borderWidth: 1,
		borderColor: '#0158aa',
	},
    continuefieldFlexBox: {
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden",
	},
    textSave: {
		fontSize: 16,
		lineHeight: 24,
		textAlign: "center",
		color: "#fff"
	},
	textTypo: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	textClear: {
		fontSize: 16,
		lineHeight: 24,
		textAlign: "center",
		color: "#0158aa"
	},
    hintFlexBox: {
		marginTop: 8,
		alignSelf: "stretch",
		flexDirection: "row",
	},
    baseInputField: {
		marginTop: 12
	},
    basePosition2: {
		width: '93%',
		marginLeft: 16,
	},
    label1: {
		alignSelf: "stretch",
		color: "#323e4f",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 20,
		textAlign: "left",
		fontSize: 14
	},
    field: {
		borderWidth: 1,
		height: 'auto',
		paddingHorizontal: 16,
		backgroundColor: "#fff",
		borderStyle: "solid",
		alignItems: "center",
		borderRadius: 8,
		overflow: "hidden"
	},
    groupChildLayout: {
        height: 'auto',
        width: '100%',
        alignSelf: "center",
    },
    groupPosition: {
        backgroundColor: "rgba(36, 39, 96, 0.05)",
        borderRadius: 6,
    },
    parentPosition: {
        marginLeft: 16,
    },
    menuClr: {
        color: "#000",
        textAlign: "center"
    },
    menuClr1: {
        color: "#000",
        textAlign: "left"
    },
    groupLayout: {
        height: 172,
        width: '80%',
    },
    lightSpaceBlock: {
        marginLeft: 4,
        height: 14
    },
    iconLayout1: {
        height: 24,
        width: 24,
    },
    userIconPosition: {
        marginTop: 12,
        marginLeft: 16,
        height: 24,
        width: 24,
    },
    iconLayout: {
        height: "100%",
        width: "100%"
    },
    text1Typo: {
        fontFamily: "NotoSans-Regular",
        fontSize: 16
    },
    groupChild: {
        height: 133,
        width: '80%',
        alignSelf: "center",
    },
    mySubscribtion: {
        textAlign: "left",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        lineHeight: 14,
        color: "#000",
    },
    termsPolicies: {
        textAlign: "left",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        lineHeight: 14,
        color: "#000",
    },
    logout1: {
        textAlign: "left",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        color: "#000"
    },
    mySubscribtionParent: {
        marginTop: 16,
    },
    groupItem: {
        backgroundColor: "rgba(36, 39, 96, 0.05)",
        borderRadius: 6,
        alignSelf: "center",
        justifyContent: "center",
    },
    notifications: {
        textAlign: "left",
        color: "#000",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        lineHeight: 14
    },
    privacy: {
        marginTop: 12,
        marginLeft: 12,
        textAlign: "center",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        color: "#000",
    },
    rectangleGroup: {
        marginTop: 8,
    },
    menu: {
        fontSize: 24,
        lineHeight: 24,
        fontWeight: "500",
        fontFamily: "NotoSans-Regular",
        textAlign: "center",
        color: "#000",
    },
    closeCircle: {
        alignSelf: "flex-end",
        marginTop: 16,
        marginRight: 16,

    },
    avatar: {
        width: 60,
		height: 30,
		borderRadius: 8,
		borderColor: "#dadce0"
    },
    loginText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "500",
        fontFamily: "NotoSans-Medium",
        color: "#fff",
        textAlign: "center"
    },
    baseButton: {
        marginTop:20,
        borderRadius: 8,
        backgroundColor: "#0158aa",
        width: "50%",
        overflow: "hidden",
        alignSelf: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 8
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        lineHeight: 28,
        fontWeight: "600",
        fontFamily: "NotoSans-SemiBold",
        color: "#242f3e",
        textAlign: "center",
    },
    text1: {
        lineHeight: 24,
        color: "#697483",
        textAlign: "center",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
    },
    iphone142: {
        backgroundColor: "#fff",
        width: '100%',
        overflow: "hidden",
        height: '100%'
    },
    settings: {
        flex: 1,
        height: 844,
        width: "100%"
    }
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(BrokerInfoModal);

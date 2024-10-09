
import React ,{useEffect,useState} from "react";
import { Modal, StyleSheet, View, Text, Pressable, Image,Alert,TouchableOpacity} from "react-native";
import ImagePicker from 'react-native-image-crop-picker';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigation } from "@react-navigation/native";
import { del,put } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { SourceType } from "../../constants/appConstants";
import { OneSignal } from "react-native-onesignal";

const Profile = ({ userInfo, actions }) => {
    const navigation = useNavigation();
    const [showImageOptions, setShowImageOptions] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const login = () => {
        navigation.navigate('SignUp');
    }
    const onClose = () => {
        navigation.goBack()||navigation.navigate('Dashboard');
    }
    useEffect(() => {
        if (userInfo?.userDetails?.metadata?.profile_url) {
            setSelectedImage(userInfo.userDetails.metadata.profile_url);
        } else {
            setSelectedImage(null);
        }
    }, [userInfo?.userDetails?.metadata?.profile_url]);

    const userDetails = userInfo?.userDetails;

    const handleNotifications = () => {
        navigation.navigate('Notifications');
    };

    const handleEditProfile = () => {
        navigation.navigate('PersonalDetails');
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const handlePricing = () => {
        navigation.navigate('PricingPlans');
    };

    const handleMySubscription = () => {
        navigation.navigate('MySubscription');
    };

    const handleMyTransaction=()=>{
        navigation.navigate('MyTransaction');
    };

    const updateUserInfo = (updatedUserInfo) => {
        actions.setLoginInfoAction({
            isUserLoggedIn: true,
            userDetails: { ...userInfo.userDetails, ...updatedUserInfo },
        });
    };

    const handleImageSelection = async (type) => {
        const options = {
            width: 300,
            height: 300,
            cropping: true,
            mediaType: 'photo',
            compressImageQuality: 0.8,
            includeBase64: true,
        };

        try {
            let image;
            if (type === 'camera') {
                ImagePicker.openCamera(options)
                    .then((image) => {
                        setShowImageOptions(false);

                        const params = {
                            "metadata": {
                                "filename": `image_${image.modificationDate}.jpg`,
                                "profile_picture": image.data,
                            }
                          }
                        put(urlConstants.updateProfilePicture,params,userDetails?.token)
                          .then(res=>{                
                            updateUserInfo(res);
                            setSelectedImage(res.metadata.profile_url);
                            handleImageUploadSuccess();
                        })
        
                            .catch(err=>console.log(err))
                    })
                    .catch((error) => console.log('Camera Error: ', error));
            } else if (type === 'gallery') {
                image = await ImagePicker.openPicker(options);
            }

            if (image) {
                const params = {
                    "metadata": {
                        "filename": `image_${image.modificationDate}.jpg`,
                        "profile_picture": image.data,
                    }
                  }
                  put(urlConstants.updateProfilePicture,params,userDetails?.token)
                  .then(res=>{                
                    updateUserInfo(res);
                    setSelectedImage(res.metadata.profile_url);
                    handleImageUploadSuccess();
                    })

                    .catch(err => console.log(err))

                setShowImageOptions(false);
            }
        } catch (error) {
            console.log('Image selection error:', error);
        }
    };
    
    const handleDeleteProfilePicture = async () => {
        Alert.alert(
          'Delete Profile Picture',
          'Are you sure you want to delete your profile picture?',
          [
            { text: 'Cancel' },
            {
              text: 'OK',
              onPress: async () => {
                try {
                  const profile_url = userInfo?.userDetails?.metadata?.profile_url;      
                  if (profile_url) {
                    const response = await del(urlConstants.removeProfilePicture, { "metadata": { "profile_url": profile_url } },userDetails?.token);
      
                    if (response?.metadata?.profile_url === null) {
                      updateUserInfo(response);
                      setSelectedImage(null);
                      setShowImageOptions(false);
                      handleImageDeleteSuccess(); 
                    }
                  }
                } catch (err) {
                  console.error('Error removing profile picture:', err);
                }
              }
            }
          ]
        );
    };    

    const closeModal = () => {
        setShowModal(false);
    };

    const showSuccessMessage = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const handleImageUploadSuccess = () => {
        showSuccessMessage('Profile picture successfully uploaded!');
    };

    const handleImageDeleteSuccess = () => {
        showSuccessMessage('Profile picture successfully deleted!');
    };
    return (
        <View style={styles.settings}>
            {userInfo?.isUserLoggedIn ? (
                <View style={styles.settings}>
                    <View style={[styles.iphone142]}>
                        <Pressable style={[styles.closeCircle, styles.iconLayout1]} onPress={onClose}>
                            <Image style={styles.iconLayout} resizeMode="cover" source={require('../../assets/closeFillBlue.png')} />
                        </Pressable>
                        <View style={styles.avatar}>
                            <Image
                                style={[styles.baseAvatarIcon, styles.iconLayout]}
                                resizeMode="cover"
                                source={selectedImage ? { uri: selectedImage } : require('../../assets/app_Icon.png')}
                            />
                            <Pressable
                                style={styles.editIcon}
                                onPress={() => setShowImageOptions(true)}
                            >
                                <Image
                                    style={styles.editIconImage}
                                    resizeMode="cover"
                                    source={require('../../assets/cameraEdit.png')}
                                />
                            </Pressable>
                        </View>
                        <Text style={styles.text}>{userDetails?.first_name} {userDetails?.last_name}</Text>
                        <Text style={[styles.text1, styles.text1Typo]}>{userDetails?.email_id}</Text>
                        <View style={[styles.rectangleGroup, styles.groupChildLayout]}>
                            <View style={[styles.groupItem, styles.groupLayout]} >
                                <View style={[styles.editProfileParent, styles.parentPosition]}>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleEditProfile}>
                                        <Image style={[styles.userIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/editIconNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>Personal Details</Text>
                                    </Pressable>
                                    {userInfo?.userDetails.source_type != SourceType.CREATE_USER_GOOGLE_SIGN_IN &&
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleChangePassword}>
                                            <Image style={[styles.securityUserIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/changePassword.png')} />
                                            <Text style={[styles.privacy, styles.menuClr1]}>Change Password</Text>
                                        </Pressable>
                                    }
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleNotifications}>
                                        <Image style={[styles.notificationBellIcon, styles.notificationBellIcon]} resizeMode="cover" source={require('../../assets/bellCategoryIcon.png')} />
                                        <Text style={[styles.privacy, styles.logoutPosition]}>Notifications</Text>
                                    </Pressable>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image style={[styles.lock1Icon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/privacyNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>Privacy</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '80%', alignSelf: 'center' }}>
                            <Text style={[styles.supportAbout, styles.menuClr1]}>{`Support & About`}</Text>
                        </View>
                        <View style={[styles.rectangleGroup, styles.groupChildLayout]}>
                            <View style={[styles.groupChild, styles.groupPosition]}>
                                <View style={[styles.mySubscribtionParent, styles.parentPosition]}>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleMySubscription}>
                                        <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/subscriptionNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>My Subscription</Text>
                                    </Pressable>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleMyTransaction}>
                                        <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/subscriptionNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>My Transaction</Text>
                                    </Pressable>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handlePricing}>
                                        <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/subscriptionNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>Pricing & Plans</Text>
                                    </Pressable>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/termsNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>{`Terms & Policies`}</Text>
                                    </View>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                                        actions.logoutUserAction({ isUserLoggedIn: false, userDetails: {} });
                                        OneSignal.logout();
                                        onClose();
                                    }}>
                                        <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/logoutBlueNew.png')} />
                                        <Text style={[styles.privacy, styles.menuClr1]}>Logout</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.settings}>
                    <View style={[styles.iphone142]}>
                        <Pressable style={[styles.closeCircle, styles.iconLayout1]} onPress={onClose}>
                            <Image style={styles.iconLayout} resizeMode="cover" source={require('../../assets/closeFillBlue.png')} />
                        </Pressable>
                        <View style={styles.avatar}>
                            <Image style={[styles.baseAvatarIcon, styles.iconLayout]} resizeMode="cover" source={require('../../assets/app_Icon.png')} />
                        </View>
                        <Pressable style={styles.baseButton} onPress={() => login()}>
                            <Text style={styles.loginText}>Login / SignUp</Text>
                        </Pressable>
                        <View style={[styles.rectangleGroup, styles.groupChildLayout,{marginTop:16}]}>
                        <View style={[styles.groupChild, styles.groupPosition]}>
                            <View style={[styles.mySubscribtionParent, styles.parentPosition]}>
                                <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={()=>login()}>
                                    <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/subscriptionNew.png')} />
                                    <Text style={[styles.privacy, styles.menuClr1]}>My Subscription</Text>
                                </Pressable>
                                <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handlePricing}>
                                    <Image style={[styles.notificationBellIcon, styles.userIconPosition]} resizeMode="cover" source={require('../../assets/subscriptionNew.png')} />
                                    <Text style={[styles.privacy, styles.menuClr1]}>Pricing & Plans</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    </View>
                    
                </View>
            )}
            <Modal
                transparent={true}
                visible={showImageOptions}
                animationType="slide"
                onRequestClose={() => setShowImageOptions(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Pressable style={styles.optionButton} onPress={() => handleImageSelection('camera')}>
                            <View style={styles.optionContent}>
                                <Image source={require('../../assets/takePic.png')} style={styles.icon} />
                                <Text style={styles.optionText}>Take Picture</Text>
                            </View>
                        </Pressable>
                        <Pressable style={styles.optionButton} onPress={() => handleImageSelection('gallery')}>
                            <View style={styles.optionContent}>
                                <Image source={require('../../assets/galleryNew.png')} style={styles.icon} />
                                <Text style={styles.optionText}>Select from Gallery</Text>
                            </View>
                        </Pressable>
                        <Pressable style={styles.optionButton} onPress={handleDeleteProfilePicture}>
                            <Image source={require('../../assets/removePic.png')} style={styles.icon} />
                            <Text style={styles.optionText}>Remove Picture</Text>
                        </Pressable>
                        <Pressable style={styles.cancelButton} onPress={() => setShowImageOptions(false)}>
                            <View style={styles.optionContent} >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
            <View style={styles.modalBackground}>
            <View style={styles.messageModalView}>
            <Text style={styles.modalTitle}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <Image style={styles.emailIcon} source={require('../../assets/messageIcon.png')} />
                <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
            </View>
            </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({

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
        textAlign: "left",
    },
    groupLayout: {
        paddingTop: 8,
        paddingBottom: 8,
        height: 'auto',
        width: '80%',
    },
    lightSpaceBlock: {
        marginLeft: 4,
        height: 14
    },
    iconLayout1: {
        height: 24,
        width: 24,
        borderRadius: 50,
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
        height: 'auto',
        width: '80%',
        alignSelf: "center",
        paddingBottom: 8,
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
        marginTop: 12,
    },
    rectangleParent: {
        top: 548,
        marginLeft: -168
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
        flexDirection: "row",
    },
    rectangleGroup: {
        marginTop: 8,
    },
    menu: {
        fontSize: 24,
        lineHeight: 21,
        fontWeight: "700",
        fontFamily: "NotoSans-Bold",
        textAlign: "center",
        color: "#000",
    },
    notch: {
        right: 0,
        height: 30,
        top: 0
    },
    networkSignalLight: {
        width: 20,
        height: 14
    },
    wifiSignalLight: {
        width: 16
    },
    batteryLight: {
        width: 25
    },
    statusIcons: {
        top: 16,
        right: 14,
        flexDirection: "row",
        alignItems: "center",
        position: "absolute"
    },
    indicator: {
        top: 8,
        right: 71,
        width: 6,
        height: 6,
        position: "absolute"
    },
    timeLight: {
        top: 13,
        left: 12,
        borderRadius: 20,
        width: 54,
        height: 21,
        overflow: "hidden",
        position: "absolute"
    },
    statusBar: {
        left: 4,
        width: 385,
        height: 44,
        overflow: "hidden",
        top: 0,
        position: "absolute"
    },
    supportAbout: {
        marginTop: 16,
        textAlign: "left",
        fontFamily: "NotoSans-Regular",
        fontSize: 16,
        color: "#000",
    },
    logout1Icon: {
        top: 642,
        left: 48
    },
    closeCircle: {
        alignSelf: "flex-end",
        marginTop: 16,
        marginRight: 16,

    },
    cardIcon: {
        top: 563
    },
    condicioner2Icon: {
        top: 602,
        left: 47,
        overflow: "hidden"
    },
    baseAvatarIcon: {
        maxWidth: "100%",
        maxHeight: "100%",
        overflow: "hidden",
    },
    avatar: {
        marginTop: 16,
        alignSelf: 'center',
        width: 120,
        height: 120,
    },
    baseAvatarIcon: {
        width: 100,
        height: 100,
        borderRadius: 80,
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
        marginTop: 20,
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
        height: '100%',
        width: '100%'
    },
    imageOptionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    optionButton: {
        width: '100%',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 92,
    },
    optionText: {
        fontSize: 16,
        color: '#000000',
        textAlign:'left',
        flex:1

    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    cancelText: {
        fontSize: 16,
        color: '#dd3409',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editIconImage: {
        width: 20,
        height: 20,
        tintColor: '#fff',
    },

    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    notificationBellIcon: {
        width: 22,
        height: 22,
        marginTop: 12,
        marginLeft: 16,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        width: 200,
        marginVertical: 5,
    },
    buttonClose: {
        backgroundColor: "#0158aa",
    },
    textStyle: {
        color: "#ffffff",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontFamily: 'NotoSans-Regular',
    },
    messageModalView: {
        margin: 20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        bottom:0,
    },
    modalContent: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000000',
        fontFamily: 'NotoSans-Regular',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0158aa',
        padding: 10,
        borderRadius: 5,
        fontFamily: 'NotoSans-Regular',
    },
    modalButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'NotoSans-Regular',
    },
    emailIcon: {
        width: 20,
        height: 20,
    },
    
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

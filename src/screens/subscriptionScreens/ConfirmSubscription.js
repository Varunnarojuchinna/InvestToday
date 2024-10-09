import React ,{useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet,ActivityIndicator,Modal,Image, Alert } from 'react-native';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { post } from '../../services/axios';
import { urlConstants } from '../../constants/urlConstants';
import Config from 'react-native-config';
import RazorpayCheckout from 'react-native-razorpay';
import { CommonActions, useNavigation } from '@react-navigation/native';

const ConfirmSubscription = (props) => {

    const {userInfo,actions}=props;
    const navigation = useNavigation();
    const {plan,price,discountId}  = props.route.params;
    const [loading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const currency = 'INR'

    const mapPaymentMethod = (method) => {
        switch (method) {
            case 'netbanking':
                return 2;  // Netbanking
            case 'card':
                return 1;  // Card
            case 'upi':
                return 3;  // UPI
            default:
                return 4;  // Other
        }
    }; //TODO

    const updateUserInfo = (updatedUserInfo) => {
        actions.setLoginInfoAction({
            isUserLoggedIn: true,
            userDetails: { ...userInfo.userDetails, isUserSubscribed: true },
        });
    };

    const handleConfirm = (paymentId, paymentType) => {
        setIsLoading(true);
        const params = {
            "subscription_id": plan.id,
            "discount_subscription_id": discountId
        };
    
        post(urlConstants.confirmSubscription,params,userInfo?.userDetails?.token)
            .then((response) => {
                updateUserInfo(response);
                recordPayment(paymentId, paymentType, price);
                setIsLoading(false);
                setShowModal(true);
                setMessage(paymentId);
            })
            .catch((error) => {
                console.error("Subscription Confirm Error:", error);
                setIsLoading(false);
            });
    };

    const recordPayment = (referenceId, type, amount) => {
        const paymentParams = {
            "reference_id": referenceId,
            "type": type,  
            "amount": amount
        };

        post(urlConstants.recordPayment, paymentParams, userInfo?.userDetails?.token)
            .then((response) => {
                if (response && response.data) {
                    console.log("Payment Record Response:", response.data);
                } else {
                    console.log("Payment Record Response is empty");
                }
            })
            .catch((error) => {
                console.log("Payment Record Error:", error);
                Alert.alert("Payment Record Failed", error.message);
            });
    };
    const handlePay = () => {
        var options = {
            description: 'InvesToday Subscription',
            image: require('../../assets/logo.png'),
            currency: currency,
            key: Config.RAZORPAY_KEY_ID,
            amount: parseInt(price)*100,
            name: 'INVESTODAY',
            order_id: '', // Replace this with a valid Razorpay order ID if applicable
            prefill: {
                email: 'aishus5656@gmail.com',
                contact: '8310647193',
                name: 'Aishwarya'
            },
            theme: { color: '#53a20e' }
        };

        RazorpayCheckout.open(options).then((data) => {
            const paymentType = mapPaymentMethod(data.method);
            const isActive = true;
            handleConfirm(data.razorpay_payment_id, paymentType);
        }).catch((error) => {
            console.error("Razorpay Error:", error);
            Alert.alert(`Error: ${error.code} | ${error.description}`);
            const paymentType = mapPaymentMethod(error.description) || 4; // Use default value
            const isActive = false;
            recordPayment(error.code, paymentType, price);
        });
    };

    const closeModal = () => {
        setShowModal(false);
        navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: 'Profile' }],
			})
		);
    }

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
                </View>
            )}
            <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Text style={styles.modalTitle}>Payment Successful ({message})</Text>
                            </View>
                            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                                <Image style={styles.emailIcon} source={require('../../assets/messageIcon.png')} />
                                <Text style={styles.modalButtonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            <Text style={styles.header}>InvesToday Subscription | Payment Gateway</Text>
            <View style={styles.contentContainer}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.planTitle}>
                        Subscription fee
                    </Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Subscription Amount</Text>
                        <Text style={styles.amountValue}>₹ {price.toFixed(2)}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.confirmButton} onPress={()=>handlePay()}>
                    <Text style={styles.confirmButtonText}>Confirm and Pay ₹ {price.toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
        container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 18,
        color: '#404040',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'NotoSans-SemiBold',
    },
    contentContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#404040',
        marginBottom: 15,
    },
    detailsContainer: {
        marginBottom: 20,
    },
    planTitle: {
        fontSize: 14,
        color: '#404040',
        marginBottom: 10,
        fontFamily: 'NotoSans-Regular',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dateTime: {
        fontSize: 14,
        color: '#404040',
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    amountLabel: {
        fontSize: 14,
        color: '#404040',
        fontFamily: 'NotoSans-Regular',
    },
    amountValue: {
        fontSize: 14,
        color: '#404040',
        fontFamily: 'NotoSans-Regular',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#404040',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#404040',
    },
    confirmButton: {
        backgroundColor: '#0158aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
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

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmSubscription);
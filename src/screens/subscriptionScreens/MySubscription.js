import React, { useEffect, useState,useCallback } from "react";
import { Text, View,StyleSheet, Pressable, Image, BackHandler,ScrollView } from "react-native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toInitCaps } from "../../services/helpers";
import moment from "moment";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
const MySubscription = (props) => {
    const navigation = useNavigation();
    const {userInfo}=props;
    const [subscriptionPlans, setSubscriptionPlans] = useState();
    const [discountTerms,setDiscountTerms] = useState();
    const [activePlan, setActivePlan] = useState();
    const [plans, setPlans] = useState();
    const [active,setActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getSubscriptionHistory();
        getCurrentSubscription();
        getDiscountTerms();
        getPlans();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('Profile'); 
                return true; 
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove(); // Cleanup back handler on unmount
        }, [navigation])
    );

    const getPlans = () => {
        get(urlConstants.getSubscriptions)
        .then((response) => {
            setPlans(response);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    const getDiscountTerms = () => {
        get(urlConstants.getDiscountDetails)
        .then((response) => {
            setDiscountTerms(response);
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    const getPlanNameById = (id) => {
        const plan = plans?.find(plan => plan.id === id);
        return plan ? toInitCaps(plan.name) : "Plan not found";
      };

    const getDiscountTermById = (id) => {
        const discount = discountTerms?.find(discount => discount.id === id);
        return discount ? discount.term : "Discount not found";
    };

    const getSubscriptionHistory = () => {
        get(urlConstants.getSubscriptionHistory,userInfo?.userDetails?.token)
            .then((response) => {
                setLoading(false);
                if(response.length === 0){
                    setMessage('No Subscriptions Found');  
                    return;
                } 
                setSubscriptionPlans(response);             
            })
            .catch((error) => {
                setLoading(false);
                setMessage('No Subscriptions Found');
                console.log(error);
            });
    };
    const getCurrentSubscription = () => {
        get(urlConstants.getCurrentSubscription,userInfo?.userDetails?.token)
            .then(async (response) => {
                setLoading(false);
                console.log(response);
                setMessage('No Subscriptions Found');
                setActivePlan(response);
            })
            .catch((error) => {
                setLoading(false);
                setMessage('No Subscriptions Found');
                console.log(error);
            });
    };
    return (
        <View style={styles.automaticInvesting}>
            <ScrollView style={[styles.automaticInvestingChild, styles.vectorParentPosition]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',marginRight:16 }}>
                <Text style={styles.yourTricks}>My Subscriptions</Text>
                <View style={styles.switch}>
                    <Pressable style={active ?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setActive(true)}>
                        <Text style={[active ?styles.live4:styles.test1, styles.live4Typo]}>Active</Text>
                    </Pressable>
                    <Pressable style={!active?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setActive(false)}>
                        <Text style={[!active?styles.live4:styles.test1, styles.live4Typo]}>Outdated</Text>
                    </Pressable>
                </View>
            </View>
            {(subscriptionPlans?.length > 0 && !active) ? <View style={styles.frameParent}>
            {(subscriptionPlans && !loading) ? 
            subscriptionPlans.filter(item => item?.is_active === active).map((item,index) => (
                                <View key={index} style={styles.stockLayout} onPress={() => {}}>
                                    <Text style={styles.stockName}>{getPlanNameById(item.subscription_id)} ({getDiscountTermById(item.discount_subscription_id)})</Text>
                                    <View style={styles.stockNameGroup}>
                                    <Text style={styles.trickId11211}>{'StartDate: '}{moment(item.start_date).format("DD MMM YYYY")}</Text>
                                    </View>
                                    <View style={styles.stockNameGroup}>
                                    <Text style={styles.trickId11211}>{'EndDate: '}{moment(item?.end_date).format("DD MMM YYYY")}</Text>
                                    </View>
                                </View>
                            ))                        
                        : 
                        <View style={{ flexDirection: 'row', alignItems: 'center',marginLeft:-16 }}>
                            <Text style={styles.trickId11211}>Loading....</Text>
                            </View>
                            }
            </View>
            :(!active &&<View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.trickId11211}>{message}</Text>
            </View>)}
            {(activePlan && active) ? <View style={styles.frameParent}>
            {(activePlan && !loading) ? 
                                <View style={styles.stockLayout}>
                                    <Text style={styles.stockName}>{activePlan?.subscription_name} ({activePlan?.discount_term})</Text>
                                    <View style={styles.stockNameGroup}>
                                    <Text style={styles.trickId11211}>{'StartDate: '}{moment(activePlan?.start_date).format("DD MMM YYYY")}</Text>
                                    </View>
                                    <View style={styles.stockNameGroup}>
                                    <Text style={styles.trickId11211}>{'EndDate: '}{moment(activePlan?.end_date).format("DD MMM YYYY")}</Text>
                                    </View>
                                    <View style={styles.featuresContainer}>
                            <Text style={styles.features}>Features:</Text>
                            {activePlan?.subscription_details.split('#').map((feature, index) => (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <Image source={require('../../assets/tickMark.jpg')} style={styles.image} />
                                    <Text style={styles.featuresText}>{feature.trim()}</Text>
                                </View>
                            ))}
                        </View>
                                </View>
                        : 
                        <View style={{ flexDirection: 'row', alignItems: 'center',marginLeft:-16 }}>
                            <Text style={styles.trickId11211}>Loading....</Text>
                            </View>
                            }
            </View>
            :(active && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.trickId11211}>{message}</Text>
            </View>)}
            </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(MySubscription);

const styles = StyleSheet.create({
    image: {
        width: 28,
        height: 28,
        marginRight: 10,
        resizeMode: 'contain',  
    },
    featuresContainer: {
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    featuresText: {
        fontFamily: 'NotoSans-Regular',
        fontSize: 16,
        color: '#1b2533',
        marginBottom: 5,
        width: '90%',
    },
    features: {
        fontFamily: 'NotoSans-SemiBold',
        fontSize: 12,
        color: '#1b2533',
        marginBottom: 5,
        marginTop: 10,
    },
    vectorParentPosition: {
        width: '100%',
    },
    amountLayout: {
        color: "#697483",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
    },
    livePosition: {
        alignSelf: 'flex-end',
        marginTop: 8,
        lineHeight: 17,
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        marginRight: 16,
    },
    textTypo: {
        marginTop: 16,
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        lineHeight: 20,
        fontSize: 14,
        flexWrap: 'wrap',  
    },
    text1Position: {
        textAlign: "left",
    },
    stockLayout: {
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",

        borderRadius: 8,
        padding: 8,
        marginTop: 8,
        flexDirection: 'column',
        flexShrink: 1,  
        width: '95%',
        
    },
    switchFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    live4Typo: {
        fontFamily: "Poppins-Medium",
        fontSize: 10,
        textAlign: "left",
        fontWeight: "500"
    },
    timeTypo: {
        color: "#fff",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        position: "absolute"
    },
    iconLayout: {
        height: 24,
        width: 24,
        position: "absolute",
        top: 49,
        resizeMode: 'contain',  
    },
    label: {
        fontFamily: "NotoSans-Medium",
        color: "#323e4f",
        width: 361,
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14,
        left: 0,
        textAlign: "left",
        top: 0,
        position: "absolute",
        flexWrap: 'wrap',  
    },
    automaticInvestingChild: {
        backgroundColor: "#fff",
        height: '100%',
        flex: 1, 
    },
    stockName: {
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 16,
        marginTop:8,
        textAlign: "left",
        fontSize: 14,
        flex: 1,  
        flexWrap: 'wrap', 
    },    
    amountNeedFor: {
        textAlign: "left",
    },
    trickId11211: {
        color: "#697483",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        marginLeft: 16,
        textAlign: "left",
        flexWrap: 'wrap',  
    },
    frameChild: {
        marginTop: 8,
        marginRight:4,
        width: 8,
        height: 8,
    },
    live: {
        color: "#189877"
    },
    text: {
        marginLeft: 16,
        textAlign: "left",
    },
    amountNeedFor1: {
        color: "#697483",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        marginLeft: 16,
    },
    text1: {
        marginTop: 16,
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        lineHeight: 20,
        fontSize: 14,
        flexWrap: 'wrap', 
    },
    test: {
        color: "#dd3409"
    },
    stockNameGroup: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 16
    },
    frameParent: {
        marginTop: 8,
        marginLeft: 16,
    },
    yourTricks: {
        marginTop: 16,
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 16,
        textAlign: "left",
        fontSize: 14,
    },
    live4: {
        color: "#eee"
    },
    switchTab: {
        backgroundColor: "#0158aa",
        width: 52,
        height: 31,
        justifyContent: "center",
        borderRadius: 8
    },
    test1: {
        color: "#2e2e2e"
    },
    switchTab1: {
        borderRadius: 47,
        width: 56,
        height: 30,
        backgroundColor: "#eee",
        justifyContent: "center"
    },
    switch: {
        marginTop: 16,
        height: 32,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#eee",
        borderRadius: 8,
        overflow: "hidden"
    },
    automaticInvesting: {
        backgroundColor: "#dadce0",
        flex: 1,  
        overflow: "hidden",
        width: "100%", 
    }
});
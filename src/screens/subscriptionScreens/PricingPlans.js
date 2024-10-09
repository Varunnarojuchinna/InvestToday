import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { get } from '../../services/axios';
import { urlConstants } from '../../constants/urlConstants';
import { toInitCaps } from '../../services/helpers';
import { useNavigation } from '@react-navigation/native';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const PricingPlans = (props) => {
    const navigation = useNavigation();
    const { userInfo } = props;
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [activePlan, setActivePlan] = useState(null);
    const [discountDetails, setDiscountDetails] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            get(urlConstants.getSubscriptions)
                .then((response) => {
                    const sortedPlans = response.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
                    setPlans(sortedPlans);
                    setSelectedPlan(sortedPlans[0]?.id); // Set the first plan by price as the selected plan
                })
                .catch((error) => {
                    console.log(error);
                });
        };

        fetchPlans();
        getCurrentSubscription();
        getDiscountDetails();
    }, []);

    const getDiscountDetails = () => {
        get(urlConstants.getDiscountDetails)
            .then((response) => {
                // Sort discounts by percentage in ascending order
                const sortedDiscounts = response.sort((a, b) => parseFloat(a.discount_percentage) - parseFloat(b.discount_percentage));
                setDiscountDetails(sortedDiscounts);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const scrollViewRef = useRef(null);

    const handleSelectPlan = (planId, index) => {
        scrollViewRef.current?.scrollTo({
            x: index * 150,
            animated: true,
        });
        setSelectedPlan(planId);
    };

    const handleSubscription = (plan, price, discountId) => {
        if(userInfo?.userDetails?.id){
        navigation.navigate('ConfirmSubscription', { plan, price, discountId });}
        else{
            navigation.navigate('SignUp');
        }
    };

    const renderPlanPriceOption = (plan, label, multiplier, discount, isDisabled, discountId) => {
        const discountedPrice = plan.base_price * multiplier * (100 - discount) / 100;
        return (
            discount !== null && (
                <View key={label} style={styles.planContainer}>
                    <Text style={discount > 0 ? styles.discountBadge : styles.discountBadge1}>
                        {discount > 0 ? `Save ${discount}%` : ''}
                    </Text>
                    <View style={styles.planContainerContent}>
                        <View style={styles.planInfo}>
                            <Text style={styles.planTitle}>{label}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.planPrice}>
                                    ₹{discountedPrice.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.planInfo}>
                            <TouchableOpacity
                                style={[
                                    styles.continueButton,
                                    isDisabled && styles.disabledButton,
                                ]}
                                onPress={!isDisabled ? () => handleSubscription(plan, discountedPrice, discountId) : null}
                                disabled={isDisabled}
                            >
                                <Text style={styles.continueButtonText}>
                                    {activePlan ? isDisabled ? 'Subscribed' : 'Upgrade':"Subscribe"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        );
    };

    const getCurrentSubscription = () => {
        get(urlConstants.getCurrentSubscription,userInfo?.userDetails?.token)
        .then((response) => {
                setActivePlan(response);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const renderPlanPrices = (plan) => {
        const isDisabled = (planId, label) => {
            const planLevels = {
                'Monthly': 1,
                'Quarterly': 2,
                'Half-Yearly': 3,
                'Yearly': 4
            };
        
            const targetLevel = planLevels[label];
        
            const isSamePlanType = activePlan?.subscription_id === planId;
        
            const currentPlanLevel = isSamePlanType ? planLevels[activePlan?.discount_term] || 0 : 0;
        
            // Disable lower levels only for the same plan type
            return isSamePlanType && targetLevel <= currentPlanLevel;
        };    
        return (
            <View style={styles.priceDetails}>
                {discountDetails.map((discountDetail) => {
                    const label = discountDetail.term;
                    const multiplier = discountDetail.validity / 30; // Assume 1 month = 30 days
                    return renderPlanPriceOption(
                        plan,
                        label,
                        multiplier,
                        discountDetail.discount_percentage,
                        isDisabled(plan.id, label),
                        discountDetail.id
                    );
                })}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Choose Your Plan</Text>
            <View>
                <ScrollView horizontal ref={scrollViewRef} showsHorizontalScrollIndicator={false}>
                    {plans?.map((plan, index) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[styles.planNameContainer, selectedPlan === plan.id && styles.selectedPlan]}
                            onPress={() => handleSelectPlan(plan.id, index)}
                        >
                            <Text style={[styles.planName, selectedPlan === plan.id && styles.selectedPlanTitle]}>
                                {toInitCaps(plan.name)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={{ height: 'auto' }}>
                {plans?.filter(item => item.id === selectedPlan)?.map((plan) => (
                    <View key={plan.id}>
                        {renderPlanPrices(plan)}
                        <View style={styles.featuresContainer}>
                            <Text style={styles.features}>Features:</Text>
                            {plan.details.split('#').map((feature, index) => (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <Image source={require('../../assets/tickMark.jpg')} style={styles.image} />
                                    <Text style={styles.featuresText}>{feature.trim()}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};




const styles = StyleSheet.create({
    disabledButton: {
        backgroundColor: '#d3d3d3', // Grey out the button
    },
    image: {
        width: 28,
        height: 28,
        marginRight: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
    },
    header: {
        fontFamily: 'NotoSans-SemiBold',
        fontSize: 18,
        color: '#0158aa',
        marginBottom: 20,
        textAlign: 'left',
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
    },
    features: {
        fontFamily: 'NotoSans-SemiBold',
        fontSize: 16,
        color: '#1b2533',
        marginBottom: 5,
    },
    planContainer: {
        marginBottom: 15,
        position: 'relative',
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#dadce0",
        borderStyle: "solid",
    },
    planNameContainer: {
        marginBottom: 15,
        position: 'relative',
        borderWidth: 1,
        borderRadius: 16,
        borderColor: "#dadce0",
        borderStyle: "solid",
        //  height: 'auto',
        padding: 8,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    planContainerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
    },
    selectedPlan: {
        borderColor: '#0158aa',
        borderWidth:2,
        backgroundColor: '#0158aa',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    selectedPlanNameContainer: {
        borderColor: '#0158aa',
        borderWidth: 2,
        transform: [{ scale: 1.1 }], // Highlight selected plan name
    },
    planInfo: {
        flexDirection: 'column',
    },
    planTitle: {
        fontFamily: 'NotoSans-SemiBold',
        fontSize: 16,
        color: '#000000',
    },
    planName: {
        fontFamily: 'NotoSans-Regular',
        fontSize: 12,
        color: '#000000',
    },
    selectedPlanTitle: {
        color: '#ffffff',
        fontSize: 16,
    },
    discountBadge: {
        fontFamily: 'NotoSans-Regular',
        fontSize: 12,
        color: '#189877',
        backgroundColor: '#e8f5e9',
        padding: 5,
        borderRadius: 5,
        textAlign: 'center',
        width: 70,
    },
    discountBadge1: {
        fontFamily: 'NotoSans-Regular',
        fontSize: 12,
        color: '#fff',
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
        textAlign: 'center',
        width: 70,
    },
    planPrice: {
        fontFamily: 'NotoSans-Regular',
        fontSize: 16,
        color: '#000000',
    },
    selectedPlanPrice: {
        color: '#ffffff',
    },
    tickMark: {
        width: 24,
        height: 24,
        position: 'absolute',
        top: 10,
        right: 10,
    },
    bottomBar: {
        backgroundColor: '#ffffff',
        borderColor: '#0158aa',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    selectedAmount: {
        fontFamily: 'NotoSans-SemiBold',
        fontSize: 18,
        color: '#0158aa',
    },
    continueButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#0158aa",
    },
    continueButtonText: {
        fontFamily: "Inter-Medium",
        textAlign: "center",
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "500",
        color: "#fff",
        textAlign: "center"
    },
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PricingPlans);
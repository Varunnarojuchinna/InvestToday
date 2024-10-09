import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Pressable, Modal, ActivityIndicator,Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { put,get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";

const TrickDetails = (props) => {
    const { id ,token} = props?.route?.params;
    const [isLiveMode, setLiveMode] = useState(true);
    const navigation = useNavigation();
    const [trickDetails, setTrickDetails] = useState();
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [gainLoss, setGainLoss] = useState();
    useEffect(() => {
        getTrickDetails();
    }, []);

    const closeModal = () => {
        setMessage('');
        navigation.goBack();
    }

    const getTrickDetails = () => {
        setLoading(true);
        get(urlConstants.getTrickDetailsByTrickId + id,token)
            .then(res => {
                setLoading(false);
                setTrickDetails(res[0]);
                setLiveMode(res[0]?.is_live)
        let value = res[0]?.current_amount - res[0]?.position_amount
        setGainLoss(value);
            })
            .catch(err => {
                setLoading(false);
            })
    };

    const stopTrick = () => {
        setLoading(true);
        let params = {
            status:!trickDetails?.status
        }
        put(urlConstants.stopTrick+id,params,token)
            .then(res => {
                setLoading(false);
                setMessage("Bot Status Updated Successfully")
                setShowModal(true)
            })
            .catch(err => {
                setLoading(false);
                setMessage("Error while performing the action")
                setShowModal(true)
            })
    };
    const sellTrick = () => {
        setLoading(true);
        const params = {
            "trick_id": trickDetails?.id,
            "current_price": parseFloat(trickDetails?.current_price),
            "total_quantity": parseInt(trickDetails?.position_quantity),
            "symbol": trickDetails?.symbol,
            "exchange": trickDetails?.exchange,
            "is_live": trickDetails?.is_live,
            "broker_type": parseInt(trickDetails?.broker),
            "trick_mode": parseInt(trickDetails?.trick_mode),              
        }
        put(urlConstants.sellTrick,params,token)
            .then(res => {
                setLoading(false);
                setMessage("Stock Sold Successfully")
                setShowModal(true)
            })
            .catch(err => {
                console.log('sell err',err)
                setLoading(false);
                setMessage("Stock Selling Failed")
                setShowModal(true)
        })
    };

    return (
        <ScrollView>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
                </View>
            )}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                            <Text style={styles.modalTitle}>{message}</Text>
                        </View>
                        <Pressable style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <View style={styles.automaticInvesting}>
                <View style={styles.rectangleParent}>
                    <View style={styles.groupChild}>
                        <View style={{ margin: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.trickDetails, styles.textTypo1]}>Bot details</Text>
                            <View style={[styles.switch, styles.fieldFlexBox]}>
                                <View style={isLiveMode ? [styles.switchTab, styles.switchFlexBox] : [styles.switchTab1, styles.switchFlexBox]}
                                >
                                    <Text style={[isLiveMode ? styles.live : styles.test, styles.liveTypo]}>Live</Text>
                                </View>
                                <View style={!isLiveMode ? [styles.switchTab, styles.switchFlexBox] : [styles.switchTab1, styles.switchFlexBox]}
                                >
                                    <Text style={[!isLiveMode ? styles.live : styles.test, styles.liveTypo]}>Test</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginLeft: 16, marginRight: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                            <View style={[styles.frameParent, styles.frameLayout, { flex: 1 }]}>
                                <View>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Position Amount</Text>
                                    <Text style={[styles.text3, styles.textTypo1]}>₹ {Number(trickDetails?.position_amount|| 0).toFixed(4)}</Text>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout]} />
                            </View>
                            <View style={[styles.frameParent1, styles.frameParentLayout, { flex: 1 }]}>
                                <View style={[styles.currentAmountParent]}>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Current Amount</Text>
                                    <View style={styles.wrapper}>
                                        <Text style={styles.textTypo1}>₹ {Number(trickDetails?.current_amount || 0).toFixed(4)}</Text>
                                    </View>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout1]} />
                            </View>
                        </View>
                        <View style={{ margin: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={[styles.frameGroup, styles.frameLayout, { flex: 1 }]}>
                                <View>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Average Price</Text>
                                    <Text style={[styles.text3, styles.textTypo1]}>₹ {Number(trickDetails?.average_amount || 0).toFixed(4)}</Text>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout]} />
                            </View>
                            <View style={[styles.frameParent2, styles.frameParentLayout, { flex: 1 }]}>
                                <View style={[styles.currentAmountParent]}>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Buying No.of Levels</Text>
                                    <View style={styles.wrapper}>
                                        <Text style={styles.textTypo1}>{trickDetails?.buying_level}</Text>
                                    </View>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout1]} />
                            </View>
                        </View>
                        <View style={{ marginLeft: 16, marginRight: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={[styles.frameContainer, styles.framePosition, { flex: 1 }]}>
                                <View>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Position Quantity</Text>
                                    <Text style={[styles.text3, styles.textTypo1]}>{trickDetails?.position_quantity}</Text>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout]} />
                            </View>
                            <View style={[styles.frameView, styles.framePosition, { flex: 1 }]}>
                                <View>
                                    <Text style={[styles.positionAmount, styles.text6Typo]}>Unrealised G/L</Text>
                                    <View style={styles.arrowDownGroup}>
                                        <Image style={[styles.arrowDownIcon, gainLoss > 0 ? {} : { transform: [{ scaleY: -1 }] }]} resizeMode="contain"
                                            source={gainLoss > 0 ? require('../../assets/increase.png') : require('../../assets/decrease.png')} />
                                        <Text style={[styles.text3, styles.textTypo1, gainLoss > 0 ? { color: '#189877' } : { color: '#dd3409' }]}>{Number(gainLoss||0).toFixed(4)}</Text>
                                    </View>
                                </View>
                                <View style={[styles.frameChild, styles.lineViewLayout1]} />
                            </View>
                        </View>
                        <View style={{ margin: 16 }}>
                            <View style={styles.baseInputField}>
                                <Text style={styles.label1}>Take Profit %</Text>
                                <View style={[styles.field, styles.fieldFlexBox]}>
                                    <Text style={styles.ofspacedesigncom}>{trickDetails?.take_profit}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginLeft: 16, marginRight: 16 }}>
                            <View style={styles.baseInputField}>
                                <Text style={styles.label1}>Sell Profit Bounce Back From Peak %</Text>
                                <View style={[styles.field, styles.fieldFlexBox]}>
                                    <Text style={styles.ofspacedesigncom}>{trickDetails?.sell_profit_bounce_back}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ margin: 16 }}>
                            <View style={styles.baseInputField}>
                                <Text style={styles.label1}>Buy Price From Low Bounce Back %</Text>
                                <View style={[styles.field, styles.fieldFlexBox]}>
                                    <Text style={styles.ofspacedesigncom}>{trickDetails?.buy_price_bounce_back}</Text>
                                </View>
                            </View>
                        </View>
                        {trickDetails?.status?<><View style={{ marginLeft: 16, marginRight: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Pressable style={[styles.baseButton, styles.baseFlexBox,parseInt(trickDetails?.position_quantity)===0 && {width:'100%'}]} onPress={stopTrick}>
                                <Text style={[styles.text, styles.textTypo]}>Stop Bot</Text>
                            </Pressable>
                            {trickDetails?.position_quantity >0 && <Pressable style={[styles.baseButton1, styles.baseFlexBox]} onPress={sellTrick}>
                                <Text style={[styles.text1, styles.textTypo]}>SELL</Text>
                            </Pressable>}
                        </View>
                        <View style={{ margin: 16 }}>
                            <Pressable style={[styles.baseButton2, styles.baseFlexBox]} onPress={() => (navigation.navigate('CreateTrick', { item: trickDetails }))}>
                                <Text style={[styles.text2, styles.textTypo]}>Edit Bot Setting</Text>
                            </Pressable>
                        </View></>:
                        <View style={{ marginLeft: 16, marginRight: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable style={[styles.baseButton, styles.baseFlexBox,{width:'100%'}]} onPress={stopTrick}>
                            <Text style={[styles.text, styles.textTypo]}>Resume Bot</Text>
                        </Pressable>
                        </View>
}
                    </View>
                </View>
            </View>
        </ScrollView>);
};

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    arrowDownIcon: {
        height: 12,
        width: 12,
        marginTop:4,
        marginRight: 4
    },
    arrowDownGroup: {
        alignItems: "center",
        flexDirection: "row",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        justifyContent: 'center',
        alignSelf: 'center',
        color: '#445164'
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0158aa',
        padding: 10,
        borderRadius: 8,
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
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    textTypo1: {
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14
    },
    fieldFlexBox: {
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    switchFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    liveTypo: {
        fontFamily: "Poppins-Medium",
        fontSize: 11,
        textAlign: "left",
        fontWeight: "500"
    },
    baseFlexBox: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    textTypo: {
        fontFamily: "Inter-Medium",
        textAlign: "center",
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "500"
    },
    text6Typo: {
        fontFamily: "NotoSans-Regular",
        textAlign: "left"
    },
    lineViewLayout: {
        height: 1,
        borderTopWidth: 1,
        borderRadius: 0.001,
        borderColor: "#dadce0",
        borderStyle: "dashed",
        width: '90%'
    },
    lineViewLayout1: {
        height: 1,
        borderTopWidth: 1,
        borderRadius: 0.001,
        borderColor: "#dadce0",
        borderStyle: "dashed",
        width: '98%'
    },
    frameParentLayout: {
        height: 56,
    },
    frameChildLayout: {
        height: 1,
        borderTopWidth: 1,
        borderRadius: 0.001,
        borderColor: "#dadce0",
        borderStyle: "dashed",
        width: 173,
    },
    batteryIconLayout: {
        width: 24,
        position: "absolute"
    },
    timeTypo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        color: "#fff",
        position: "absolute"
    },
    label: {
        width: 361,
        textAlign: "left",
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14,
        left: 0,
        top: 0,
        position: "absolute"
    },
    groupChild: {
        backgroundColor: "#fff",
        height: 861,
        width: '100%',
        left: 0,
        top: 0,
        position: "absolute"
    },
    trickDetails: {
        height: 19,
    },
    label1: {
        alignSelf: "stretch",
        textAlign: "left",
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14
    },
    ofspacedesigncom: {
        color: "#8f97a2",
        lineHeight: 16,
        textAlign: "left",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        fontSize: 14,
        flex: 1
    },
    field: {
        borderColor: "#d6dae1",
        height: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 8,
        borderWidth: 1,
        borderStyle: "solid",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: "#fff"
    },
    baseInputField: {
        width: '100%',
    },
    baseInputField1: {
        top: 403,
        left: 16,
        width: 361,
        position: "absolute"
    },
    baseInputField2: {
        top: 495,
        left: 16,
        width: 361,
        position: "absolute"
    },
    live: {
        color: "#eee"
    },
    switchTab: {
        backgroundColor: "#0158aa",
        width: 52,
        height: 31,
        borderRadius: 8,
        justifyContent: "center"
    },
    test: {
        color: "#2e2e2e"
    },
    switchTab1: {
        borderRadius: 47,
        width: 56,
        height: 30,
        backgroundColor: "#eee"
    },
    switch: {
        width: 108,
        height: 32,
        backgroundColor: "#eee",
    },
    rectangleParent: {
        height: 861,
        width: '100%',
    },
    text: {
        color: "#0158aa",
        textAlign: "center"
    },
    baseButton: {
        borderColor: "#0158aa",
        width: '48%',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderStyle: "solid",
    },
    text1: {
        color: "#dd3409",
        textAlign: "center"
    },
    baseButton1: {
        borderColor: "#dd3409",
        width: '48%',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderStyle: "solid"
    },
    text2: {
        color: "#fff",
        textAlign: "center"
    },
    baseButton2: {
        backgroundColor: "#0158aa",
        width: '100%'
    },
    positionAmount: {
        color: "#697483",
        fontSize: 12,
        fontFamily: "NotoSans-Regular",
        lineHeight: 16
    },
    text3: {
        marginTop: 4
    },
    frameChild: {
        marginTop: 16
    },
    text6: {
        fontSize: 10,
        lineHeight: 10,
        marginTop: 4,
        color: "#fff"
    },
    lineView: {
        marginTop: 30
    },
    frameChild1: {
        height: 40,
    },
    wrapper: {
        marginTop: 4,
        flexDirection: "row"
    },
    automaticInvesting: {
        backgroundColor: "#dadce0",
        overflow: "hidden",
        flex: 1,
        width: "100%"
    }
});

export default TrickDetails;

import React from "react";
import { Text, StyleSheet, View ,Image} from "react-native";
import { BrokerTypes } from "../../constants/appConstants";

const StockDetails = (props) => {
    const {item,level}=props?.route?.params;

    return (
        <View style={styles.automaticInvesting}>
            <View style={[styles.rectangleParent, styles.groupChildLayout]}>
                <View style={[styles.groupChild, styles.groupChildLayout]}>
                    <Text style={[styles.details, styles.textTypo]}>Details</Text>
                    <View style={{ marginLeft: 16, marginRight: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={[styles.frameParent, styles.frameLayout,{flex:1}]}>
                            <View>
                                <Text style={styles.trickId}>Bot ID</Text>
                                <Text style={[styles.text, styles.textTypo,{width:'90%'}]}>{item?.auto_investment_id}</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout]} />
                        </View>
                        <View style={[styles.frameParent3, styles.frameParentLayout,{flex:1}]}>
                            <View style={styles.priceParent}>
                                <Text style={styles.trickId}>Price</Text>
                                <View style={styles.wrapper}>
                                    <Text style={styles.textTypo}>{level.price}</Text>
                                </View>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout1]} />
                        </View>
                    </View>
                    <View style={{marginLeft:16,marginRight:16,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={[styles.frameGroup, styles.frameLayout,{flex:1}]}>
                            <View>
                                <Text style={styles.trickId}>No. of stocks</Text>
                                <Text style={[styles.text, styles.textTypo]}>{level.quantity}</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout]} />
                        </View>
                        <View style={[styles.frameLayout,{flex:1}]}>
                            <View style={styles.priceParent}>
                                <Text style={styles.trickId}>Buy Amount</Text>
                                <View style={styles.wrapper}>
                                    <Text style={styles.textTypo}>2,23,992.18</Text>
                                </View>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout1]} />
                        </View>
                    </View>
                    <View style={{ margin: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{flex:1}}>
                            <View>
                                <Text style={styles.trickId}>Sell price</Text>
                                <Text style={[styles.text, styles.textTypo]}>189.32</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout]} />
                        </View>
                        <View style={{flex:1}}>
                            <View>
                                <Text style={styles.trickId}>Sell Amount</Text>
                                <Text style={[styles.text, styles.textTypo]}>3,22,322.00</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout1]} />
                        </View>
                    </View>
                    <View style={{ marginLeft: 16,marginRight:16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{flex:1}}>
                            <View>
                                <Text style={styles.trickId}>Level</Text>
                                <Text style={[styles.text, styles.textTypo]}>{level.level_number}</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout]} />
                        </View>
                        <View style={{flex:1}}>
                            <View>
                                <Text style={styles.trickId}>Profit</Text>
                                <Text style={[styles.text6, styles.text6Typo]}>2,28,413.67 (2.22%)</Text>
                            </View>
                            <View style={[styles.frameChild, styles.lineViewLayout1]} />
                        </View>
                    </View>
                    <View style={{margin: 16}}>
                    <Text style={[styles.label1]}>Broker</Text>
                    {item?.broker=== BrokerTypes.ALICE_BLUE &&
                    <View style={[styles.companyChildLayout]}>
                    <Image style={[styles.imageLayout]} resizeMode="cover" source={require('../../assets/aliceBlue.png')} />
                    </View>
                    }
                    {item?.broker=== BrokerTypes.ANGEL_ONE &&
                    <View style={[styles.companyChildLayout]}>
                    <Image style={[styles.imageLayout]} resizeMode="cover" source={require('../../assets/angelBroker.png')} />
                    </View>
                    }

                    </View>
                </View>
            </View>            
        </View>);
};

const styles = StyleSheet.create({
    imageLayout: {
		width: 50,
		height: 50,
		borderRadius: 8,
		borderColor: "#dadce0"
	},
    companyChildLayout: {
		width: 60,
		height: 60,
		borderRadius: 8,
		borderColor: "#dadce0",
		borderWidth: 2
	},
    labelTypo: {
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14
    },
    groupChildLayout: {
        height: '100%',
        width: '100%',
    },
    textTypo: {
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14
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
    framePosition: {
        top: 304,
        position: "absolute"
    },
    text3Clr: {
        color: "#fff",
        textAlign: "left"
    },
    frameParentPosition: {
        top: 396,
        width: 172,
        position: "absolute"
    },
    text6Typo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    frameParentLayout: {
        height: 56,
    },
    groupChild: {
        backgroundColor: "#fff",
    },
    details: {
        marginTop: 25,
        height: 33,
        marginLeft: 16,
    },
    trickId: {
        fontSize: 12,
        lineHeight: 16,
        color: "#697483",
        fontFamily: "NotoSans-Regular",
        textAlign: "left"
    },
    text: {
        marginTop: 4
    },
    frameChild: {
        marginTop: 16
    },
    text3: {
        fontSize: 10,
        lineHeight: 10,
        marginTop: 4,
        fontFamily: "NotoSans-Regular"
    },
    frameContainer: {
        width: 173,
        left: 16
    },
    lineView: {
        marginTop: 30
    },
    text6: {
        color: "#189877",
        marginTop: 4,
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14,
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    wrapper: {
        flexDirection: "row",
        marginTop: 4
    },
    frameChild4: {
        left: 1
    },
    label1: {
        textAlign: "left",
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14
    },
    automaticInvestingChild: {
        marginTop: 8,
        borderRadius: 8,
        width: 50,
        height: 50,
        backgroundColor: "#dadce0"
    },
    automaticInvesting: {
        flex: 1,
        height: '100%',
        overflow: "hidden",
        width: "100%",
        backgroundColor: "#dadce0"
    }
});

export default StockDetails;

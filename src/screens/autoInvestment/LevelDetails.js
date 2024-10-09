import React,{useState, useEffect} from "react";
import { Text, StyleSheet, View, Image } from "react-native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";

const LevelDetails = (props) => {
    const {item,token} = props.route.params;
    const [levels,setLevels] = useState();
    const [isLiveMode, setLiveMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getLevels();
    }, []);

    const getLevels = () => {
        setLoading(true);       
        get(urlConstants.getLevelSettingForTrick +item?.id,token).
        then((response) => {          
            setLevels(response);
            setLiveMode(item?.is_live);
            setMessage('No Data Found');
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            setMessage('No Data Found');
            console.log(error);
        });
    };

    return (
        <View style={styles.automaticInvesting}>
            <View style={[styles.automaticInvestingChild, styles.vectorParentPosition]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',marginRight:16 }}>
            <Text style={[styles.yourTricks]}>Levels</Text>

                <View style={styles.switch}>
                    <View style={isLiveMode ?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setLiveMode(true)}>
                        <Text style={[isLiveMode ?styles.live4:styles.test1, styles.live4Typo]}>Live</Text>
                    </View>
                    <View style={!isLiveMode?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setLiveMode(false)}>
                        <Text style={[!isLiveMode?styles.live4:styles.test1, styles.live4Typo]}>Test</Text>
                    </View>
                </View>
            </View>
            {levels?.length > 0 ? <View style={styles.frameParent}>
            {levels.map((level,index) => (
                                <View key={index} style={styles.stockLayout}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <Image style={styles.frameChild} resizeMode="cover"
                                            source={item?.status ?
                                                require("../../assets/dotLiveGreen.png")
                                                : require("../../assets/redDot.png")} />
                                        <Text style={[item?.status  ? styles.live : styles.test, styles.livePosition]}>{item?.status ? 'Active' : 'InActive'}</Text>
                                    </View>
                                    <Text style={styles.stockName}>{item?.symbol} ({item.exchange})</Text>
                                    <View style={styles.stockNameGroup}>
                                    <Text style={styles.trickId11211}>{'Bot ID: '}{item?.auto_investment_id}</Text>
                                    <Text style={styles.trickId11211}>{'Level: '}{level?.level_number}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View >
                                            <Text style={[styles.text, styles.textTypo]}>{level?.quantity}</Text>
                                            <Text style={[styles.amountNeedFor1, styles.text1Position, { maxWidth: '100%' }]}>Quantity</Text>
                                        </View>
                                        <View style={{ marginRight: 16 }}>
                                            <Text style={[styles.text1, styles.text1Position,{alignSelf:'flex-end'}]}>₹ {Number(level?.quantity*item?.current_price).toFixed(4)||'N/A'}</Text>
                                            <Text style={[styles.amountNeedFor, styles.amountLayout, { maxWidth: '100%' }]}>Amount Needed</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                            }
            </View>
            :<View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.trickId11211}>{message}</Text>
            </View>}
            </View>

        </View>);
};

const styles = StyleSheet.create({
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
        fontSize: 14
    },
    text1Position: {
        textAlign: "left",
    },
    stockLayout: {
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",
        borderRadius: 8,
        width: '95%',
        paddingBottom: 16,
        marginTop: 8,
    },
    switchFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    live4Typo: {
        fontFamily: "Poppins-Medium",
        fontSize: 11,
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
        top: 49,
        width: 24,
        position: "absolute"
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
        position: "absolute"
    },
    automaticInvestingChild: {
        backgroundColor: "#fff",
        height: '100%'
    },
    stockName: {
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 16,
        textAlign: "left",
        fontSize: 14,
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
        fontSize: 14
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
        height: '100%',
        flex: 1,
        overflow: "hidden",
        width: "100%"
    }
});

export default LevelDetails;

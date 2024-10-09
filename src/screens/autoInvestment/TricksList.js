import React,{useState,useCallback} from "react";
import { Text, StyleSheet, View, Image, Pressable, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';

const TricksList = (props) => {
    const { userInfo } = props;
	const { userDetails } = userInfo;
    const [tricksList,setTricksList] = useState();
    const navigation = useNavigation();
    const [isLiveMode, setLiveMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const getStocksTricks = () => {
        setLoading(true);       
        get(urlConstants.getTricksForStocksbyUserId,userDetails?.token).
        then(async (response) => {
            const uniqueData = await response.reduce((acc, current) => {
                const x = acc.find(item => item.auto_investment_id === current.auto_investment_id);
                if (!x) {
                  acc.push(current);
                }
                return acc;
              }, []);
              const sortedTricks = await uniqueData.sort((a, b) => b.status - a.status);            
            setTricksList(sortedTricks);
            setMessage('You have not created any bot yet.');
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            setMessage('You have not created any bot yet.');
            console.log('tricks',error);
        });
    };  

    useFocusEffect(
        useCallback(() => {
            getStocksTricks();
        }, [])
    );

    const liveCount = tricksList?.filter(item => item?.is_live).length;
    const testCount = tricksList?.filter(item => !item?.is_live).length;

    return (
        <View style={styles.automaticInvesting}>
            <View style={[styles.automaticInvestingChild, styles.vectorParentPosition]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',marginRight:16 }}>
                <Text style={styles.yourTricks}>My Bot</Text>
                <View style={styles.switch}>
                    <Pressable style={isLiveMode ?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setLiveMode(true)}>
                        <Text style={[isLiveMode ?styles.live4:styles.test1, styles.live4Typo]}>Live ({liveCount})</Text>
                    </Pressable>
                    <Pressable style={!isLiveMode?[styles.switchTab, styles.switchFlexBox]:[styles.switchTab1, styles.switchFlexBox]}
                        onPress={()=>setLiveMode(false)}>
                        <Text style={[!isLiveMode?styles.live4:styles.test1, styles.live4Typo]}>Test ({testCount})</Text>
                    </Pressable>
                </View>
            </View>
            {tricksList?.length > 0 ? <View style={styles.frameParent}>
            {(tricksList && !loading) ? 
            tricksList.filter(item => item?.is_live === isLiveMode).map((item,index) => (
                                <TouchableOpacity key={index} style={styles.stockLayout} onPress={() => { navigation.navigate('LevelDetails', { item:item,token:userDetails?.token}) }}>
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
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View >
                                            <Text style={[styles.text, styles.textTypo]}>{item?.buying_level}</Text>
                                            <Text style={[styles.amountNeedFor1, styles.text1Position, { maxWidth: '100%' }]}>No Of Levels</Text>
                                        </View>
                                        <View style={{ marginRight: 16 ,alignItems:'flex-end'}}>
                                            <Text style={[styles.text1, styles.text1Position,{alignSelf:'flex-end'}]}>₹ {Number(item?.current_price).toFixed(4)||'N/A'}</Text>
                                            <Text style={[styles.amountNeedFor, styles.amountLayout, { maxWidth: '100%' }]}>Price</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))                        
                        : 
                        <View style={{ flexDirection: 'row', alignItems: 'center',marginLeft:-16 }}>
                            <Text style={styles.trickId11211}>Loading Bot....</Text>
                            </View>
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
        marginRight: 12,
    },
    textTypo: {
        marginTop: 4,
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 14
    },
    text1Position: {
        textAlign: "left",
    },
    stockLayout: {
        borderWidth: 1,
        borderColor: "#dadce0",
        borderRadius: 8,
        width: '95%',
        paddingBottom: 16,
        paddingVertical: 1,  
        marginTop: 4,
        marginBottom: 4,  
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
        marginLeft: 12,
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
        marginLeft: 12,  
        textAlign: "left",
    },
    frameChild: {
        marginTop: 4,
        marginRight:4,
        width: 8,
        height: 8,
    },
    live: {
        color: "#189877"
    },
    text: {
        marginLeft: 12,
        textAlign: "left",
    },
    amountNeedFor1: {
        color: "#697483",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        marginLeft: 12,  
    },
    text1: {
        marginTop: 4,
        color: "#445164",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 14
    },
    test: {
        color: "#dd3409"
    },
    stockNameGroup: {
        marginTop: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 12
    },
    frameParent: {
        marginTop: 8,
        marginLeft: 12,
    },
    yourTricks: {
        marginTop: 12,
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 12,
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

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(TricksList);

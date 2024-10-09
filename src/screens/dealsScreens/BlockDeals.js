import React,{useState,useEffect} from "react";
import { StyleSheet, View, Image, Text, Pressable, ScrollView,ActivityIndicator } from "react-native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { useNavigation } from "@react-navigation/native";

const DealsBlock = () => {
    const navigation = useNavigation();
    const [loading, setIsLoading] = useState(false);
	const [blockDeals,setBlockDeals] = useState();

	const getBlockDeals = ()=>{
        setIsLoading(true);
        const params={
			status:'block'
		}
		get(`${urlConstants.deals}status=${params.status}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.blockDealDetailsList?.map((item) => ({
				date:item?.date.replace(/-/g,' '),
				companyName:item?.securityName,
                quantityTraded:item?.quantityTraded,
				symbol:item?.symbol,
				clientName:item?.clientName,
				tradePrice:item?.tradePrice,
				buySellFlag:item?.buySell.toLowerCase() === "sell" 
								? "Sold" 
								: item.buySell.toLowerCase() === "buy" 
								? "Bought" 
								: "--",
			}))
				setBlockDeals(formattedData)
		})
		.catch(err => {
            setIsLoading(false);
            console.log('block',err)})
    };
	useEffect(()=>{
		getBlockDeals();
	},[])

    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
		{loading && (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size="large" color="#0158aa" />
                <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
			</View>
		)}
        <ScrollView>
        <View style={styles.dealsblock}>
            <View style={[styles.dealsblockChild, styles.vectorParentPosition]}>
                {blockDeals?.length>0 && blockDeals?.map((item,index)=>(
                    <Pressable key={index} style={[styles.frameParent, styles.frameParentLayout]} onPress={()=>{navigation.navigate('DealsCompanyDetails', {
						screen: 'Prices',
						params: { item: item },
					  });
					  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 16 }}>
                        <View style={[styles.calendarParent, styles.baseBadgeFlexBox]}>
                            <Image style={styles.calendarIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
                            <Text style={[styles.may2024, styles.may2024Typo]}>{item?.date}</Text>
                        </View>
                        <View style={[styles.badge, styles.badgeFlexBox]}>
                            <View style={[styles.baseBadge, styles.baseBadgeFlexBox]}>
                                <Text style={[styles.label, styles.labelTypo]}>NSE</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.companyName}>{item?.companyName}</Text>

                    <Text style={[styles.sold85000Container, styles.sold85000ContainerPosition]}>
                    <Text style={item?.buySellFlag==='Bought'?styles.bought:styles.sold}>
                            {item?.buySellFlag}</Text>
          					<Text style={styles.rs1320Of}> {item?.quantityTraded} @ Rs. {item?.tradePrice}</Text>
        				</Text>
                        <Text style={[styles.sold85000Container, styles.sold85000ContainerPosition]}>
                        <Text style={styles.may2024Typo}>{item?.clientName}</Text>
                        </Text>
                        
                </Pressable>)
                )}
            </View>

        </View>
        </ScrollView>
        </View>
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
    vectorParentPosition: {
        width: '100%'
    },
    frameParentLayout: {
        width: '93%',
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",
        borderRadius: 8,
        marginLeft: 16,
    },
    baseBadgeFlexBox: {
        alignItems: "center",
        flexDirection: "row"
    },
    may2024Typo: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "500"
    },
    badgeFlexBox: {
        flexDirection: "row"
    },
    labelTypo: {
        lineHeight: 12,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500"
    },
    sold85000ContainerPosition: {
            marginTop: 8,
    		lineHeight: 12,
    		fontSize: 12,
    		textAlign: "left",
    		fontFamily: "NotoSans-Medium",
    		fontWeight: "500",
    },
    timeTypo: {
        color: "#fff",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        position: "absolute"
    },
    wrapperLayout: {
        height: 24,
        top: 49,
        width: 24,
        position: "absolute"
    },
    tabLayout: {
        height: 40,
        borderBottomWidth: 1,
        borderStyle: "solid"
    },
    tabFlexBox: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: "center",
        width: 131,
        alignItems: "center",
        flexDirection: "row"
    },
    textTypo: {
        lineHeight: 20,
        fontSize: 14,
        textAlign: "center"
    },
    dealsblockChild: {
        backgroundColor: "#fff",
        width: '100%'

    },
    calendarIcon: {
        width: 16,
        height: 16
    },
    may2024: {
        marginLeft: 8,
        textAlign: "center",
        color: "#445164",
        lineHeight: 20,
        fontSize: 14
    },
    calendarParent: {
        marginTop: 16,
        marginLeft: 16
    },
    companyName: {
        marginTop: 8,
        fontSize: 16,
        lineHeight: 24,
        marginLeft: 16,
        textAlign: "left",
        color: "#445164",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
    },
    label: {
        textAlign: "left",
        color: "#0158aa",
        fontSize: 12,
        lineHeight: 12
    },
    baseBadge: {
        borderRadius: 50,
        backgroundColor: "#e6f2fe",
        paddingHorizontal: 6,
        paddingVertical: 4
    },
    badge: {
        marginTop: 16
    },
    sold: {
        color: "#dd3409",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    rs1320Of: {
        fontFamily: "NotoSans-Regular",
        color: "#445164",
    },
    sold85000Container: {
        lineHeight: 9,
        textAlign: "left",
        marginLeft:16,
        color:'#445164'
    },
    frameParent: {
        marginTop: 16,
        paddingBottom:16
    },
    frameContainer: {
        top: 396
    },
    frameView: {
        top: 518
    },
    frameParent1: {
        top: 640
    },
    frameParent2: {
        top: 762
    },
    frameParent3: {
        top: 884
    },
    frameParent4: {
        top: 1006
    },
    bought: {
        color: "#189877"
  },
    sold8: {
        color: "#dd3409"
    },
    sold85000Container8: {
        lineHeight: 12,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "center"
    },
    frameParent5: {
        top: 948,
        height: 100,
        width: 361,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#dadce0",
        borderStyle: "solid",
        left: 16,
        position: "absolute"
    },
    vectorParent: {
        top: 0,
        height: 88,
        width: 393,
        left: 0
    },
    batteryIcon: {
        marginTop: -4,
        right: 14,
        height: 11,
        width: 24,
        top: "50%",
        position: "absolute"
    },
    wifiIcon: {
        width: 15,
        height: 11
    },
    cellularIcon: {
        width: 17,
        height: 11
    },
    time: {
        marginTop: -10,
        left: 23,
        letterSpacing: 0,
        width: 30,
        height: 17,
        top: "50%",
        color: "#fff",
        textAlign: "center",
        fontSize: 14
    },
    statusbariphoneXLightBackg: {
        height: "36.36%",
        top: "0%",
        right: "0%",
        bottom: "63.64%",
        left: "0%",
        position: "absolute",
        width: "100%"
    },
    icon: {
        height: "100%",
        width: "100%"
    },
    wrapper: {
        left: 16
    },
    deals: {
        top: 46,
        left: 56,
        fontSize: 20,
        lineHeight: 29,
        textAlign: "left"
    },
    shareIcon: {
        left: 353
    },
    text: {
        fontFamily: "NotoSans-Regular",
        textAlign: "center",
        color: "#445164"
    },
    dealsblock: {
        backgroundColor: "#dadce0",
        flex: 1,
        overflow: "hidden",
        width: "100%"
    }
});

export default DealsBlock;
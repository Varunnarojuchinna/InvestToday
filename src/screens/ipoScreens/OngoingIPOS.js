import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, Pressable, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { extractFaceValue,extractAmount,convertDateFormat,convertToLakhs,convertPriceRange } from "../../services/helpers";

const IPOOngoing = () => {

    const navigation = useNavigation();
    const [loading, setIsLoading] = useState(false);
    const [ongoingIPOData, setOngoingIPOData] = useState();

    useEffect(() => {
        getOngoingIPOData();
    }, []);

    const getOngoingIPOData = () => {
        setIsLoading(true);
        const params = {
            status: 'ongoing'
        }
        get(urlConstants.ipo + params.status)
            .then((res) => {
                setIsLoading(false);
                const formattedData = res?.map(item => ({
                    fromDate: item?.ipoDetails?.openDate ? convertDateFormat(item.ipoDetails.openDate): 'N/A',
                    toDate: item?.ipoDetails?.closeDate ? convertDateFormat(item.ipoDetails.closeDate) : 'N/A',
                    companyName: item?.Name ? item.Name.replace(' IPO','') : 'N/A',
                    numberOfShares: item?.ipoDetails?.sharesOffered ? convertToLakhs(item.ipoDetails.sharesOffered) : 'N/A',
                    totalSharesValue: item?.ipoDetails?.totalIssueSize ? convertToLakhs(item?.ipoDetails.totalIssueSize.split(' ')[0]):'N/A',
                    price: item?.ipoDetails?.priceBand ? convertPriceRange(item.ipoDetails.priceBand) : 'N/A',
                    issueType: item?.ipoDetails?.issueType ? item.ipoDetails.issueType : 'N/A',
                    faceValue: item?.ipoDetails?.faceValue ? extractFaceValue(item.ipoDetails.faceValue) : 'N/A',
                    shareHoldingPreIssue: item?.ipoDetails?.shareHoldingPreIssue? convertToLakhs(item.ipoDetails.shareHoldingPreIssue) : 'N/A',
                    shareHoldingPostIssue: item?.ipoDetails?.shareHoldingPostIssue ? convertToLakhs(item.ipoDetails.shareHoldingPostIssue) : 'N/A',
                    issueSize: item?.ipoDetails?.totalIssueSize ? extractAmount(item?.ipoDetails.totalIssueSize):'N/A',
                    promoterNames:item?.promoterNames?.promoterNames,
                    subscriptionDetails:item?.subscriptionDetails?item.subscriptionDetails:'N/A',
                    ipoObjectives:item?.companyDetails?.ipoObjectives?item.companyDetails.ipoObjectives:'N/A',
                    promoterDetails:item?.promoterDetails?item.promoterDetails:'N/A',
                    exchanges:item?.ipoDetails?.exchanges?item.ipoDetails.exchanges:'N/A',
                    lotSize:item?.ipoDetails?.lotSize?item.ipoDetails.lotSize.split(' ')[0]:'N/A',
                    aboutCompany:item?.companyDetails?.summary?item.companyDetails.summary:'N/A',
                }))
                setOngoingIPOData(formattedData)
            })
            .catch(err => {
                setIsLoading(false);
                console.log('ongoingIpo', err)
            })
    };

    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
                </View>
            )}
            <ScrollView>
                <View style={styles.ipoongoing}>
                    <View style={[styles.ipoongoingChild, styles.containerPosition]} >
                        {ongoingIPOData?.length > 0 && ongoingIPOData.map((item, index) => (
                            <Pressable key={index} style={[styles.frameParent, styles.frameParentLayout]} onPress={() => { navigation.navigate('CompanyDetails', { item: item }) }}>
                                <View style={[styles.frameGroup, styles.framePosition]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 12,flex:1 }}>
                                        <View style={[styles.homeTrendUpParent, styles.parentFlexBox,{flex:3}]}>
                                            <Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/homeTrendUpIcon.png')} />
                                            <Text style={[styles.companyName, styles.may2024ToSpaceBlock]}>{item.companyName}</Text>
                                        </View>
                                        <View style={styles.frameContainer}>
                                            <View style={[styles.parentFlexBox,{alignItems:'center'}]}>
                                               {item.price!='N/A' && <Image style={styles.currencyRupeeIcon} resizeMode="cover" source={require('../../assets/currencyIcon.png')} />}
                                                <Text style={[styles.text, styles.textTypo]}>{item.price}</Text>
                                            </View>
                                            {/* <Text style={styles.times}>N/A times</Text> */}
                                        </View>
                                    </View>
                                    <Text style={[styles.noofSharedOfferedContainer, styles.containerTypo]}>
                                        <Text style={styles.noofSharedOffered}>{`No.of shared offered: `}</Text>
                                        <Text style={styles.lakhs}>{item.numberOfShares}{` Lakhs`}</Text>
                                    </Text>
                                    <Text style={[styles.totalBid13040Container, styles.containerTypo]}>
                                        <Text style={styles.noofSharedOffered}>{`Total Bid: `}</Text>
                                        <Text style={styles.lakhs}>{item.totalSharesValue}{` Lakhs`}</Text>
                                    </Text>
                                    
                                <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'space-between' }}>                                    
                                    <View style={[styles.calendarParent, styles.parentFlexBox,{alignItems:'center'}]}>
                                        <Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
                                        <Text style={[styles.may2024To, styles.containerTypo]}>{item.fromDate}{' to '}{item.toDate}</Text>
                                    </View>
                                   
                                </View>
                            </View>               
                    
                </Pressable>
                    ))
            }
                </View>
        </View>
        </ScrollView >
        </View >
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
    frameParentLayout: {
        width: '93%',
        borderColor: "#dadce0",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        marginLeft: 16,
        marginTop: 8,
        paddingBottom: 12,
        overflow: "hidden"
    },
    framePosition: {
        marginTop: 16,
    },
    parentFlexBox: {
        flexDirection: "row"
    },
    may2024ToSpaceBlock: {
        marginLeft: 8,
        color: "#445164"
    },
    containerTypo: {
        fontFamily: "NotoSans-Regular",
        fontSize: 14,
        textAlign: "left"
    },
    labelTypo: {
        fontWeight: "500",
        fontSize: 12
    },
    textTypo: {
        lineHeight: 20,
        fontSize: 14,
        textAlign: "center"
    },
    ipoongoingChild: {
        backgroundColor: "#fff",
        width: '100%',
        paddingTop: 12,
    },
    homeTrendUpIcon: {
        width: 16,
        height: 16
    },
    companyName: {
        fontSize: 16,
        lineHeight: 19,
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
    },
    noofSharedOffered: {
        color: "#445164"
    },
    lakhs: {
        color: "#0158aa"
    },
    noofSharedOfferedContainer: {
        marginTop: 8,
       
    },
    totalBid13040Container: {
        marginTop: 8,
    },
    may2024To: {
        marginLeft: 8,
        color: "#445164"
    },
    calendarParent: {
        marginTop: 8,
    },
    label: {
        fontFamily: "NotoSans-Medium",
        color: "#6b3ceb",
        textAlign: "left",
        lineHeight: 12
    },
    baseBadge: {
        borderRadius: 4,
        borderColor: "#e1d8fb",
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderWidth: 1,
        alignItems: "center",
        borderStyle: "solid"
    },
    badge: {
        marginTop: 12,
        flexDirection: "row",
    },
    frameGroup: {
        marginLeft: 16
    },
    currencyRupeeIcon: {
        width: 14,
        height: 14,
        overflow: "hidden"
    },
    text: {
        color: "#189877",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    times: {
        marginTop: 4,
        lineHeight: 12,
        fontSize: 12,
        fontFamily: "NotoSans-Regular",
        textAlign: "center",
        color: "#445164"
    },
    frameContainer: {
        alignItems: "flex-end",
        flex:2
    },
    text1: {
        lineHeight: 16,
        fontFamily: "Inter-Medium",
        color: "#fff",
        textAlign: "center"
    },
    baseButton: {
        marginRight: 12,
        width: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: "center",
        backgroundColor: "#0158aa",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    ipoongoing: {
        backgroundColor: "#dadce0",
        overflow: "hidden",
        width: "100%",
        flex: 1
    }
});

export default IPOOngoing;

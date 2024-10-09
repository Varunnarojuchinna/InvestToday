import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, Pressable,ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { extractFaceValue,extractAmount,convertDateFormat,convertToLakhs,convertPriceRange } from "../../services/helpers";


const IPOUpcoming = () => {
	const navigation = useNavigation();
	const [loading, setIsLoading] = useState(false);
	const [upcomingIPOData, setUpcomingIPOData] = useState();

	useEffect(() => {
		getUpcomingIpoData();
	}, []);

	const getUpcomingIpoData = () => {
		setIsLoading(true);
		const params = {
			status: 'upcoming'
		}
		get(urlConstants.ipo + params.status)
			.then((res) => {
				setIsLoading(false);
				const formattedData = res?.map(item => ({
					fromDate: item?.ipoDetails?.openDate ? convertDateFormat(item.ipoDetails.openDate): 'N/A',
                    toDate: item?.ipoDetails?.closeDate ? convertDateFormat(item.ipoDetails.closeDate) : 'N/A',
                    companyName: item?.Name ? item.Name.replace(' IPO','') : 'N/A',
                    numberOfShares: item?.ipoDetails?.sharesOffered ?convertToLakhs(item.ipoDetails.sharesOffered):item?.ipoDetails?.offerForSale?convertToLakhs(item?.ipoDetails?.offerForSale.split(' ')[0]): 'N/A',
                    totalSharesValue: item?.ipoDetails?.totalIssueSize ? convertToLakhs(item?.ipoDetails.totalIssueSize.split(' ')[0]):'N/A',
                    price: item?.ipoDetails?.price ? convertPriceRange(item.ipoDetails.price) : 'N/A',
                    issueType: item?.ipoDetails?.issueType ? item.ipoDetails.issueType : 'N/A',
                    faceValue: item?.ipoDetails?.faceValue ? extractFaceValue(item.ipoDetails.faceValue) : 'N/A',
                    shareHoldingPreIssue: item?.ipoDetails?.shareHoldingPreIssue? convertToLakhs(item.ipoDetails.shareHoldingPreIssue) : 'N/A',
                    shareHoldingPostIssue: item?.ipoDetails?.shareHoldingPostIssue ? convertToLakhs(item.ipoDetails.shareHoldingPostIssue) : 'N/A',
                    issueSize:item?.ipoDetails?.totalIssueSize ? extractAmount(item?.ipoDetails.totalIssueSize):'N/A',
                    promoterNames:item?.promoterNames?.promoterNames,
                    subscriptionDetails:item?.subscriptionDetails?item.subscriptionDetails:'N/A',
                    ipoObjectives:item?.companyDetails?.ipoObjectives?item.companyDetails.ipoObjectives:'N/A',
                    promoterDetails:item?.promoterDetails?item.promoterDetails:'N/A',
					exchanges:item?.ipoDetails?.exchanges?item.ipoDetails.exchanges:'N/A',
					lotSize:item?.ipoDetails?.lotSize?item.ipoDetails.lotSize.split(' ')[0]:'N/A',
					aboutCompany:item?.companyDetails?.summary?item.companyDetails.summary:'N/A',
				}))
				setUpcomingIPOData(formattedData)
			})
			.catch(err => {
				setIsLoading(false);
				console.log('upcomingipo', err)
			})
	}

	return (
		<View style={{ backgroundColor: '#fff', flex: 1 }}>
		{loading && (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size="large" color="#0158aa" />
				<Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
			</View>
		)}
		<ScrollView>
			<View style={styles.ipoupcoming}>
				<View style={styles.ipoupcomingChild}>					
					{upcomingIPOData?.length>0 && upcomingIPOData.map((item, index) => (
						<Pressable key= {index} style={[styles.frameParent, styles.frameParentLayout]} onPress={() => {navigation.navigate('CompanyDetails',{item:item}) }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 12,flex:1 }}>
							<View style={[styles.frameGroup, styles.framePosition]}>
								<View style={[styles.homeTrendUpParent, styles.parentFlexBox]}>
									<Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/homeTrendUpIcon.png')} />
									<Text style={[styles.companyName, styles.may2024ToSpaceBlock]}>{item.companyName}</Text>
								</View>
								<Text style={[styles.issueSizeCrContainer, styles.textTypo]}>
									<Text style={[styles.issueSizeCr, styles.issueClr]}>{`Issue Size (Cr): `}</Text>
									<Text style={styles.text}>{item.issueSize}</Text>
								</Text>
								<View style={[styles.calendarParent, styles.issuePosition]}>
									<Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
									<Text style={[styles.may2024To, styles.textTypo]}>{item.fromDate}{' to '}{item.toDate}</Text>
								</View>
							</View>
							<View style={[styles.frameWrapper, styles.framePosition]}>
								<View style={styles.frameContainer}>
									<View style={[styles.parentFlexBox,{alignItems:'center'}]}>
									{item.price!='N/A' && <Image style={styles.currencyRupeeIcon} resizeMode="cover" source={require('../../assets/currencyIcon.png')} />}
									<Text style={[styles.text1, styles.textTypo]}>{item.price}</Text>
									</View>
								</View>
							</View>
						</View>
					</Pressable>))}
				</View>
			</View>
		</ScrollView>
		</View>);
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
		borderWidth: 1,
		borderColor: "#dadce0",
		borderStyle: "solid",
		borderRadius: 8,
		marginLeft: 16,
		overflow: "hidden",
		paddingBottom:12
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
	textTypo: {
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left"
	},
	issueClr: {
		color: "#445164",
		fontFamily: "NotoSans-Regular"
	},
	ipoupcomingChild: {
		backgroundColor: "#fff",
		width: '100%',
		paddingTop:12
	},
	homeTrendUpIcon: {
		width: 16,
		height: 16
	},
	companyName: {
		fontSize: 16,
		lineHeight: 19,
		textAlign: "left",
		marginLeft: 8,
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	issueSizeCr: {
		fontFamily: "NotoSans-Regular"
	},
	text: {
		fontWeight: "500",
		fontFamily: "NotoSans-Medium",
		color: "#0158aa"
	},
	issueSizeCrContainer: {
		marginTop: 8,
		fontSize: 14
	},
	may2024To: {
		fontFamily: "NotoSans-Regular",
		marginLeft: 8,
		color: "#445164"
	},
	calendarParent: {
		marginTop: 8,
		alignItems: "center",
		flexDirection: "row"
	},
	frameGroup: {
		marginLeft: 16,
		flex: 3
	},
	currencyRupeeIcon: {
		width: 14,
		height: 14,
		overflow: "hidden"
	},
	text1: {
		color: "#189877",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	frameContainer: {
		alignItems: "flex-end"
	},
	frameWrapper: {
		alignItems: "flex-end",
		flex: 2
	},
	frameParent: {
		marginTop: 8
	},
	ipoupcoming: {
		backgroundColor: "#dadce0",
		overflow: "hidden",
		width: "100%",
		flex: 1
	}
});

export default IPOUpcoming;

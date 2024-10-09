import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, Pressable, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { extractFaceValue,extractAmount,convertDateFormat,convertToLakhs,convertPriceRange } from "../../services/helpers";

const IPOListed = () => {

	const navigation = useNavigation();
	const [loading, setIsLoading] = useState(false);
	const [listedIPOData, setListedIPOData] = useState();

	useEffect(() => {
		getListedIPOData();
	}, []);
      
	const getListedIPOData = () => {
		setIsLoading(true);
		const params = {
			status: 'listed'
		}
		const changeInPrice = (currentPrice, previousPrice) => {
			const formattedCurrentPrice = extractAmount(currentPrice);
			const formattedPreviousPrice = extractAmount(previousPrice);
		  
			if (formattedPreviousPrice === null || formattedCurrentPrice === null) {
			  console.log('One of the prices could not be extracted');
			  return '--';
			}
		  
			const changeInPrice = currentPrice - previousPrice;
			return changeInPrice.toFixed(2);
		  };

		  const calculatePercentageChange = (previousPrice, currentPrice) => {
			const formattedPreviousPrice = extractAmount(previousPrice);
			const formattedCurrentPrice = extractAmount(currentPrice);
		  
			if (formattedPreviousPrice === null || formattedCurrentPrice === null) {
			  console.log('One of the prices could not be extracted');
			  return 'N/A';
			}
		  
			const percentageChange = Math.abs((formattedCurrentPrice - formattedPreviousPrice) / formattedPreviousPrice) * 100;
		  
			return percentageChange.toFixed(2) + '%';
		  };
		get(urlConstants.ipo + params.status)
			.then((res) => {
				setIsLoading(false);
				const formattedData = res?.map(item => ({
					listedDate: item?.ipoDetails?.listingDate ? convertDateFormat(item.ipoDetails.listingDate): 'N/A',
					fromDate: item?.ipoDetails?.openDate ? convertDateFormat(item.ipoDetails.openDate): 'N/A',
                    toDate: item?.ipoDetails?.closeDate ? convertDateFormat(item.ipoDetails.closeDate) : 'N/A',
                    companyName: item?.Name ? item.Name.replace(' IPO','') : 'N/A',
                    numberOfShares: item?.ipoDetails?.sharesOffered ? convertToLakhs(item.ipoDetails.sharesOffered) : 'N/A',
                    totalSharesValue: item?.ipoDetails?.totalIssueSize ? convertToLakhs(item?.ipoDetails.totalIssueSize.split(' ')[0]):'N/A',
                    price: item?.ipoDetails?.price ? convertPriceRange(item.ipoDetails.price) : 'N/A',
                    issueType: item?.ipoDetails?.issueType ? item.ipoDetails.issueType : 'N/A',
                    faceValue: item?.ipoDetails?.faceValue ? extractFaceValue(item.ipoDetails.faceValue) : 'N/A',
                    shareHoldingPreIssue: item?.ipoDetails?.shareHoldingPreIssue? convertToLakhs(item.ipoDetails.shareHoldingPreIssue) : 'N/A',
                    shareHoldingPostIssue: item?.ipoDetails?.shareHoldingPostIssue ? convertToLakhs(item.ipoDetails.shareHoldingPostIssue) : 'N/A',
                    issueSize:item?.ipoDetails?.totalIssueSize ? extractAmount(item?.ipoDetails.totalIssueSize):'N/A',
                    promoterNames:item?.promoterNames?.promoterNames?item.promoterNames.promoterNames:'N/A',
                    subscriptionDetails:item?.subscriptionDetails?item.subscriptionDetails:'N/A',
                    ipoObjectives:item?.companyDetails?.ipoObjectives?item.companyDetails.ipoObjectives:'N/A',
                    promoterNames:item?.promoterNames?.promoterNames,
					exchanges:item?.ipoDetails?.exchanges?item.ipoDetails.exchanges:'N/A',
					lotSize:item?.ipoDetails?.lotSize?item.ipoDetails.lotSize.split(' ')[0]:'N/A',
					listingPrice:item?.ipoDetails?.listedPrice?extractAmount(item.ipoDetails.listedPrice):'N/A',
					lastTradePrice:item?.ipoDetails?.lastTradePrice?extractAmount(item.ipoDetails.lastTradePrice):'N/A',
					changeOverIssuePrice:changeInPrice(item?.ipoDetails?.lastTradePrice,item?.ipoDetails?.price),
					changeOverListedPrice:changeInPrice(item?.ipoDetails?.lastTradePrice,item?.ipoDetails?.listedPrice),
					percentageChangeIssuePrice:calculatePercentageChange(item?.ipoDetails?.price,item?.ipoDetails?.lastTradePrice),
					percentageChangeListedPrice:calculatePercentageChange(item?.ipoDetails?.listedPrice,item?.ipoDetails?.lastTradePrice),	
					aboutCompany:item?.companyDetails?.summary?item.companyDetails.summary:'N/A',
					}))
				setListedIPOData(formattedData)
			})
			.catch(err => {
				setIsLoading(false);
				console.log('listedIpo', err)
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
			<View style={styles.ipolisting}>
				<View style={styles.ipolistingChild}>
					{listedIPOData?.length > 0 && listedIPOData.map((item, index) => (
						<Pressable key={index} style={[styles.frameParent, styles.frameParentLayout]} onPress={() => {navigation.navigate('CompanyDetails',{item:item}) }}>
							<View style={styles.frameGroup}>
								<View style={{flex:3}}>
									<View style={[styles.homeTrendUpParent, styles.parentFlexBox]}>
										<Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/homeTrendUpIcon.png')} />
										<Text style={[styles.companyName, styles.may2024SpaceBlock]}>{item.companyName}</Text>
									</View>
									<View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
										<Text style={[styles.listingPrice14830, styles.issueContainerFlexBox]}>Listing Price:</Text>
										<Image style={[styles.currencyRupeeIcon, styles.currencyIconLayout]} resizeMode="cover" source={require('../../assets/currencyIconBlack.png')} />
										<Text style={[styles.listingPrice14830, styles.issueContainerFlexBox]}>{item.listingPrice} </Text>
									</View>
									<View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
										<Text style={[styles.issuePrice14830, styles.issueContainerFlexBox]}>Issue Price:</Text>
										<Image style={[styles.currencyRupeeIcon1, styles.currencyIconLayout]} resizeMode="cover" source={require('../../assets/currencyIconBlack.png')} />
										<Text style={[styles.issuePrice14830, styles.issueContainerFlexBox]}>{item.price}</Text>
									</View>
								</View>
								<View style={[styles.frameWrapper, styles.framePosition]}>
									<View style={[styles.parentFlexBox,{alignItems:'center'}]}>
										<Image style={styles.currencyIconLayout} resizeMode="cover" source={require('../../assets/currencyIcon.png')} />
										<Text style={[styles.text4, styles.textTypo]}>{item.lastTradePrice}</Text>
									</View>
								</View>
							</View>
							<View style={{marginTop:8}}>
								<Text style={[styles.changeOverIssueContainer, styles.issueContainerFlexBox]}>
									<Text style={styles.changeOverIssue}>Change over Issue price: {item?.changeOverIssuePrice}  {`(`}</Text>
									<Image style={[styles.arrowUpIcon, styles.arrowIconLayout]} resizeMode="cover" 
									source={item?.changeOverIssuePrice>0?
										require('../../assets/upArrow.png'):require('../../assets/downArrow.png')} />
									<Text style={item?.changeOverIssuePrice>0?styles.text:styles.text2}>{item?.percentageChangeIssuePrice}</Text>
									<Text style={styles.changeOverIssue}>{`) `}</Text>
								</Text>
							</View>
							<View style={{ marginTop: 8 }}>
								<Text style={[styles.changeOverListedContainer, styles.issueContainerFlexBox]}>
									<Text style={styles.changeOverIssue}>Change over Listed price: {item?.changeOverListedPrice} {`( `}</Text>
									<Image style={[styles.arrowUpIcon1, styles.arrowIconLayout]} resizeMode="cover" 
									source={item?.changeOverListedPrice>0?
										require('../../assets/upArrow.png'):require('../../assets/downArrow.png')} />
									<Text style={item?.changeOverListedPrice>0?styles.text:styles.text2}>{item?.percentageChangeListedPrice}</Text>
									<Text style={styles.changeOverIssue}>{`) `}</Text>
								</Text>
							</View>
							<View style={[styles.calendarParent, styles.parentFlexBox,{alignItems:'center'}]}>
								<Image style={styles.homeTrendUpIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
								<Text style={[styles.may2024, styles.issueContainerTypo]}>{item?.listedDate}</Text>
							</View>
						</Pressable>
					))
					}
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
	frameParent:{
		marginTop: 8,
	},
	frameParentLayout: {
		width: '93%',
		borderWidth: 1,
		borderColor: "#dadce0",
		borderRadius: 8,
		borderStyle: "solid",
		marginLeft: 16,
		overflow: "hidden",
		paddingBottom: 8
	},
	parentFlexBox: {
		flexDirection: "row"
	},
	may2024SpaceBlock: {
		marginLeft: 8,
		textAlign: "left",
		color: "#445164"
	},
	issueContainerFlexBox: {
		textAlign: "left",
	},
	currencyIconLayout: {
		height: 14,
		width: 14,
		overflow: "hidden"
	},
	issueContainerTypo: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 20,
		fontSize: 14
	},
	framePosition: {
		alignItems: "flex-end",
		flex:1
	},
	textTypo: {
		lineHeight: 20,
		fontSize: 14,
		textAlign: "center"
	},
	arrowIconLayout: {
		height: 12,
		width: 12,
	},
	ipolistingChild: {
		backgroundColor: "#fff",
		width: '100%',
		paddingTop: 12
	},
	homeTrendUpIcon: {
		width: 16,
		height: 16
	},
	companyName: {
		fontSize: 16,
		lineHeight: 19,
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
	},
	listingPrice14830: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		fontSize: 14,
		textAlign: "left",
		color: "#445164"
	},
	
	issuePrice14830: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 20,
		fontSize: 14,
		left: 1,
		textAlign: "left",
		color: "#445164"
	},
	frameGroup: {
		marginTop: 16,
		marginLeft: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginRight: 12,
		flex:1
	},
	changeOverIssue: {
		color: "#445164"
	},
	text: {
		color: "#189877"
	},
	changeOverIssueContainer: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 20,
		fontSize: 14,
		left: 16
	},
	text2: {
		color: "#dd3409"
	},
	changeOverListedContainer: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 20,
		fontSize: 14,
		left: 16
	},
	may2024: {
		marginLeft: 8,
		textAlign: "center",
		color: "#445164"
	},
	calendarParent: {
		marginTop: 8,
		marginLeft: 17,
	},
	text4: {
		color: "#189877",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	ipolisting: {
		backgroundColor: "#dadce0",
		overflow: "hidden",
		flex: 1,
		width: "100%"
	}
});

export default IPOListed;

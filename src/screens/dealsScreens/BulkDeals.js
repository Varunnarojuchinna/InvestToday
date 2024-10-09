import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, Pressable, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { useNavigation } from "@react-navigation/native";

const DealsBulk = () => {
	const navigation = useNavigation();
	const [loading, setIsLoading] = useState(false);
	const [bulkDeals, setBulkDeals] = useState();

	const getBulkDeals = () => {
		setIsLoading(true);
		const params = {
			status: 'bulk'
		}
		get(`${urlConstants.deals}status=${params.status}`)
			.then((res) => {
				setIsLoading(false);
				const formattedData = res?.bulkDealDetailsList?.map((item) => ({
					date: item?.date.replace(/-/g, ' '),
					companyName: item?.securityName,
					quantityTraded: item?.quantityTraded,
					symbol: item?.symbol,
					clientName: item?.clientName,
					tradePrice: item?.tradePrice,
					buySellFlag: item?.buySell.toLowerCase() === "sell"
						? "Sold"
						: item.buySell.toLowerCase() === "buy"
							? "Bought"
							: "--",
				}))
				setBulkDeals(formattedData)
			})
			.catch(err => {
				setIsLoading(false);
				console.log('bulkDeals', err)
			})
	};
	useEffect(() => {
		getBulkDeals();
	}, [])

	return (
		<View style={{ backgroundColor: '#fff', flex: 1 }}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#0158aa" />
					<Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
				</View>
			)}
			<ScrollView>
				<View style={styles.dealsbulk}>
					<View style={[styles.dealsbulkChild, styles.vectorParentPosition]}>
						{bulkDeals?.length > 0 && bulkDeals?.map((item, index) => (
							<Pressable key={index} style={[styles.frameParent, styles.frameParentLayout]} onPress={() => {
								navigation.navigate('DealsCompanyDetails', {
									screen: 'Prices',
									params: { item: item },
								});
							}}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 16 }}>
									<View style={[styles.calendarParent, styles.baseBadgeFlexBox]}>
										<Image style={styles.calendarIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
										<Text style={[styles.may2024, styles.text1FlexBox]}>{item?.date}</Text>
									</View>
									<View style={[styles.badge, styles.badgeFlexBox]}>
										<View style={[styles.baseBadge, styles.baseBadgeFlexBox]}>
											<Text style={styles.label}>NSE</Text>
										</View>
									</View>
								</View>
								<Text style={[styles.companyName, styles.text1FlexBox]}>{item?.companyName}</Text>

								<Text style={[styles.sold85000Container, styles.containerTypo]}>
									<Text style={item?.buySellFlag === 'Bought' ? styles.bought : styles.sold}>
										{item?.buySellFlag}</Text>
									<Text style={styles.rs1320}> {item?.quantityTraded} @ Rs. {item?.tradePrice}</Text>
								</Text>
							</Pressable>)
						)}
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
	vectorParentPosition: {
		width: '100%',
	},
	frameParentLayout: {
		height: 'auto',
		width: '93%',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: "#dadce0",
		borderStyle: "solid",
		marginLeft: 16,
	},
	baseBadgeFlexBox: {
		alignItems: "center",
		flexDirection: "row"
	},
	text1FlexBox: {
		textAlign: "left",
		color: "#445164"
	},
	badgeFlexBox: {
		flexDirection: "row",
	},
	containerTypo: {
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
	dealsbulkChild: {
		height: 'auto',
		backgroundColor: "#fff",
		width: '100%',
	},
	calendarIcon: {
		width: 16,
		height: 16
	},
	may2024: {
		marginLeft: 8,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		textAlign: "center",
		lineHeight: 20,
		fontSize: 14
	},
	calendarParent: {
		marginLeft: 16,
		marginTop: 16,
	},
	companyName: {
		marginTop: 8,
		fontSize: 16,
		lineHeight: 24,
		marginLeft: 17,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		textAlign: "left",
	},
	label: {
		textAlign: "left",
		color: "#0158aa",
		lineHeight: 12,
		fontSize: 12,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	baseBadge: {
		borderRadius: 50,
		backgroundColor: "#e6f2fe",
		paddingHorizontal: 6,
		paddingVertical: 4
	},
	sold: {
		color: "#dd3409"
	},
	rs1320: {
		color: "#445164"
	},
	sold85000Container: {
		marginLeft: 16
	},
	frameParent: {
		marginTop: 16,
		paddingBottom: 16
	},
	frameGroup: {
		top: 260
	},
	bought: {
		color: "#189877"
	},
	bought85000Container: {
		left: 16
	},
	frameContainer: {
		top: 368
	},
	frameView: {
		top: 476
	},
	frameParent1: {
		top: 584
	},
	frameParent2: {
		top: 692
	},
	frameParent3: {
		top: 800
	},
	frameParent4: {
		top: 948
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
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		color: "#0158aa",
		textAlign: "center",
		lineHeight: 20,
		fontSize: 14
	},
	text1: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 20,
		fontSize: 14
	},
	dealsbulk: {
		backgroundColor: "#dadce0",
		flex: 1,
		overflow: "hidden",
		width: "100%"
	}
});

export default DealsBulk;

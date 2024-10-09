
import React, { useEffect, useState,useContext ,useRef, useCallback} from 'react';
import {
	Image, StyleSheet, Text, View, Pressable, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator,
	UIManager, LayoutAnimation, Dimensions, RefreshControl
} from "react-native";
import { LineChart } from 'react-native-chart-kit';
import { get } from '../services/axios';
import { urlConstants } from '../constants/urlConstants';
import { formatNumber, formatWidth } from '../services/helpers';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import * as authAction from '../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import crashlytics from '@react-native-firebase/crashlytics';
import { WebSocketContext } from '../components/WebSocketProvider';
import { useFocusEffect } from '@react-navigation/native';
const { width: screenWidth } = Dimensions.get('window');

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const DashboardScreen = (props) => {
	const { indicesDataHl, sensexDataGraphHl, nifty50DataGraphHl, niftyBankGraphHl} = useContext(WebSocketContext)||{};
	const {userInfo} = props;
	const navigation = useNavigation();
	const [selectedPeriod, setSelectedPeriod] = useState('1M');
	const periods = ['1M', '3M', '6M', '1Y'];
	const [sensexGraph, setSensexGraph] = useState([]);
	const [nifty50Graph, setNifty50Graph] = useState([]);
	const [niftyBankGraph, setNiftyBankGraph] = useState([]);
	const [newsData, setNewsData] = useState();
	const [loading, setIsLoading] = useState(false);
	const [refreshing,setRefreshing] = useState(false);
	const scrollViewRef = useRef();
	const [isSubscribed, setIsSubscribed] = useState(false);

	const scrollToStart = () => {
	  if (scrollViewRef.current) {
		scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
	  }
	};

	const nifty50dataGraph = nifty50Graph?.map(graphData => ({
		datasets: [
			{
				data: graphData,
				color: () => `#ffffff`,
				strokeWidth: 2,
			}
		],
	}));
	
	const sensexDataGraph = sensexGraph?.map(graphData => ({
		datasets: [
			{
				data: graphData,
				color: () => `#ffffff`,
				strokeWidth: 2,
			}
		],
	}));
	const bankNiftyDataGraph = niftyBankGraph?.map(graphData => ({
		datasets: [
			{
				data: graphData,
				color: () => `#ffffff`,
				strokeWidth: 2,
			}
		],
	}));
	const [nifty50Data, setNifty50Data] = useState();
	const [sensexData, setSensexData] = useState();
	const [niftyBankData, setNiftyBankData] = useState();
	const [nifty50Returns, setNifty50returns] = useState();
	const [sensexReturns, setSensexReturns] = useState();
	const [niftyBankReturns, setNiftyBankReturns] = useState();
	const chartConfig = {
		backgroundGradientFrom: 'transparent',
		backgroundGradientFromOpacity: 0,
		backgroundGradientTo: "transparent",
		backgroundGradientToOpacity: 0,
		color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
		barPercentage: 0.5,
		propsForLabels: {
			display: 'none',
		},
		propsForDots: {
			r: "2",
			strokeWidth: "1",
			stroke: "#ffffff"
		},
	};
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [header, setHeader] = useState();

	const [dataOrder, setDataOrder] = useState(['Nifty 50', 'Sensex', 'Bank Nifty']);
	const [indicesData, setIndicesData] = useState();
	const [indicesReturns, setIndicesReturns] = useState();
	const [animateItems, setAnimateItems] = useState(true);
	useEffect(() => {
		if (indicesDataHl) {
			getSensexData(indicesDataHl?.sensex);
			getNifty50Data(indicesDataHl?.nifty50);
			getNiftyBankData(indicesDataHl?.niftyBank);
		}
		if (sensexDataGraphHl) {
			getSensexGraph(sensexDataGraphHl);
			getSensexReturns(sensexDataGraphHl);
		}
		if (nifty50DataGraphHl) {
			getNifty50Graph(nifty50DataGraphHl);
			getNifty50Returns(nifty50DataGraphHl);
		}
		if (niftyBankGraphHl) {
			getNiftyBankGraph(niftyBankGraphHl);
			getNiftyBankReturns(niftyBankGraphHl);
		}
	},[indicesDataHl, sensexDataGraphHl, nifty50DataGraphHl, niftyBankGraphHl]);

	useFocusEffect(
		useCallback(() => {
	}, [])
	);
	useEffect(() => {
		const animationTimer = setTimeout(() => {
			if (animateItems) {
				LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
				let newDataOrder = dataOrder;
				if (header) {
					const selectedIndex = dataOrder.indexOf(header);
					newDataOrder = [
						header,
						...dataOrder.slice(selectedIndex + 1),
						...dataOrder.slice(0, selectedIndex),
					];
				} else {
					newDataOrder = [...dataOrder.slice(1), dataOrder[0]];
				}
				if (JSON.stringify(newDataOrder) !== JSON.stringify(dataOrder)) {
					setDataOrder(newDataOrder);
				  }
			}
		}, 2000);
		return () => clearTimeout(animationTimer);
	}, [dataOrder, animateItems, header]);

	const circularReorder = (array, item) => {
		const itemIndex = array.indexOf(item);
		if (itemIndex === -1) return array;
		return [...array.slice(itemIndex), ...array.slice(0, itemIndex)];
	};

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = ()=>{
		setRefreshing(false);
		getLatestNews();
	};

	const handleRefresh = () =>{
		setRefreshing(true);
		fetchData();
	};
	const formatPercentValue = (value) => {
		let percentChange = parseFloat(value).toFixed(2);
		if ((percentChange) === "0.00" || (percentChange) === "-0.00") {
		percentChange = parseFloat(value).toFixed(4);
		}
		return percentChange+'%';
	};

	const calculateReturns = (currentPrice, previousPrice) => {
		return parseFloat(((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2);
	};

	const getLatestNews = () => {
		setIsLoading(true)
		const params = {
			category: 'business',
			pageSize: 2
		}
		get(`${urlConstants.news}category=${params.category}`)
			.then((res) => {
				setIsLoading(false)
				const formattedData = res?.filter(item=>item.urlToImage)?.slice(0,2).map(item => ({
					title: item?.title,
					description: item.description ? item.description : item.title,
					image: item?.urlToImage
				}))
				setNewsData(formattedData)
			})
			.catch(err => {
				setIsLoading(false)
				crashlytics.log('news', err)
			})
	};

	const getSensexGraph = (data) => {
		const sortByDatetime = (data) => {
			return data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
		  };
		let dataForGraph = [];	
		if(data?.intervalList){	
			if(data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0){
		const oneMonth = sortByDatetime(data?.intervalList["1day"]?.values)?.slice(0,29).map(item => parseFloat(item.close));
		const threeMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		const sixMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,24).map(item => parseFloat(item.close));
		const oneYear = sortByDatetime(data?.intervalList["1month"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		oneMonth.push(data?.currentDetails?.close); 
		dataForGraph = [oneMonth,threeMonths,sixMonths,oneYear];
		setSensexGraph(dataForGraph)
			}
		}
	};

	const getNifty50Graph = (data) => {
		const sortByDatetime = (data) => {
			return data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
		  };
		let dataForGraph = [];	
		if(data?.intervalList){	
			if(data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0){
		const oneMonth = sortByDatetime(data?.intervalList["1day"]?.values)?.slice(0,29).map(item => parseFloat(item.close));
		const threeMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		const sixMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,24).map(item => parseFloat(item.close));
		const oneYear = sortByDatetime(data?.intervalList["1month"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		oneMonth.push(data?.currentDetails?.close); 
		dataForGraph = [oneMonth,threeMonths,sixMonths,oneYear];
		setNifty50Graph(dataForGraph)
			}
		}
	};

	const getNiftyBankGraph = (data) => {
		const sortByDatetime = (data) => {
			return data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
		  };
		  if(data?.intervalList){
			if(data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0 && data?.intervalList["1day"]?.values?.length>0){
		let dataForGraph = [];		
		const oneMonth = sortByDatetime(data?.intervalList["1day"]?.values)?.slice(0,29).map(item => parseFloat(item.close));
		const threeMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		const sixMonths = sortByDatetime(data?.intervalList["1week"]?.values)?.slice(0,24).map(item => parseFloat(item.close));
		const oneYear = sortByDatetime(data?.intervalList["1month"]?.values)?.slice(0,12).map(item => parseFloat(item.close));
		oneMonth.push(data?.currentDetails?.close); 
		dataForGraph = [oneMonth,threeMonths,sixMonths,oneYear];
		setNiftyBankGraph(dataForGraph)
			}
		  }
	};

	const getSensexData = (data) => {
				const formattedData = {
					dateTime:moment(data?.updatedOn).format("DD MMM YYYY, hh:mm A"),
					close: formatNumber(data?.close),
					change: parseFloat(data?.change).toFixed(2),
					percent_change: formatPercentValue(data?.percent_change),
					difference: data?.close - data?.previous_close,
					advances:data?.advances,
					declines:data?.declines
				};
				setSensexData(formattedData);
	};
	const getNifty50Data = (data) => {
				const formattedData = {
					dateTime:moment(data?.updatedOn).format("DD MMM YYYY, hh:mm A"),
					close: formatNumber(data?.close),
					change: parseFloat(data?.change).toFixed(2),
					percent_change: formatPercentValue(data?.percent_change),
					difference: data?.close - data?.previous_close,
					advances:data?.advances,
					declines:data?.declines
				};
				setNifty50Data(formattedData);
	};
	const getNiftyBankData = (data) => {
				const formattedData = {
					dateTime:moment(data?.updatedOn).format("DD MMM YYYY, hh:mm A"),
					close: formatNumber(data?.close),
					change: parseFloat(data?.change).toFixed(2),
					percent_change: formatPercentValue(data?.percent_change),
					difference: data?.close - data?.previous_close,
					advances:data?.advances,
					declines:data?.declines
				};
				setNiftyBankData(formattedData);
	};
	const getSensexReturns = (data) => {
		if(data?.currentDetails?.close && data?.historyDetails[0]?.closePrice){
		const formattedData = {
			'1M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[0]?.closePrice),
			'3M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[1]?.closePrice),
			'6M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[2]?.closePrice),
			'1Y': calculateReturns(data?.currentDetails?.close, data?.historyDetails[3]?.closePrice),
		};
		setSensexReturns(formattedData);
	}
	};
	const getNifty50Returns = (data) => {
		if(data?.currentDetails?.close && data?.historyDetails[0]?.closePrice){
		const formattedData = {
			'1M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[0]?.closePrice),
			'3M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[1]?.closePrice),
			'6M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[2]?.closePrice),
			'1Y': calculateReturns(data?.currentDetails?.close, data?.historyDetails[3]?.closePrice),
		};
		setNifty50returns(formattedData);
	}
	};
	const getNiftyBankReturns = (data) => {
		if(data?.currentDetails?.close && data?.historyDetails[0]?.closePrice){
		const formattedData = {
			'1M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[0]?.closePrice),
			'3M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[1]?.closePrice),
			'6M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[2]?.closePrice),
			'1Y': calculateReturns(data?.currentDetails?.close, data?.historyDetails[3]?.closePrice),
		};
		setNiftyBankReturns(formattedData);
	}
	};

	const handleDropdownPress = (item) => {
		if (header === item) {
			setDropdownOpen(false);
			handleReleasePress();
			setHeader()
			return;
		}
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const newDataOrder = circularReorder(dataOrder, item)
		setDataOrder(newDataOrder);
		setAnimateItems(false);
		setDropdownOpen(true);
		setHeader(item);
	};
	const handleReleasePress = () => {
		setAnimateItems(true);
	};
	useEffect(() => {
		const newIndicesData = {
		  'Nifty 50': nifty50Data,
		  'Sensex': sensexData,
		  'Bank Nifty': niftyBankData
		};
	  
		if (JSON.stringify(indicesData) !== JSON.stringify(newIndicesData)) {
		  setIndicesData(newIndicesData);
		}
	  }, [nifty50Data, sensexData, niftyBankData]);

	  useEffect(() => {
		const newIndicesReturns = {
		  'Nifty 50': nifty50Returns,
		  'Sensex': sensexReturns,
		  'Bank Nifty': niftyBankReturns
		};
		if (JSON.stringify(indicesReturns) !== JSON.stringify(newIndicesReturns)) {
		  setIndicesReturns(newIndicesReturns);
		}
	  }, [nifty50Returns, sensexReturns, niftyBankReturns]);

	const handlePeriodChange = (period) => {
		setSelectedPeriod(period);		
	}
	return (
		<View style={{ backgroundColor: '#fff', flex: 1 }}>			
			<ScrollView 
			refreshControl={
				<RefreshControl
				  refreshing={refreshing}
				  onRefresh={handleRefresh}
				  colors={['#0158aa', '#689F38']}
				  progressViewOffset={50}
				/>
			  }>
				<View style={styles.home}>
					<StatusBar barStyle={'light-content'} backgroundColor={'#0158aa'} />
					<ScrollView horizontal={true} ref={scrollViewRef}>
					<View style={{ backgroundColor: '#0158aa', height: 'auto' }}>
						<View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: 16,marginBottom:16 }}>
							{dataOrder.map((item, index) => (
								<Pressable key={index} onPress={() => {handleDropdownPress(item); scrollToStart()}} style={{maxWidth:230,marginLeft:12 }}>
									<View style={[styles.parentPosition]} >
										{indicesData && <><Text style={[styles.nifty502232476, styles.textLayout]}>{item}: {indicesData[item]?.close!=='NaN'?indicesData[item]?.close:'00000:00'}</Text>
											<Text style={[styles.text28,
											indicesData[item]?.difference > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }
											]}>{` (`}{indicesData[item]?.percent_change!=='NaN%'?indicesData[item]?.percent_change:'0.00'}{`)`}</Text></>}
										<Image
											style={[
												styles.arrowIconPosition,
												header == item ? { transform: [{ scaleY: -1 }] } : {}
											]}
											resizeMode="cover"
											source={require('../assets/down_Arrow.png')}
										/>
									</View>
								</Pressable>
							))}
						</View>
					</View>
					</ScrollView>
					{isDropdownOpen && <View style={{ backgroundColor: '#0158aa', marginBottom: 8 }}>
						{(sensexDataGraph.length==4 && nifty50dataGraph.length==4 && niftyBankGraph.length==4)?<>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<View style={{ flex: 1 }}>
								<Text style={[styles.nifty50, styles.menuIconPosition,{marginLeft:16}]}>{header}</Text>
								<Text style={[styles.apr202432, styles.textLayout, { marginLeft: 17, }]}>{indicesData[header]?.dateTime}</Text>
								<View style={styles.parent}>
									<Text style={[styles.text, styles.textTypo4]}>₹ {indicesData[header]?.close}</Text>
									<View style={[styles.arrowDownParent, { marginLeft: 17, justifyContent: 'flex-start' }]}>
										{indicesData[header]?.difference > 0 ?
											<Image
												style={[styles.arrowDownIcon, { marginTop: 4, marginRight: 4 }]}
												resizeMode="cover"
												source={require('../assets/increase.png')} />
											: <Image
												style={[styles.arrowDownIcon, { marginTop: 4, marginRight: 4 ,transform: [{ scaleY: -1 }]}]}
												resizeMode="cover"
												source={require('../assets/decrease.png')} />}
										<Text
											style={[styles.text1,
											styles.textLayout,
											indicesData[header]?.difference > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>
											{indicesData[header]?.change}{' '}{`( `}{indicesData[header]?.percent_change}{` )`}
										</Text>
									</View>
								</View>
								{indicesReturns && <View style={{ flexDirection: 'row', marginTop: 6 }}>
									<Text style={[styles.mReturns, styles.text2Typo]}>{`${selectedPeriod} returns `}</Text>
									{indicesReturns?.[header]?.[selectedPeriod]>0 ?
											<Image
												style={[styles.arrowDownIcon, { marginTop: 4, marginRight: 4 }]}
												resizeMode="cover"
												source={require('../assets/increase.png')} />
											: <Image
												style={[styles.arrowDownIcon, { marginTop: 4, marginRight: 4 ,transform: [{ scaleY: -1 }]}]}
												resizeMode="cover"
												source={require('../assets/decrease.png')} />}
									<Text style={[styles.text2, styles.text2Typo,
									indicesReturns?.[header]?.[selectedPeriod] > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>
										({indicesReturns?.[header]?.[selectedPeriod] }%)</Text>
								</View>}
							</View>
							<View style={{ flex: 1 }}>
								<View style={[styles.badge]}>
									{periods?.map((period) => (
										<TouchableOpacity key={period} style={{ width: '25%' }} onPress={() => handlePeriodChange(period)}>
											<View style={selectedPeriod === period ? [styles.baseBadge, styles.groupChildBorder] : styles.baseBadge}>
												<Text style={[styles.label, styles.textTypo4]}>{period}</Text>
											</View>
										</TouchableOpacity>
									))}
								</View>
								{header==='Sensex' && <LineChart
									data={sensexDataGraph[periods.indexOf(selectedPeriod)]}
									width={screenWidth * 0.6}
									height={125}
									chartConfig={chartConfig}
									bezier
									style={{ marginLeft: '-30%' }}
									withHorizontalLines={false}
									withVerticalLines={false}
									yAxisInterval={1}
								/>}
								{header==='Bank Nifty' && <LineChart
									data={bankNiftyDataGraph[periods.indexOf(selectedPeriod)]}
									width={screenWidth * 0.6}
									height={125}
									chartConfig={chartConfig}
									bezier
									style={{ marginLeft: '-30%' }}
									withHorizontalLines={false}
									withVerticalLines={false}
									yAxisInterval={1}
								/>}
								{header==='Nifty 50' && <LineChart
									data={nifty50dataGraph[periods.indexOf(selectedPeriod)]}
									width={screenWidth * 0.6}
									height={125}
									chartConfig={chartConfig}
									bezier
									style={{ marginLeft: '-30%' }}
									withHorizontalLines={false}
									withVerticalLines={false}
									yAxisInterval={1}
								/>}
							</View>
						</View>
						<View style={styles.rectangleParent}>
							<View style={[styles.groupChild, styles.groupLayout1, { width: formatWidth(indicesData[header]?.advances, indicesData[header]?.declines) }]} />
							<View style={[styles.groupInner, styles.groupPosition]} />
							<View style={[styles.groupItem, styles.groupPosition, { width: formatWidth(indicesData[header]?.declines, indicesData[header]?.advances) }]} />
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginRight: 16 }}>
							<Text style={[styles.advances, styles.advancesTypo]}>Advances</Text>
							<Text style={[styles.declines, styles.advancesTypo]}>Declines</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginRight: 16, marginBottom: 16 }}>
							<Text style={[styles.text3, styles.textTypo1,]}>{indicesData[header]?.advances}</Text>
							<Text style={[styles.text4, styles.textClr1]}>{indicesData[header]?.declines}</Text>
						</View>
						</>:<Text style={{color:'#fff',textAlign:'center',padding:16}}>Loading...</Text>}
					</View>}
					<View style={[styles.groupView, styles.groupLayout]}>
						<View style={[styles.groupChild3, styles.groupExploreLayout]} >
							<Text style={[styles.explore, styles.textTypo1]}>Explore</Text>
							<View style={{ flexDirection: 'row',justifyContent:'space-between',marginLeft:16,marginRight:16 }}>
								<Pressable style={[styles.groupParent1, styles.groupParentLayout2]} onPress={() => { navigation.navigate('FII_DIIActivity')}}>
									<View style={[styles.groupChild4, styles.groupParentLayout2]} >
										<View style={[styles.menuParent, styles.ipoParentLayout]}>
											<Image style={[styles.menuIcon, styles.menuIconLayout]} resizeMode="cover" source={require('../assets/fii_dii_Activity.png')} />
											<Text style={[styles.fiiDii, styles.ipoParentLayout]}>FII / DII Activity</Text>
										</View>
									</View>
								</Pressable>
								<Pressable style={[styles.groupParent1, styles.groupParentLayout2]} onPress={() => { navigation.navigate('IPO') }}>
									<View style={[styles.groupChild4, styles.groupParentLayout2]} >
										<View style={[styles.menuParent, styles.ipoParentLayout]}>
											<Image style={[styles.menuIcon, styles.menuIconLayout]} resizeMode="cover" source={require('../assets/ipo.png')} />
											<Text style={[styles.fiiDii, styles.ipoParentLayout]}>IPO</Text>
										</View>
									</View>
								</Pressable>
								<Pressable style={[styles.groupParent1, styles.groupParentLayout2]} onPress={() => { navigation.navigate('Investors') }}>
									<View style={[styles.groupChild4, styles.groupParentLayout2]} >
										<View style={[styles.menuParent, styles.ipoParentLayout]}>
											<Image style={[styles.menuIcon, styles.menuIconLayout]} resizeMode="cover" source={require('../assets/investors.png')} />
											<Text style={[styles.fiiDii, styles.ipoParentLayout]}>Investors</Text>
										</View>
									</View>
								</Pressable>
								<Pressable style={[styles.groupParent1, styles.groupParentLayout2]} onPress={() => {navigation.navigate('Deals') }}>
									<View style={[styles.groupChild4, styles.groupParentLayout2]} >
										<View style={[styles.menuParent, styles.ipoParentLayout]}>
											<Image style={[styles.menuIcon, styles.menuIconLayout]} resizeMode="cover" source={require('../assets/deals.png')} />
											<Text style={[styles.fiiDii, styles.ipoParentLayout]}>Deals</Text>
										</View>
									</View>
								</Pressable>
							</View>
							{(userInfo?.isUserLoggedIn && userInfo?.userDetails?.isUserSubscribed) && <View style={{ flexDirection: 'row',marginLeft:16 }}>
								<Pressable style={[styles.groupParent1, styles.groupParentLayout2]} onPress={() => {navigation.navigate('AutoInvest') }}>
									<View style={[styles.groupChild4, styles.groupParentLayout2]} >
										<View style={[styles.menuParent, styles.ipoParentLayout]}>
											<Image style={[styles.menuIcon, styles.menuIconLayout]} resizeMode="cover" source={require('../assets/autoInvest.png')} />
											<Text style={[styles.fiiDii, styles.ipoParentLayout]}>Automate Invest</Text>
										</View>
									</View>
								</Pressable>
								</View>}
						</View>
					</View>
					<View style={[styles.homeInner, styles.homeInnerPosition]}>
						{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#0158aa" />
					<Text style={{ color: '#fff', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>

				</View>
			)}
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  				<Text style={[styles.latestNews, styles.textLayout]}>Latest News</Text>
  				<Pressable style={styles.button} onPress={() => { navigation.navigate('News') }}>
    				<View style={styles.baseButton}>
      				<Text style={[styles.text5, styles.textTypo]}>View All</Text>
    				</View>
  				</Pressable>
			</View>
			<View style={styles.frameWrapper}>
  			<View style={styles.groupParent}>
    		{newsData?.length > 0 && newsData.map((item, index) => (
      		<View key={index} style={{ width: '48%' }}>
        <View style={[styles.rectangleView, styles.groupChildBorder]}>
		<Pressable onPress={() => navigation.navigate('News', { tab: 'Business' })}>
		<Image
              style={[styles.rectangleIcon, styles.groupChild2Position]}
              resizeMode="cover"
              source={
                item.image ? { uri: item.image }
                : index % 2 === 0 ? require('../assets/newsDashboard.png') : require('../assets/newspaper.jpg')
              }
            />
          </Pressable>
          <Text style={[styles.centerReceivesSeven, styles.centerTypo]} numberOfLines={3}>{item.title}</Text>
          <Text style={[styles.centerRecievesFor, styles.ipoClr]} numberOfLines={3}>
            {item.description ? item.description : item.title}
          </Text>
        </View>
      </View>
    ))}
  			</View>
			</View>
					</View>
					
					<View style={[styles.groupParent9, styles.groupParentLayout, { backgroundColor: "#202020" }]}>
						<Image style={[styles.groupIcon, styles.groupParentLayoutImage]} resizeMode="contain" source={require('./../assets/undrawinvestment.png')} />
						<Image style={[styles.vectorIcon, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon1, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon2, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon3, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon4, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dotVector.png')} />
						<Image style={[styles.vectorIcon5, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon6, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorStem.png')} />
						<Text style={[styles.upgradeToPremium, styles.textPictureTypo]}>Upgrade to premium for powerful insights</Text>
						<View style={[styles.baseButton4, styles.baseFlexBox]}>
							<Text style={[styles.apr2024327, styles.textLayout]}>Go Premium</Text>
						</View>
					</View>
					<View style={[styles.homeInner2, styles.homeInnerPosition]}>
						<View>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<View style={styles.indicesWrapper}>
									<Text style={[styles.indices, styles.textTypo1]}>Indices</Text>
								</View>
								<View style={styles.button}>
									<View style={styles.baseButton}>
										<Text style={[styles.text5, styles.textTypo]}>View All</Text>
									</View>
								</View>
							</View>
							<View style={styles.frameWrapper}>
								<Pressable style={styles.containerLayout} onPress={() => { }}>
									<View style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
										<Text style={[styles.sensex, styles.text23Typo]}>Sensex</Text>
										<Text style={[styles.pm, styles.pmLayout]}>{sensexData?.time}</Text>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginRight: 16 }}>
										<View style={{ marginRight: 8 }}>
											<Text style={[styles.text23, styles.text23Typo]}>{sensexData?.close}</Text>
											<View style={styles.arrowDownGroup}>
												<Image style={[styles.arrowDownIcon,sensexData?.difference>0?{}:{transform: [{ scaleY: -1 }]}]} resizeMode="cover" 
												source={sensexData?.difference >0 ?require('../assets/increase.png'):require('../assets/decrease.png')} />
												<Text style={[styles.text24, styles.textClr,sensexData?.difference> 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>{sensexData?.change} ({sensexData?.percent_change})</Text>
											</View>
										</View>
										<Image style={[styles.arrowRightIcon1, styles.arrowPosition1]} resizeMode="cover" source={require('../assets/arrowRight.png')} />
									</View>
								</Pressable>
								<Pressable style={styles.containerLayout} onPress={() => { }}>
									<View style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
										<Text style={[styles.sensex, styles.text23Typo]}>Bank Nifty</Text>
										<Text style={[styles.pm, styles.pmLayout]}>{niftyBankData?.time}</Text>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginRight: 16 }}>
										<View style={{ marginRight: 8 }}>
											<Text style={[styles.text23, styles.text23Typo]}>{niftyBankData?.close}</Text>
											<View style={styles.arrowDownGroup}>
											<Image style={[styles.arrowDownIcon,niftyBankData?.difference>0?{}:{transform: [{ scaleY: -1 }]}]} resizeMode="cover" 
												source={niftyBankData?.difference >0 ?require('../assets/increase.png'):require('../assets/decrease.png')} />
												<Text style={[styles.text24, styles.textClr,niftyBankData?.difference> 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>{niftyBankData?.change} ({niftyBankData?.percent_change})</Text>
											</View>
										</View>
										<Image style={[styles.arrowRightIcon1, styles.arrowPosition1]} resizeMode="cover" source={require('../assets/arrowRight.png')} />
									</View>
								</Pressable>
								<Pressable style={styles.containerLayout} onPress={() => { }}>
									<View style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
										<Text style={[styles.sensex, styles.text23Typo]}>Nifty 50</Text>
										<Text style={[styles.pm, styles.pmLayout]}>{nifty50Data?.time}</Text>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginRight: 16 }}>
										<View style={{ marginRight: 8 }}>
											<Text style={[styles.text23, styles.text23Typo]}>{nifty50Data?.close}</Text>
											<View style={styles.arrowDownGroup}>
											<Image style={[styles.arrowDownIcon,nifty50Data?.difference>0?{}:{transform: [{ scaleY: -1 }]}]} resizeMode="cover" 
												source={nifty50Data?.difference >0 ?require('../assets/increase.png'):require('../assets/decrease.png')} />
												<Text style={[styles.text24, styles.textClr,nifty50Data?.difference> 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>{nifty50Data?.change} ({nifty50Data?.percent_change})</Text>
											</View>
										</View>
										<Image style={[styles.arrowRightIcon1, styles.arrowPosition1]} resizeMode="cover" source={require('../assets/arrowRight.png')} />
									</View>
								</Pressable>
							</View>

						</View>
					</View>
					<View style={[styles.groupContainer, styles.homeChildPosition]}>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
							<View style={styles.insightsWrapper}>
								<Text style={[styles.insights, styles.textTypo1]}>Insights</Text>
							</View>
							<View style={styles.button1}>
								<View style={styles.baseButton}>
									<Text style={[styles.text5, styles.textTypo]}>View All</Text>
								</View>
							</View>
						</View>
						<View style={styles.frameContainer}>
							<View style={styles.frameView}>
								<View style={styles.frameChild} />
								<View style={[styles.frameParent,{flex:1}]}>
									<View style={{flex:1}}>
										<Text style={[styles.mahindraMahindra, styles.textTypo1]}>{`Mahindra & Mahindra Ltd.`}</Text>
										<Text style={[styles.mcap216321, styles.ipoClr1]}>M.Cap : 2,16,321 Cr.</Text>
									</View>
									<View style={styles.group}>
										<Text style={styles.text6}>2,199.00</Text>
										<View style={[styles.arrowUpParent, styles.arrowPosition1]}>
											<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
											<Text style={[styles.text7, styles.textTypo1,{textAlign:'right'}]}>1.2%</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
						<View style={styles.frameInner}>
							<View style={styles.frameGroup}>
								<View style={styles.arrowDownParent}>
									<View style={{ flexDirection: 'row' }}>
										<View style={[styles.frameItem, styles.menuIconLayout]} />
										<Text style={[styles.whiteMarubozu, styles.textTypo1]}>White Marubozu - Bullish Candle</Text>
									</View>
									<View style={styles.frameParent}>
										<Image style={styles.arrowRightIcon} resizeMode="cover" source={require('../assets/arrowRightGreen.png')} />
									</View>
								</View>
								<Text style={[styles.stockHasFormed, styles.ipoClr]}>Stock has formed a white marubozu spark candle with change in price by 4.57%, indicationg a bullish sentiment</Text>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 16 }}>
								<View style={[styles.baseButton2, styles.baseInsightsFlexBox]}>
									<Text style={[styles.text9, styles.textTypo]}>All Scans in stock</Text>
								</View>
								<View style={[styles.baseButton3, styles.baseInsightsFlexBox]}>
									<Text style={[styles.text9, styles.textTypo]}>Monthly Scans</Text>
								</View>
							</View>
						</View>
						<Image style={[styles.icon, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.icon1, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.icon2, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.icon3, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.lock1Icon, styles.iconLayout]} resizeMode="cover" source={require('../assets/lock.png')} />
						<Image style={[styles.icon4, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.icon5, styles.iconLayout]} resizeMode="cover" source={require('../assets/icon.png')} />
						<Image style={[styles.icon6, styles.iconLayout]} resizeMode="cover" ssource={require('../assets/icon.png')} />
					</View>
					<View style={[styles.homeInner1, styles.homeInner1Layout, { marginTop: 8 }]}>
						<View style={[styles.groupChild8, styles.homeInner1Layout]}>
							<View style={[styles.groupParent4, styles.menuIconPosition]}>
								<View style={styles.chefHatHeartParent}>
									<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/chefHatHeart.png')} />
									<Text style={[styles.edgeReports, styles.textTypo1]}>Edge Reports</Text>
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12,justifyContent:'space-evenly' }}>
									<View style={[styles.groupParent6, styles.groupParentLayout1]}>
										<View style={[styles.groupChild9, styles.groupParentLayout1]}>
											<View style={[styles.menuParent3, styles.menuParent3Layout]}>
												<Image style={styles.menuIcon5} resizeMode="cover" source={require('../assets/caseStudies.png')} />
												<Text style={[styles.concallAnalysis, styles.menuParent3Layout]}>Case Studies</Text>
											</View>
										</View>
									</View>
									<View style={[styles.groupParent6, styles.groupParentLayout1]}>
										<View style={[styles.groupChild9, styles.groupParentLayout1]}>
											<View style={[styles.menuParent3, styles.menuParent3Layout]}>
												<Image style={styles.menuIcon5} resizeMode="cover" source={require('../assets/con_Call_Analysis.png')} />
												<Text style={[styles.concallAnalysis, styles.menuParent3Layout]}>Concall Analysis</Text>
											</View>
										</View>
									</View>
									<View style={[styles.groupParent6, styles.groupParentLayout1]}>
										<View style={[styles.groupChild9, styles.groupParentLayout1]}>
											<View style={[styles.menuParent3, styles.menuParent3Layout]}>
												<Image style={styles.menuIcon5} resizeMode="cover" source={require('../assets/info_Graphics.png')} />
												<Text style={[styles.concallAnalysis, styles.menuParent3Layout]}>Info Graphics</Text>
											</View>
										</View>
									</View>
									<View style={[styles.groupParent6, styles.groupParentLayout1]}>
										<View style={[styles.groupChild9, styles.groupParentLayout1]}>
											<View style={[styles.menuParent3, styles.menuParent3Layout]}>
												<Image style={styles.menuIcon5} resizeMode="cover" source={require('../assets/ipo_Notes.png')} />
												<Text style={[styles.concallAnalysis, styles.menuParent3Layout]}>IPO Notes</Text>
											</View>
										</View>
									</View>
								</View>
								<Text style={[styles.recentReports, styles.companyNameLayout1, { marginTop: 12 }]}>Recent Reports</Text>
								<View style={{marginLeft:16}}>
								<View style={[styles.frameWrapper1, styles.homeInnerPosition, { marginTop: 10 }]}>
									<View style={styles.arrowDownParent}>
										<View>
											<Text style={[styles.companyName, styles.companyNameLayout]}>{`Company Name - Report Name `}</Text>
											<Text style={[styles.concallAnalysis1, styles.companyNameLayout]}>Concall Analysis</Text>
										</View>
										<Image style={styles.lock1Icon1} resizeMode="cover" source={require('../assets/lockFill.png')} />
									</View>
								</View>
								<View style={[styles.frameWrapper1, styles.homeInnerPosition, { marginTop: 10 }]}>
									<View style={styles.arrowDownParent}>
										<View>
											<Text style={[styles.companyName, styles.companyNameLayout]}>{`Company Name - Report Name `}</Text>
											<Text style={[styles.concallAnalysis1, styles.companyNameLayout]}>Info Graphics</Text>
										</View>
										<Image style={styles.lock1Icon1} resizeMode="cover" source={require('../assets/lockFill.png')} />
									</View>
								</View>
								<View style={[styles.frameWrapper1, styles.homeInnerPosition, { marginTop: 10 }]}>
									<View style={styles.arrowDownParent}>
										<View>
											<Text style={[styles.companyName, styles.companyNameLayout]}>{`Company Name - Report Name `}</Text>
											<Text style={[styles.concallAnalysis1, styles.companyNameLayout]}>Case study</Text>
										</View>
										<Image style={styles.lock1Icon1} resizeMode="cover" source={require('../assets/lockFill.png')} />
									</View>
								</View>
								</View>
							</View>
						</View>
					</View>
					<View style={[styles.groupParent9, styles.groupParentLayout, { backgroundColor: "#202020" }]}>
						<Image style={[styles.groupIcon, styles.groupParentLayoutImage]} resizeMode="contain" source={require('./../assets/undrawinvestment.png')} />
						<Image style={[styles.vectorIcon, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon1, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon2, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon3, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon4, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dotVector.png')} />
						<Image style={[styles.vectorIcon5, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon6, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorStem.png')} />
						<Text style={[styles.upgradeToPremium, styles.textPictureTypo]}>Upgrade to premium for powerful insights</Text>
						<View style={[styles.baseButton4, styles.baseFlexBox]}>
							<Text style={[styles.apr2024327, styles.textLayout]}>Go Premium</Text>
						</View>
					</View>
					{/* <View style={[styles.bg, styles.bgLayout]}>
						<View style={styles.highDeliveryScansParent}>
							<Text style={[styles.highDeliveryScans, styles.listPosition]}>High Delivery Scans</Text>
							<Text style={[styles.asOfTue, styles.listPosition]}>As of Tue, 30 APR 2024</Text>
						</View>
						<View style={styles.scansParent}>
							<View style={[styles.scans, styles.scansBorder]}>
								<View style={[styles.tabBar, styles.scansBorder1]}>
									<View style={[styles.tab, styles.tabFlexBox]}>
										<Text style={[styles.text11, styles.textClr]}>Quantity</Text>
									</View>
									<View style={[styles.tab1, styles.tabFlexBox]}>
										<Text style={[styles.text12, styles.text12Clr]}>Percentage</Text>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={styles.companyTypo}>Company name</Text>
											<Text style={[styles.x, styles.ipoClr]}>16x</Text>
										</View>
									</View>
								</View>
							</View>
						</View>

					</View>
					<View style={[styles.bg1, styles.bgLayout]}>
						<View style={styles.highDeliveryScansParent}>
							<Text style={[styles.futureOpenIntrest, styles.listPosition]}>Future Open Intrest Scans</Text>
							<Text style={[styles.asOfTue, styles.listPosition]}>As of Tue, 30 APR 2024</Text>
						</View>
						<View style={styles.scansParent}>
							<View style={[styles.scans, styles.scansBorder]}>
								<View style={[styles.tabBar, styles.scansBorder1]}>
									<View style={[styles.tab, styles.tabFlexBox]}>
										<Text style={[styles.text11, styles.textClr]}>{`Increase in OI `}</Text>
									</View>
									<View style={[styles.tab1, styles.tabFlexBox]}>
										<Text style={[styles.text12, styles.text12Clr]}>Decrease in OI</Text>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[ styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[ styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[ styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
								<View style={[styles.list, styles.listPosition]}>
									<View style={[styles.baseDorpdownItem, styles.baseItemLayout]}>
										<View style={[styles.checkbox, styles.checkboxPosition]} />
										<View style={[styles.tickSquare, styles.checkboxPosition]} />
										<View style={styles.companyNameParent}>
											<Text style={[ styles.companyTypo]}>Company name</Text>
											<View style={styles.arrowUpGroup}>
												<Image style={styles.arrowDownIcon} resizeMode="cover" source={require('../assets/upArrow.png')} />
												<Text style={[styles.text7, styles.textTypo1]}>1.2%</Text>
											</View>
										</View>
									</View>
								</View>
							</View>
						</View>
					</View>
					<View style={[styles.groupParent12, styles.groupParentLayout]}>
						<View style={[styles.groupIcon]}>
							<View style={[styles.groupChild14, styles.groupParentLayout]} />
						</View>
						<Image style={[styles.vectorIcon, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon1, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dashVector.png')} />
						<Image style={[styles.vectorIcon2, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon3, styles.vectorIconLayout]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon4, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/dotVector.png')} />
						<Image style={[styles.vectorIcon5, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorArrow.png')} />
						<Image style={[styles.vectorIcon6, styles.vectorIconLayout1]} resizeMode="cover" source={require('./../assets/vectorStem.png')} />
						<Text style={[styles.upgradeToPremium, styles.textPictureTypo]}>Share your experience with your friends.</Text>
						<View style={[styles.baseButton4, styles.baseFlexBox]}>
							<Text style={[styles.apr2024327, styles.textLayout]}>Share</Text>
						</View>
						<Image style={styles.undrawShareLinkRe54rx2Icon} resizeMode="contain" source={require('./../assets/share.png')} />
					</View> */}
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
	homeChildPosition: {
		width: '100%',
		marginTop: 12
	},
	groupChildBorder: {
		borderWidth: 1,
		borderStyle: "solid",
		borderRadius: 8,
	},
	textTypo4: {
		fontWeight: "500",
		fontFamily: "NotoSans-Medium"
	},
	mTypo: {
		width: 20,
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 12,
		fontSize: 12,
	},
	textLayout: {
		lineHeight: 20,
		fontSize: 14,
		marginTop: 4,
	},
	text2Typo: {
		lineHeight: 20,
		fontSize: 14,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
	},
	groupLayout1: {
		height: 5,
		borderRadius: 1000,
	},
	advancesTypo: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		color: "#fff",
		fontSize: 14,
	},
	textTypo1: {
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	text28: {
		color: "#eb856b",
		fontFamily: "NotoSans-Medium",
		textAlign: "center",
		lineHeight: 20,
		fontSize: 14,
		fontWeight: "500",
	},
	text29: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 20,
		fontSize: 14,
	},
	textClr1: {
		color: "#eb856b",
		textAlign: "center",
	},
	homeInnerPosition: {
		marginTop: 8,
		padding: 16,
	},
	centerTypo: {
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	ipoClr1: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		fontSize: 12,
		textAlign: "left",
		letterSpacing: 0,
	},
	ipoClr: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		fontSize: 12,
		textAlign: "left",
		letterSpacing: 0,
		marginLeft: 8,
	},
	textTypo: {
		color: "#0158aa",
		lineHeight: 16,
		textAlign: "center",
		fontWeight: "700",
		fontSize: 12
	},
	arrowPosition1: {
		height: 16,
	},
	menuIconLayout: {
		height: 24,
		width: 24
	},
	baseFlexBox: {
		paddingVertical: 8,
		justifyContent: "center",
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		position: "absolute",
		overflow: "hidden"
	},
	baseInsightsFlexBox: {
		paddingVertical: 8,
		justifyContent: "center",
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden"
	},

	iconLayout: {
		height: 4,
		width: 4,
		top: 335,
		position: "absolute"
	},
	groupLayout: {
		width: '100%',
	},
	groupExploreLayout: {
		width: '100%',
		paddingBottom: 16,
	},
	groupParentLayout2: {
		width: 78,
		height: 82,
	},
	ipoParentLayout: {
		width: 58,
	},
	homeInner1Layout: {
		height: 419,
		width: '100%',
	},
	groupParentLayout1: {
		height: 77,
		width: 78,
	},
	menuParentLayout: {
		height: 58,
		top: 11
	},
	caseStudiesTypo: {
		height: 30,
		top: 28,
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
		left: 0
	},
	menuParent3Layout: {
		width: 67,
	},
	companyNameLayout1: {
		lineHeight: 18,
		fontSize: 14
	},
	companyNameLayout: {
		color: "#445164",
		textAlign: "left"
	},
	bgLayout: {
		height: 422,
		backgroundColor: "#fff",
		width: '100%',
		marginTop: 12
	},
	scansBorder: {
		borderColor: "#e7e7e7",
		backgroundColor: "#fff",
		width: '90%',
		borderWidth: 1,
		borderStyle: "solid",
	},
	scansBorder1: {
		borderColor: "#e7e7e7",
		backgroundColor: "#fff",
		width: '100%',
		borderWidth: 1,
		borderStyle: "solid",
	},
	tabFlexBox: {
		paddingVertical: 10,
		paddingHorizontal: 8,
		justifyContent: "center",
		alignItems: "center",
		borderStyle: "solid",
		flexDirection: "row",
		flex: 1
	},
	textClr: {
		color: "#189877",
		textAlign: "center"
	},
	text12Clr: {
		color: "#697483",
		fontFamily: "NotoSans-Regular"
	},
	baseItemLayout: {
		height: 48,
		backgroundColor: "#fff"
	},
	checkboxPosition: {
		display: "none",
		height: 20,
		width: 20,
	},
	companyTypo: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		fontSize: 14,
		textAlign: "left"
	},
	arrowPosition: {
		left: 295,
		height: 16,
		flexDirection: "row",
		position: "absolute"
	},
	groupParentLayout: {
		height: 208,
		width: '100%',
		marginTop: 12
	},
	groupParentLayoutImage: {
		height: 208,
		alignSelf: 'flex-end'
	},
	vectorIconLayout1: {
		opacity: 0.2,
		maxHeight: "100%",
		maxWidth: "100%",
		position: "absolute",
		overflow: "hidden"
	},
	vectorIconLayout: {
		opacity: 0.3,
		width: "1.15%",
		height: "6.44%",
		maxHeight: "100%",
		maxWidth: "100%",
		position: "absolute",
		overflow: "hidden"
	},
	text23Typo: {
		fontSize: 16,
	},
	textPictureTypo: {
		fontSize: 16,
		position: "absolute"
	},
	pmLayout: {
		lineHeight: 12,
		fontSize: 12
	},
	containerLayout: {
		height: 72,
		borderColor: "#dadce0",
		borderRadius: 8,
		width: '100%',
		borderWidth: 1,
		borderStyle: "solid",
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16
	},
	parentPosition: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 2,
	},
	arrowIconPosition: {
		width: 16,
		height: 16,
		marginLeft: 8
	},
	iconPosition: {
		top: 51,
		height: 24,
		width: 24,
		position: "absolute"
	},
	homeChild: {
		height: 360,
		top: 0
	},
	label: {
		width: 20,
		textAlign: "center",
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		lineHeight: 12,
		fontSize: 12
	},
	baseBadge: {
		width: 40,
		borderRadius: 50,
		borderColor: "#fff",
		paddingVertical: 4,
		alignItems: "center",
	},
	badge: {
		flexDirection: "row",
	},
	y: {
		width: 16,
		textAlign: "left",
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 12,
		fontSize: 12,
	},
	apr2024327: {
		textAlign: "center",
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	apr202432: {
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	text: {
		fontSize: 24,
		lineHeight: 32,
		marginLeft: 17,
		color: "#fff",
		fontFamily: "NotoSans-Medium"
	},
	arrowDownIcon: {
		height: 12,
		width: 12
	},
	text1: {
		color: "#74c1ad",
		textAlign: "center",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	arrowDownParent: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: 'space-between'
	},
	parent: {
		marginTop: 4
	},

	mReturns: {
		marginLeft: 17,
		color: "#fff"
	},
	text2: {
		color: "#74c1ad"
	},
	groupChild: {
		backgroundColor: "#74c1ad",
		width: '50%',
	},
	groupItem: {
		backgroundColor: "#e45d3a",
		width: '50%',
		height: 5,
		borderRadius: 1000,
	},
	groupInner: {
		backgroundColor: "#1b2533",
		width: 2,
		height: 11,
	},
	rectangleParent: {
		alignItems: 'center',
		height: 11,
		flexDirection: 'row',
		width: 'auto',
		margin: 16
	},
	advances: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
	},
	declines: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16
	},
	text3: {
		lineHeight: 24,
		fontSize: 20,
		fontWeight: "600",
		color: "#74c1ad",
		textAlign: "center",
	},
	text4: {
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		lineHeight: 24,
		fontSize: 20,
	},
	nifty50: {
		lineHeight: 24,
		fontSize: 20,
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		marginLeft:16
	},
	latestNews: {
		fontWeight: "700",
		fontFamily: "NotoSans-Bold",
		color: "#242f3e",
	},
	rectangleView: {
		borderColor: "#d8d8d8",
		width: '100%',
		backgroundColor: "#fff",
		paddingBottom:8,
	},
	rectangleIcon: {
		width: '100%',
		height:100
	},
	centerReceivesSeven: {
		width: '95%',
		textAlign: "left",
		color: "#323e4f",
		letterSpacing: 0,
		fontWeight: "600",
		fontSize: 14,
		marginLeft: 8,
		marginTop: 4
	},
	centerRecievesFor: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		fontSize: 12,
		width: '95%',
	},
	groupParent: {
		flexDirection: "row",
		justifyContent: 'space-between'
	},
	frameWrapper: {
		marginTop: 8,
	},
	text5: {
		fontFamily: "NotoSans-Medium"
	},
	baseButton: {
		justifyContent: "center",
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden"
	},
	button: {
		flexDirection: "row",
	},
	homeInner: {
		backgroundColor: "#fff",
	},
	insights: {
		color: "#1b2533",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left",
	},
	insightsWrapper: {
		width: 56,
		height: 20,
		marginTop: 16,
		marginLeft: 16,
	},
	frameChild: {
		backgroundColor: "#eaeaea",
		width: 50,
		height: 50,
		borderRadius: 8,
		marginLeft: 16
	},
	mahindraMahindra: {
		color: "#242f3e",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left"
	},
	mcap216321: {
		lineHeight: 16,
		marginTop: 4,
		textAlign: "left",
		fontSize: 12
	},
	text6: {
		fontSize: 18,
		lineHeight: 28,
		color: "#242f3e",
		fontFamily: "NotoSans-Regular",
		textAlign: "right",
		marginRight:16
	},
	text7: {
		color: "#16896b",
		lineHeight: 16,
		marginLeft: 4,
		textAlign: "center",
		fontSize: 12
	},
	arrowUpParent: {
		flexDirection: "row",
		justifyContent:'flex-end',
		marginRight:16
	},
	group: {
		height: 44,
		//marginLeft: 19,
		flex:1,
		justifyContent:'flex-end'
	},
	frameParent: {
		marginLeft: 8,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: 'space-between'
	},
	frameView: {
		marginTop: 16,
		marginLeft: 16,
		alignItems: "center",
		flexDirection: "row",
	},
	frameContainer: {
		paddingBottom:16,
		borderColor: "#dadce0",
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
		marginTop: 12,
		backgroundColor: "#fff",
		width: '90%',
		marginLeft: 16,
		borderWidth: 1,
		borderStyle: "solid",
	},
	frameItem: {
		backgroundColor: "#ebebeb",
		marginLeft: 16,
		marginRight: 8
	},
	whiteMarubozu: {
		color: "#323e4f",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left",
	},
	arrowRightIcon: {
		height: 16,
		width: 16
	},
	stockHasFormed: {
		marginTop: 16,
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left"
	},
	frameGroup: {
		marginTop: 15,
	},
	frameInner: {
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderRightWidth: 1,
		borderLeftWidth: 1,
		height: 188,
		borderBottomWidth: 1,
		borderColor: "#dadce0",
		width: '90%',
		marginLeft: 16,
		borderStyle: "solid",
	},
	button1: {
		marginTop: 16,
		marginRight: 16,
		flexDirection: "row",
	},
	text9: {
		fontFamily: "Inter-Medium"
	},
	baseButton2: {
		paddingHorizontal: 12,
		borderColor: "#0158aa",
		paddingVertical: 8,
		borderWidth: 1,
		borderStyle: "solid",
		width: '45%'
	},
	baseButton3: {
		paddingHorizontal: 12,
		borderColor: "#0158aa",
		paddingVertical: 8,
		borderWidth: 1,
		borderStyle: "solid",
		width: '45%'
	},
	icon: {
		left: 166
	},
	icon1: {
		left: 174
	},
	icon2: {
		left: 182
	},
	icon3: {
		left: 190
	},
	lock1Icon: {
		left: 198
	},
	icon4: {
		left: 206
	},
	icon5: {
		left: 214
	},
	icon6: {
		left: 222
	},
	groupContainer: {
		height: 355,
		backgroundColor: "#fff"
	},
	groupChild3: {
		backgroundColor: "#fff",
	},
	explore: {
		marginLeft: 17,
		color: "#1b2533",
		marginTop: 16,
		lineHeight: 20,
		fontSize: 14,
	},
	menuIcon: {
		marginLeft: 17,
	},
	fiiDii: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
		marginLeft: 16
	},
	menuParent: {
		height: 59,
		width: 58,
		marginTop: 12,
		alignItems: 'center',
		justifyContent: 'center'

	},
	groupChild4: {
		borderColor: "#eaecf0",
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: "solid",
	},
	groupParent1: {
		width: 78,
		marginTop: 12
	},
	deals: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
	},
	menuGroup: {
		height: 51,
		width: 58,
		left: 10,
		top: 12,
	},
	groupPressable: {
		width: 78
	},
	ipo: {
		top: 39,
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
		left: 0
	},
	menuContainer: {
		height: 55,
		left: 10,
		width: 58,
		top: 12
	},
	groupParent2: {
		width: 78
	},
	groupParent3: {
		width: 78,
	},

	groupChild8: {
		backgroundColor: "#fff",
	},
	menuIcon4: {
		height: 23,
		width: 24,
		top: 0
	},
	caseStudies: {
		width: 58,
		position: "absolute"
	},
	menuParent2: {
		width: 58,
	},
	groupChild9: {
		borderColor: "#eaecf0",
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: "solid",
	},
	groupParent5: {
		top: 34,
		height: 77,
		left: 0
	},
	menuIcon5: {
		left: 21,
		height: 22,
		width: 24,
	},
	concallAnalysis: {
		height: 30,
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
	},
	menuParent3: {
		marginLeft: 6,
		height: 58,
		marginTop: 11
	},
	groupParent6: {
		height: 77,
	},
	groupParent7: {
		top: 34,
		height: 77
	},
	ipoNotes: {
		top: 36,
		height: 15,
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		textAlign: "center",
		fontSize: 12,
		left: 0
	},
	menuParent5: {
		height: 51,
		width: 58,
	},
	groupParent8: {
		top: 34,
		height: 77
	},
	edgeReports: {
		height: 18,
		marginLeft: 8,
		color: "#1b2533",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left"
	},
	chefHatHeartParent: {
		alignItems: "center",
		flexDirection: "row",
		marginTop: 16,
		marginLeft:16
	},
	recentReports: {
		color: "#1b2533",
		fontFamily: "NotoSans-Regular",
		textAlign: "left",
		marginLeft:16
	},
	companyName: {
		lineHeight: 18,
		fontSize: 14,
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600"
	},
	concallAnalysis1: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		marginTop: 4,
		fontSize: 12
	},
	lock1Icon1: {
		height: 16,
		width: 16
	},
	frameWrapper1: {
		borderColor: "#eaecf0",
		borderRadius: 8,
		width: '95%',
		borderWidth: 1,
		borderStyle: "solid",
	},
	frameWrapper2: {
		borderColor: "#eaecf0",
		borderRadius: 8,
		width: 390,
		borderWidth: 1,
		borderStyle: "solid",
		overflow: "hidden"
	},
	frameWrapper3: {
		borderColor: "#eaecf0",
		borderRadius: 8,
		width: 390,
		borderWidth: 1,
		borderStyle: "solid",
		overflow: "hidden"
	},
	groupParent4: {
		height: 387,
		width: '100%'
	},
	text11: {
		lineHeight: 20,
		fontSize: 14,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	tab: {
		borderColor: "#189877",
		borderBottomWidth: 1.5
	},
	text12: {
		textAlign: "center",
		lineHeight: 20,
		fontSize: 14
	},
	tab1: {
		borderColor: "#eaecf0",
		borderBottomWidth: 1
	},
	tabBar: {
		height: 40,
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
		borderColor: "#e7e7e7",
		flexDirection: "row"
	},
	checkbox: {
		alignItems: "center"
	},
	x: {
		marginLeft: 199,
		lineHeight: 16,
		textAlign: "center",
		fontSize: 14,
		color: "#445164"
	},
	companyNameParent: {
		marginTop: 16,
		marginLeft: 16,
		flexDirection: "row",
		justifyContent: 'space-between'
	},
	baseDorpdownItem: {
		width: '90%'
	},
	scans: {
		height: 334,
		borderRadius: 8
	},
	baseDorpdownItem4: {
		width: 350
	},
	scansParent: {
		marginTop: 30,
		height: 334,
		width: '100%',
		marginLeft: 16,
	},
	highDeliveryScans: {
		height: 18,
		color: "#1b2533",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left",
	},
	asOfTue: {
		color: "#697483",
		fontFamily: "NotoSans-Regular",
		height: 18,
		lineHeight: 16,
		textAlign: "left",
		fontSize: 12
	},
	highDeliveryScansParent: {
		width: '100%',
		height: 18,
		marginTop: 16,
		marginLeft: 16,
	},
	arrowUpGroup: {
		height: 16,
		flexDirection: "row",
	},
	companyNameParent4: {
		marginTop: 16,
		marginleft: 16,
		flexDirection: "row",
	},
	arrowUpContainer: {
		top: 16
	},
	arrowUpParent2: {
		top: 15
	},
	futureOpenIntrest: {
		height: 18,
		color: "#1b2533",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		lineHeight: 20,
		fontSize: 14,
		textAlign: "left",
	},
	vectorIcon: {
		top: "9.62%",
		bottom: "89.66%",
		left: "16.28%",
		right: "78.42%",
		opacity: 0.2,
		width: "5.29%",
		height: "0.72%"
	},
	vectorIcon1: {
		bottom: "93.99%",
		top: "5.29%",
		left: "16.28%",
		right: "78.42%",
		opacity: 0.2,
		width: "5.29%",
		height: "0.72%"
	},
	vectorIcon2: {
		top: "84.62%",
		right: "78.75%",
		bottom: "8.94%",
		left: "20.1%"
	},
	vectorIcon3: {
		right: "95.04%",
		bottom: "88.27%",
		left: "3.82%",
		top: "5.29%"
	},
	vectorIcon4: {
		height: "3.89%",
		width: "2.11%",
		top: "84.13%",
		right: "56.16%",
		bottom: "11.97%",
		left: "41.73%"
	},
	vectorIcon5: {
		top: "8.65%",
		right: "6.16%",
		bottom: "90.63%",
		left: "88.55%",
		width: "5.29%",
		opacity: 0.2,
		height: "0.72%"
	},
	vectorIcon6: {
		height: "15.91%",
		width: "4.89%",
		top: "81.25%",
		right: "93.84%",
		bottom: "2.84%",
		left: "1.27%"
	},
	upgradeToPremium: {
		marginTop: 49,
		lineHeight: 23,
		fontFamily: "MagistralCondW08-Medium",
		width: 159,
		marginLeft: 16,
		textAlign: "left",
		color: "#fff"
	},
	baseButton4: {
		marginTop: 119,
		backgroundColor: "#0158aa",
		width: 125,
		paddingHorizontal: 20,
		left: 16
	},

	groupParent10: {
		top: 2215
	},
	indices: {
		color: "#1b2533",
		textAlign: "center",
		lineHeight: 20,
		fontSize: 14,
	},
	indicesWrapper: {
		height: 20,
	},
	text23: {
		marginLeft: 16,
		color: "#323e4f",
		lineHeight: 24,
		textAlign: "center",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	text24: {
		fontFamily: "NotoSans-Regular",
		lineHeight: 16,
		marginLeft: 4,
		fontSize: 12
	},
	arrowDownGroup: {
		alignItems: "center",
		flexDirection: "row",
	},
	sensex: {
		color: "#445164",
		fontFamily: "NotoSans-Regular",
		lineHeight: 24,
		textAlign: "center",
		marginLeft: 16
	},
	pm: {
		color: "#8f97a2",
		fontFamily: "NotoSans-Regular",
		textAlign: "center",
		marginLeft: 16,
	},
	arrowRightIcon1: {
		width: 16
	},
	homeInner2: {
		marginTop: 12,
		backgroundColor: "#fff"
	},
	groupChild14: {
		backgroundColor: "#202020",
		top: 0
	},
	undrawShareLinkRe54rx2Icon: {
		marginTop: 50,
		left: 196,
		height: 118,
		width: 173,
		position: "absolute",
		overflow: "hidden"
	},
	nifty502232476: {
		fontFamily: "NotoSans-Regular",
		textAlign: "center",
		color: "#fff",
	},
	menuIcon8: {
		top: 50,
		height: 24,
		left: 16,
		position: "absolute"
	},
	home: {
		backgroundColor: "#dadce0",
		overflow: "hidden",
		width: "100%",
		flex: 1
	}
});

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
  });
  
  const ActionCreators = Object.assign({}, authAction);
  const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators(ActionCreators, dispatch),
  });
  export default connect(mapStateToProps, mapDispatchToProps)(DashboardScreen);
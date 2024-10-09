import React, { useState, useEffect, useContext, useMemo,useCallback, memo } from "react";
import {
	Image, ScrollView, StyleSheet, Text, TextInput,
	TouchableOpacity, View, Pressable, ActivityIndicator, Modal,
	Dimensions,
	TouchableHighlight,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	TouchableWithoutFeedback,
	RefreshControl
} from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { del, get, post, put } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import moment from "moment";
import { formatNumber, formatTimestamp } from "../../services/helpers";
import { LineChart } from "react-native-chart-kit";
import { BrokerTypes, TrickMode } from "../../constants/appConstants";
import Tooltip from "react-native-walkthrough-tooltip";
import { WebSocketContext } from "../../components/WebSocketProvider";

const { width: screenWidth } = Dimensions.get('window');

const CreateTrick = (props) => {
	const { nseStockDetails, bseStockDetails } = useContext(WebSocketContext)||{};
	const { userInfo } = props;
	const { userDetails } = userInfo;
	const stock = props?.route?.params?.stock;
	const item = props?.route?.params?.item;
	const { control, handleSubmit, formState: { errors }, setError, watch, reset, setValue, clearErrors,getValues,trigger} = useForm({mode:'all'});
	const [levels, setLevels] = useState([]);
	const [subPercents, setSubPercents] = useState([]);
	const [selectedOption, setSelectedOption] = useState(TrickMode.CYCLE);
	const [isLiveMode, setIsLiveMode] = useState(true);
	const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
	const [brokers, setBrokers] = useState([]);
	const [selectedBroker, setSelectedBroker] = useState(null);
	const [selectedBrokerType, setSelectedBrokerType] = useState();
	const [loading, setLoading] = useState(false);
	const [levelsLoading, setLevelsLoading] = useState(false);
	const noOfLevel = watch("noOfLevel", 0);
	const averageUpto = watch("averageUpto", 0);
	const [showModal, setShowModal] = useState(false);
	const [levelIds, setLevelIds] = useState([]);
	const [indicesData, setIndicesData] = useState();
	const [selectedPeriod, setSelectedPeriod] = useState('1M');
	const periods = ['1M', '3M', '6M', '1Y'];
	const [returns, setReturns] = useState();
	const [graph, setGraph] = useState([]);
	const [totalAmountNeeded, setTotalAmountNeeded] = useState(0); 
	const [refreshing,setRefreshing] = useState(false);
	const [isGraphDataAvailable, setIsGraphDataAvailable] = useState(false);
	const [APICalled, setAPICalled] = useState(false);

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
	useEffect(() => {
		let symbol = stock?.symbol || item?.symbol;
		let exchange = stock?.exchange || item?.exchange;
		if (APICalled) {
			return;
		}
		if (exchange === 'NSE') {
			getNSEStockDetailsBySymbol(symbol);
		} else {
			getBSEStockDetailsBySymbol(symbol);
		}
	}, [stock, item,nseStockDetails,bseStockDetails]);
			

	useEffect(() => {
		if(noOfLevel && averageUpto){
		trigger('averageUpto');
		}
	  }, [noOfLevel]);
	const [tooltips, setTooltips] = useState({
		trickMode: false,
		noOfLevel: false,
		averageUpto: false,
		takeProfit: false,
		buyPrice: false,
		sellProfit: false,
		subPositionTakeProfit: false,
	});

	const closeModal = () => {
		setShowModal(false);
		props.navigation.navigate('AutoInvest');
	};
	const [message, setMessage] = useState('');
	const dataGraph = useMemo(() => 
		graph?.map(graphData => ({
		  datasets: [
			{
			  data: graphData,
			  color: () => `#ffffff`,
			  strokeWidth: 2,
			}
		  ],
		})), [graph]);
	const getGraph = (data) => {
		const sortByDatetime = (data) => {
			return data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
		};
		let dataForGraph = [];
		if(data){
			if(data['1day']?.values?.length>0 && data['1week']?.values?.length>0 && data['1month']?.values?.length>0){
		const oneMonth = sortByDatetime(data['1day']?.values)?.slice(0, 24)?.map(item => parseFloat(item.close));
		const threeMonths = sortByDatetime(data['1week']?.values)?.slice(0, 12)?.map(item => parseFloat(item.close));
		const sixMonths = sortByDatetime(data['1week']?.values)?.slice(0, 24)?.map(item => parseFloat(item.close));
		const oneYear = sortByDatetime(data['1month']?.values)?.slice(0, 12)?.map(item => parseFloat(item.close));
		dataForGraph = [oneMonth, threeMonths, sixMonths, oneYear];
		setGraph(dataForGraph);
			}
		}
	};
	const getNSEStockDetailsBySymbol =(symbol)=> {
		const companyDetails = nseStockDetails?.find((stock) => stock.symbol === symbol);
		if(companyDetails?.data){
			const formattedData = {
				name: companyDetails?.data?.currentDetails?.name,
				dateTime: moment(companyDetails?.data?.updatedOn)?.format("DD MMM YYYY, hh:mm A"),
				close: formatNumber(companyDetails?.data?.currentDetails?.close),
				unformattedClose: companyDetails?.data?.currentDetails?.close,
				change: parseFloat(companyDetails?.data?.currentDetails?.change).toFixed(2),
				percent_change: parseFloat(companyDetails?.data?.currentDetails.percent_change).toFixed(2) + "%",
				difference: companyDetails.data?.currentDetails?.close - companyDetails?.data?.currentDetails?.previous_close,
			};
			setIndicesData(formattedData);
			if(companyDetails.data?.intervalList && companyDetails.data?.historyDetails){
				setIsGraphDataAvailable(true);
				getGraph(companyDetails?.data?.intervalList);
				getReturns(companyDetails?.data)
			}
		}
		else {
			getCompanyDetails(symbol,'NSE');
		}
	};
	const getBSEStockDetailsBySymbol =(symbol)=> {
		const companyDetails = bseStockDetails?.find((stock) => stock.symbol === symbol);
		if(companyDetails?.data){
			const formattedData = {
				name: companyDetails?.data?.currentDetails?.name,
				dateTime: moment(companyDetails?.data?.updatedOn)?.format("DD MMM YYYY, hh:mm A"),
				close: formatNumber(companyDetails?.data?.currentDetails?.close),
				unformattedClose: companyDetails?.data?.currentDetails?.close,
				change: parseFloat(companyDetails?.data?.currentDetails?.change).toFixed(2),
				percent_change: parseFloat(companyDetails?.data?.currentDetails.percent_change).toFixed(2) + "%",
				difference: companyDetails.data?.currentDetails?.close - companyDetails?.data?.currentDetails?.previous_close,
			};
			setIndicesData(formattedData);
			if(companyDetails.data?.intervalList && companyDetails.data?.historyDetails){
				setIsGraphDataAvailable(true);
				getGraph(companyDetails?.data?.intervalList);
				getReturns(companyDetails?.data)
			}
		}
		else {
			getCompanyDetails(symbol,'BSE');
		}
	};
	const handleRefresh = () =>{
		setRefreshing(true);
		fetchData();
	}

	useEffect(() => {
		const levelCount = parseInt(noOfLevel || 0);
		const newLevels = Array.from({ length: levelCount }, (_, index) => ({
			level: index + 1,
			quantity: 0
		}));
		setLevels(newLevels);

		if (parseInt(noOfLevel) >= 5) {
			const newSubPercents = Array.from({ length: levelCount - 4 }, (_, index) => index + 5);
			setSubPercents(newSubPercents);
		} else {
			setSubPercents([]);
		}
	}, [noOfLevel]);

	useEffect(() => {
		if (item) {
			fetchLevelSettings(item.id);
			setSelectedOption(item.trick_mode);
			setIsLiveMode(item.is_live);
			setSelectedBrokerType(item.broker);
			if(item.is_live){
			setSelectedBroker(item.broker === 1 ? 'Alice Blue' : 'Angel');
			}
			setIsStopLossEnabled(item.stop_loss);
			if (item.stop_loss) {
				setValue('stopLossPercentage', item.stop_loss_percentage);
			}
			setValue('noOfLevel', item.buying_level.toString());
			setValue('averageUpto', item.average_upto.toString());
			setValue('takeProfit', item.take_profit);
			setValue('sellProfitBounce', item.sell_profit_bounce_back);
			setValue('buyPrice', item.buy_price_bounce_back);
			item.buying_level > 4 && setValue('subPositionTakeProfit', item.sub_position_take_profit_callback);
		}
	}, []);

	useEffect(() => {
		getBrokerListForUser();
	}, []);

	const getBrokerListForUser = () => {
		// Fetch broker connection status for Alice Blue
		get(urlConstants.getBrokerAccountStatus, userDetails?.token)
			.then(res => {
				if (res.brokerConnectionStatus) {
					res.brokerConnectionStatus.forEach(broker => {
						if (broker.type === BrokerTypes.ALICE_BLUE) {
							setBrokers(prevBrokers => [...prevBrokers, 'Alice Blue']);
						}
					});
				}
			})
			.catch(err => console.log('Alice Blue fetch error:', err));
	
		// Fetch broker connection status for Angel One
		get(urlConstants.getAngelOneAccountStatus, userDetails?.token)
			.then(res => {
				if (res.brokerConnectionStatus) {
					res.brokerConnectionStatus.forEach(broker => {
						if (broker.type === BrokerTypes.ANGEL_ONE) {
							setBrokers(prevBrokers => [...prevBrokers, 'Angel']);
						}
					});
				}
			})
			.catch(err => console.log('Angel fetch error:', err));
	};

	const getCompanyDetails = (symbol,exchange) => {
        get(`${urlConstants.dealsCompanyDetails}symbol=${symbol}&exchange=${exchange}`)
			.then(async (res) => {
				setAPICalled(true);
				const formattedData = {
					name: res?.currentDetails?.name,
					dateTime:moment(res?.updatedOn).format("DD MMM YYYY, hh:mm A"),
					close: formatNumber(res?.currentDetails?.close),
					unformattedClose: res?.currentDetails?.close,	
					change: parseFloat(res?.currentDetails?.change).toFixed(2),
					percent_change: parseFloat(res?.currentDetails?.percent_change).toFixed(2) + "%",
					difference: res?.currentDetails?.close - res?.currentDetails?.previous_close,
				};
				setIndicesData(formattedData);
				if(res.intervalList && res.historyDetails){
					setIsGraphDataAvailable(true);
					getGraph(res?.intervalList);
					getReturns(res)
				}
				else{
					setIsGraphDataAvailable(false);
					await get(`${urlConstants.companyFullDetails}symbol=${symbol}&exchange=${exchange}`)
					.then((res) => {
						if(res.intervalList){
						setIsGraphDataAvailable(true);
						getGraph(res?.intervalList);
						}
						if(res.historyDetails){
						getReturns(res)
						}
					})
					.catch(err => console.log('fullDetails',err))
				}
			})
			.catch(err => console.log(err))
	};

	const calculateReturns = (currentPrice, previousPrice) => {
		if (!previousPrice || previousPrice === 0) {
			return 
		}
		return parseFloat(((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2);
	};

	const getReturns = (data) => {
		const formattedData = {
			'1M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[0]?.closePrice),
			'3M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[1]?.closePrice),
			'6M': calculateReturns(data?.currentDetails?.close, data?.historyDetails[2]?.closePrice),
			'1Y': calculateReturns(data?.currentDetails?.close, data?.historyDetails[3]?.closePrice),
		};
		if (data?.historyDetails[0]?.closePrice) {
			formattedData['1M'] = calculateReturns(data?.currentDetails?.close, data?.historyDetails[0]?.closePrice);
		}
		if (data?.historyDetails[1]?.closePrice) {
			formattedData['3M'] = calculateReturns(data?.currentDetails?.close, data?.historyDetails[1]?.closePrice);
		}
		if (data?.historyDetails[2]?.closePrice) {
			formattedData['6M'] = calculateReturns(data?.currentDetails?.close, data?.historyDetails[2]?.closePrice);
		}
		if (data?.historyDetails[3]?.closePrice) {
			formattedData['1Y'] = calculateReturns(data?.currentDetails?.close, data?.historyDetails[3]?.closePrice);
		}
		if (Object.keys(formattedData).length > 0) {
			setReturns(formattedData);
		}
	};

	const fetchLevelSettings = async (itemId) => {
		setLevelsLoading(true);
		try {
			const response = await get(urlConstants.getLevelSettingForTrick + itemId,userDetails?.token);
			const data = response;
			populateForm(data);
			setLevelsLoading(false);
		} catch (error) {
			setLevelsLoading(false);
			console.log('Failed to fetch level settings:', error);
		}
	};
	const populateForm = (levelSettings) => {
		let ids = levelSettings.map(setting => setting.id);
		setLevelIds(ids);
		levelSettings.forEach(setting => {
			setValue(`level-${setting.level_number}-quantity`, setting.level_percentage.toString());
			setValue(`quantity-${setting.level_number}`, setting.quantity.toString());
			if (setting.level_number >= 5) {
				setValue(`subPercent-${setting.level_number}`, setting.sub_position_take_profit_callback.toString());
			}
		});
	};

	const onSubmit = (data) => {
		if (item) {
			editTrick(data);
			return;
		}
		if (!selectedBroker && isLiveMode) {
			setError('broker', {
				type: 'manual',
				message: brokers.length > 0 ? 'Please choose a broker' : 'Please connect to a broker account',
			});
			return;
		}
		setLoading(true);
		const levelCount = parseInt(data.noOfLevel || 0);
		const levelData = [];

		for (let i = 1; i <= levelCount; i++) {
			const quantityKey = `quantity-${i}`;
			const levelQuantityKey = `level-${i}-quantity`;
			const subPercentKey = i > 4 ? data[`subPercent-${i}`] : null;

			levelData.push({
				level_number: i,
				quantity: Number(data[quantityKey]),
				level_percentage: data[levelQuantityKey],
				sub_position_take_profit_callback: subPercentKey
			});
		}
		const params = {
			"trick_mode": selectedOption,
			"buying_level": parseInt(data.noOfLevel),
			"average_upto": parseInt(data.averageUpto),
			"take_profit": parseFloat(data.takeProfit),
			"sell_profit_bounce_back": parseFloat(data.sellProfitBounce),
			"buy_price_bounce_back": parseFloat(data.buyPrice),
			"sub_position_take_profit_callback": noOfLevel>4?parseFloat(data.subPositionTakeProfit):null,
			"stop_loss": isStopLossEnabled,
			"stop_loss_percentage": parseFloat(data.stopLossPercentage) || 0,
			"broker": isLiveMode?selectedBrokerType:BrokerTypes.TEST_BROKER,
			"is_live": isLiveMode,
			"symbol": stock.symbol,
			"current_price": parseFloat(indicesData.unformattedClose),
			"exchange":stock.exchange
		}
		post(urlConstants.addAutoInvestmentTrick, params,userDetails?.token)
			.then(res => {
				callApiForLevelSettings(levelData, res.id);
			})
			.catch(err => {
				setLoading(false);
				console.log('levels err',err);
				setMessage(err);
				setShowModal(true);
			})
	};

	const editTrick = (data) => {
		if (!selectedBroker && isLiveMode) {
			setError('broker', {
				type: 'manual',
				message: 'Please choose a broker',
			});
			return;
		}
		setLoading(true);
		const levelCount = parseInt(data.noOfLevel || 0);
		const levelData = [];

		for (let i = 1; i <= levelCount; i++) {
			const quantityKey = `quantity-${i}`;
			const levelQuantityKey = `level-${i}-quantity`;
			const subPercentKey = i > 4 ? data[`subPercent-${i}`] : data.subPositionTakeProfit;
			if (i <= levelIds.length) {
				levelData.push({
					id: levelIds[i - 1],
					level_number: i,
					quantity: Number(data[quantityKey]),
					level_percentage: data[levelQuantityKey],
					sub_position_take_profit_callback: subPercentKey
				});
			}
			else {
				levelData.push({
					level_number: i,
					quantity: Number(data[quantityKey]),
					level_percentage: data[levelQuantityKey],
					sub_position_take_profit_callback: subPercentKey
				});
			}
		}
		if (levelIds.length > levelCount) {
			const levelIdsToDelete = levelIds.slice(levelCount);
			del(urlConstants.deleteLevelSettingForTrick, levelIdsToDelete,userDetails?.token)
				.then(res => console.log(res))
				.catch(err => console.log(err))
		}

		const params = {
			"trick_mode": selectedOption,
			"buying_level": parseInt(data.noOfLevel),
			"average_upto": parseInt(data.averageUpto),
			"take_profit": parseFloat(data.takeProfit),
			"sell_profit_bounce_back": parseFloat(data.sellProfitBounce),
			"buy_price_bounce_back": parseFloat(data.buyPrice),
			"sub_position_take_profit_callback": noOfLevel>4?parseFloat(data.subPositionTakeProfit):null,
			"stop_loss": isStopLossEnabled,
			"stop_loss_percentage": parseFloat(data.stopLossPercentage) || 0,
			"broker": isLiveMode?selectedBrokerType:BrokerTypes.TEST_BROKER,
			"is_live": isLiveMode,
			"symbol": item.symbol,
			"current_price": parseFloat(indicesData.unformattedClose),
			"exchange":item.exchange
		}
		put(urlConstants.editAutoInvestmentTrick + item.id, params,userDetails?.token)
			.then(res => {
				callApiForLevelSettings(levelData, res.id); //TODO: NEED TO COMBINE BOTH TRICK AND LEVEL CALLS
			})
			.catch(err => {
				setLoading(false);
				console.log(err);
			})
	};

	const callApiForLevelSettings = async (data, auto_investment_id) => {
		try {
			const response = await post(urlConstants.addTrickLevels + auto_investment_id, data,userDetails?.token);
			setLoading(false);
			onClear();
			item ? setMessage('Bot updated successfully') : setMessage('Bot created successfully');
			setShowModal(true);
		} catch (error) {
			setLoading(false);
			console.error(`Error`, error);
		}
	}

	const onClear = () => {
		reset();
		setSelectedOption(TrickMode.CYCLE);
		setIsLiveMode(true);
		setIsStopLossEnabled(false);
	};

	const handleOptionPress = (option) => {
		setSelectedOption(option);
		setValue("selectedOption", option);
	};

	const handleTogglePress = () => {
		setIsStopLossEnabled(!isStopLossEnabled);
	};

	const handleBrokerPress = (broker) => {
		if (broker === 'Alice Blue') {
			setSelectedBroker(broker)
			setSelectedBrokerType(BrokerTypes.ALICE_BLUE)
		}
		else if (broker === 'Angel') {
			setSelectedBroker(broker)
			setSelectedBrokerType(BrokerTypes.ANGEL_ONE)
		}
		clearErrors("broker")
	};
	const handlePeriodChange = (period) => {
		setSelectedPeriod(period);
	}

	const isInteger = value => {
		const regex = /^\d+$/;
		return regex.test(value);
	  };

	  const isNumber = value => {
		const regex = /^\d+(\.\d+)?$/;
		return regex.test(value);
	  };
	const validateAverageUpto = (value) => {
        const noOfLevel = getValues("noOfLevel");
        if (!noOfLevel || value <= noOfLevel) {
            return true;
        } else {
            return 'Average upto should be less than or equal to No of Level';
        }
    };

	const validateAverageUptoCombined = value => {
        if (!isInteger(value)) {
            return 'Value must be a integer';
        }
        return validateAverageUpto(value);
    };
	const handleTooltipVisibility = (tooltipName, isVisible) => {
		setTooltips(prev => ({
			...prev,
			[tooltipName]: isVisible,
		}));
	};

	const TooltipComponent = ({ isVisible, content, placement, onClose, onPress, label }) => {
		return (
			<Tooltip
				isVisible={isVisible}
				content={content}
				placement={placement}
				disableShadow={true}
				onClose={onClose}
			>
				<TouchableHighlight
					underlayColor="#FFF"
					style={{}}
					onPress={onPress}
				>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.label}>{label}</Text>
						<Image style={[styles.infoCircleIcon, styles.infoCircleIconLayout]} resizeMode="contain" source={require('../../assets/i_Symbol.png')} />
					</View>
				</TouchableHighlight>
			</Tooltip>
		);
	};
	const quantityFields = levels.map((level, index) => watch(`quantity-${index + 1}`, 0));

	useEffect(() => {
		const calculateTotal = async () => {
			const total = await quantityFields.reduce((acc, quantity) => acc + parseFloat(quantity || 0), 0);
			setTotalAmountNeeded(total*indicesData?.unformattedClose||0.00);
		};
		calculateTotal();
	}, [quantityFields]);
	return (
		<View style={{ backgroundColor: '#fff', flex: 1 }}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#0158aa" />
					<Text style={{ color: '#000', marginTop: 5,fontFamily:'NotoSans-SemiBold' }}>Processing</Text>
				</View>
			)}
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>				
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
				<View style={styles.companyPageprices}>
					{indicesData ? <View style={{ backgroundColor: '#0158aa', marginBottom: 8, paddingTop: 8, paddingBottom: 8 }}>
						<View style={{ flexDirection: 'row', flex: 1 }}>
							<View style={{ flex: 1 }}>
								<Text style={[styles.nifty50, styles.menuIconPosition, { marginLeft: 16 }]}>{indicesData.name}</Text>
								<Text style={[styles.apr202432, styles.textLayout, { marginLeft: 17, marginTop: 4 }]}>{indicesData.dateTime}</Text>
								<View style={styles.parent}>
									<Text style={[styles.indicesText]}>₹ {indicesData.close}</Text>
									<View style={[styles.arrowDownParent, { marginLeft: 17, justifyContent: 'flex-start' }]}>
										{indicesData.difference > 0 ?
											<Image
												style={[styles.icon, { marginTop: 4, marginRight: 4 }]}
												resizeMode="cover"
												source={require('../../assets/increase.png')} />
											: <Image
												style={[styles.icon, { marginTop: 4, marginRight: 4, transform: [{ scaleY: -1 }] }]}
												resizeMode="cover"
												source={require('../../assets/decrease.png')} />}
										<Text
											style={[styles.text1,
											styles.textLayout, styles.parent,
											indicesData.difference > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>
											{indicesData.change}{' '}{`( `}{indicesData?.percent_change}{` )`}
										</Text>
									</View>
								</View>
								{returns && <View style={{ flexDirection: 'row', marginTop: 6 }}>
									<Text style={[styles.mReturns, styles.text2Typo]}>{`${selectedPeriod} returns `}</Text>
									{returns?.[selectedPeriod] > 0 ?
											<Image
												style={[styles.icon, { marginTop: 4, marginRight: 4 }]}
												resizeMode="cover"
												source={require('../../assets/increase.png')} />
											: <Image
												style={[styles.icon, { marginTop: 4, marginRight: 4, transform: [{ scaleY: -1 }] }]}
												resizeMode="cover"
												source={require('../../assets/decrease.png')} />}
									<Text style={[styles.text2, styles.text2Typo,
									returns?.[selectedPeriod] > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>
										({returns?.[selectedPeriod] }%)</Text>
								</View>}
							</View>
							<View style={{ flex: 1 }}>
								{isGraphDataAvailable ? <>
								<View style={[styles.badge]}>
									{periods.map((period) => (
										<TouchableOpacity key={period} style={{ width: '25%' }} onPress={() => handlePeriodChange(period)}>
											<View style={selectedPeriod === period ? [styles.baseBadge, styles.groupChildBorder] : styles.baseBadge}>
												<Text style={[styles.graphLabel, styles.textTypo4]}>{period}</Text>
											</View>
										</TouchableOpacity>
									))}
								</View>
								{dataGraph?.length === 4 &&
									<LineChart
										data={dataGraph[periods.indexOf(selectedPeriod)]}
										width={screenWidth * 0.6}
										height={125}
										chartConfig={chartConfig}
										bezier
										style={{ marginLeft: '-25%' }}
										withHorizontalLines={false}
										withVerticalLines={false}
										yAxisInterval={1}
									/>}
									</>:
									<View style={{ backgroundColor: '#0158aa', marginBottom: 8, paddingTop: 8, paddingBottom: 8 }}>
										<ActivityIndicator size="small" color="#fff" style={{justifyContent:'center'}}/>
										<Text style={{ color: '#fff', margin: 10,fontFamily:'NotoSans-SemiBold',textAlign:'center' }}>loading statistics...</Text>
									</View>}
							</View>
						</View>
					</View>
					:
					<View style={{ backgroundColor: '#0158aa', marginBottom: 8, paddingTop: 8, paddingBottom: 8 }}>
						<Text style={{ color: '#fff', margin: 10,fontFamily:'NotoSans-SemiBold' }}>Stock details are loading...</Text>
						</View>}
					<View style={[styles.companyPagepricesInner, styles.companyChildPosition]}>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Text style={styles.labelAmount}>Amount Needed : ₹ {Number(totalAmountNeeded).toFixed(4)}</Text>
								</View>
								</View>
														<View style={{ margin: 16, flexDirection: 'row', alignItems: 'center' }}>
							<TooltipComponent
								isVisible={tooltips.trickMode}
								content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>When enabled Cycle, will continuously engage in buying and selling activities. When enabled One shot, after achieving the target, it will stop any further purchase.</Text>}
								placement="top"
								onClose={() => handleTooltipVisibility('trickMode', false)}
								onPress={() => {
									handleTooltipVisibility('trickMode', true);
								}}
								label="Bot Mode"
							/>
						</View>
						<View style={[styles.switch, styles.basePosition2]}>
							<Pressable
								style={selectedOption === TrickMode.CYCLE ? [styles.switchTab, styles.tabBg] : [styles.switchTab1, styles.switchFlexBox]}
								onPress={() => handleOptionPress(TrickMode.CYCLE)}
							>
								<Text style={[selectedOption === TrickMode.CYCLE ? styles.cycle : styles.oneShot, styles.cycleTypo]}>Cycle</Text>
							</Pressable>
							<Pressable
								style={selectedOption === TrickMode.ONESHOT ? [styles.switchTab, styles.tabBg] : [styles.switchTab1, styles.switchFlexBox]}
								onPress={() => handleOptionPress(TrickMode.ONESHOT)}
							>
								<Text style={[selectedOption === TrickMode.ONESHOT ? styles.cycle : styles.oneShot, styles.cycleTypo]}>One Shot</Text>
							</Pressable>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 16, marginRight: 16, marginTop: 16 }}>
							<Text style={styles.label}>Invest Mode</Text>
							<View style={styles.switchInvest}>
								<Pressable style={isLiveMode ? [styles.switchTabInvest, styles.switchFlexBoxInvest] : [styles.switchTabInvest1, styles.switchFlexBoxInvest]}
									onPress={() => setIsLiveMode(true)}>
									<Text style={[isLiveMode ? styles.live4 : styles.test1, styles.live4Typo]}>Live</Text>
								</Pressable>
								<Pressable style={!isLiveMode ? [styles.switchTabInvest, styles.switchFlexBoxInvest] : [styles.switchTabInvest1, styles.switchFlexBoxInvest]}
									onPress={() => setIsLiveMode(false)}>
									<Text style={[!isLiveMode ? styles.live4 : styles.test1, styles.live4Typo]}>Test</Text>
								</Pressable>
							</View>
						</View>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.noOfLevel}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>This is the number of buying levels you want to set for the strategy.</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('noOfLevel', false)}
									onPress={() => {
										handleTooltipVisibility('noOfLevel', true);
									}}
									label="Buying - No of Level"
								/>
							</View>
							<View style={[styles.field, styles.hintFlexBox, errors.noOfLevel ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'No of level is required',
										validate: value => isInteger(value) || 'Value must be an integer',
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter No of Levels'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="noOfLevel"
									defaultValue=""
								/>
							</View>
							{errors.noOfLevel && <Text style={styles.errorText}>{errors.noOfLevel.message}</Text>}
						</View>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.averageUpto}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>This parameter defines the
										number of predetermined purchase levels in the bot. But
										Should be less then or equal to Buying no of level</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('averageUpto', false)}
									onPress={() => {
										handleTooltipVisibility('averageUpto', true);
									}}
									label="Average Upto"
								/>
							</View>

							<View style={[styles.field, styles.hintFlexBox, errors.averageUpto ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'Average upto is required',
										validate: validateAverageUptoCombined
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter Average Upto'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="averageUpto"
									defaultValue=""
								/>
							</View>
							{errors.averageUpto && <Text style={styles.errorText}>{errors.averageUpto.message}</Text>}
						</View>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.takeProfit}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>This indicates the target profit percentage for each position when selling the stock.
										It is advisable to set a conservative value, such as 1.3%, to ensure more reliable results.</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('takeProfit', false)}
									onPress={() => {
										handleTooltipVisibility('takeProfit', true);
									}}
									label="Take Profit %"
								/>
							</View>
							<View style={[styles.field, styles.hintFlexBox, errors.takeProfit ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'Take profit is required',
										validate: value => isNumber(value) || 'Value must be a number',
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter Take Profit %'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="takeProfit"
									defaultValue=""
								/>
							</View>
							{errors.takeProfit && <Text style={styles.errorText}>{errors.takeProfit.message}</Text>}
						</View>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.sellProfit}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>Bounce Back from Peak: This setting introduces a margin of error when closing a transaction.
										For example, with a profit margin set at 1.3%, the bot will close positions and sales within a profit range from 1% to 1.3%,
										optimizing earnings.</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('sellProfit', false)}
									onPress={() => {
										handleTooltipVisibility('sellProfit', true);
									}}
									label="Sell Profit Bounce Back From Peak %"
								/>
							</View>
							<View style={[styles.field, styles.hintFlexBox, errors.sellProfitBounce ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'Sell profit bounce back is required',
										validate: value => isNumber(value) || 'Value must be a number',
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter Sell Profit Bounce Back From Peak %'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="sellProfitBounce"
									defaultValue=""
								/>
							</View>
							{errors.sellProfitBounce && <Text style={styles.errorText}>{errors.sellProfitBounce.message}</Text>}
						</View>
						<View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.buyPrice}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>This percentage margin determines when the bot can proceed with a new purchase after a recent sale.
										Setting it above 0% prevents immediate repurchase if the stock's value doesn't increase.</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('buyPrice', false)}
									onPress={() => {
										handleTooltipVisibility('buyPrice', true);
									}}
									label="Buy Price From Low Bounce Back %"
								/>
							</View>
							<View style={[styles.field, styles.hintFlexBox, errors.buyPrice ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'Buy price is required',
										validate: value => isNumber(value) || 'Value must be a number',
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter Buy Price From Low Bounce Back %'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="buyPrice"
									defaultValue=""
								/>
							</View>
							{errors.buyPrice && <Text style={styles.errorText}>{errors.buyPrice.message}</Text>}
						</View>
						{noOfLevel > 4 && <View style={[styles.baseInputField, styles.basePosition2]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<TooltipComponent
									isVisible={tooltips.subPositionTakeProfit}
									content={<Text style={{fontFamily:'NotoSans-Regular',color:'#445164'}}>In split position mode, this parameter establishes the required percentage change before the bot initiates a new purchase.
										It is recommended to set this between 0.2% and 0.5% to optimize profits.</Text>}
									placement="top"
									onClose={() => handleTooltipVisibility('subPositionTakeProfit', false)}
									onPress={() => {
										handleTooltipVisibility('subPositionTakeProfit', true);
									}}
									label="Sub-position Take Profit Callback %"
								/>
							</View>
							<View style={[styles.field, styles.hintFlexBox, errors.subPositionTakeProfit ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
								<Controller
									control={control}
									rules={{
										required: 'Sub-position take profit is required',
										validate: value => isNumber(value) || 'Value must be a number',
									}}
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											placeholder={'Enter Sub-position Take Profit Callback %'}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											placeholderTextColor={'#697483'}
											style={{ color: '#000000', width: '100%' }}
											keyboardType="numeric"
										/>
									)}
									name="subPositionTakeProfit"
									defaultValue=""
								/>
							</View>
							{errors.subPositionTakeProfit && <Text style={styles.errorText}>{errors.subPositionTakeProfit.message}</Text>}
						</View>}
					</View>
					<View style={[styles.rectangleView, styles.companyChildPosition]}>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
							<Text style={[styles.levelOfConfiguration, styles.setSubPositionTypo]}>Level of Configuration</Text>
							<Image style={[styles.arrowDownIcon, styles.arrowIconPosition]} resizeMode="contain" source={require("../../assets/dropdownArrowGrey.png")} />
						</View>
						{levelsLoading && (
							<View style={styles.loadingOverlay}>
								<ActivityIndicator size="large" color="#0158aa" />
								<Text style={{ color: '#000', marginTop: 5, fontFamily: 'NotoSans-SemiBold' }}>Loading Levels Info</Text>
							</View>
						)}
						{levels.map((level, index) => (
							<View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
								<View style={[styles.basePosition]}>
									<Text style={styles.label1}>Level {level.level}</Text>
									<View style={[styles.field, styles.hintFlexBox, errors[`level-${level.level}-quantity`] ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
										<Controller
											control={control}
											rules={{
												required: `Level ${level.level} quantity is required`,
												validate: value => isNumber(value) || 'Value must be a number',
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													placeholder={'Enter %'}
													onBlur={onBlur}
													onChangeText={onChange}
													value={value}
													placeholderTextColor={'#697483'}
													style={{ color: '#000000', width: '90%' }}
													keyboardType="numeric"
												/>
											)}
											name={`level-${level.level}-quantity`}
											defaultValue=""
										/>
										<View style={{ width: 1, height: '100%', backgroundColor: '#d6dae1' }} />
										<Text style={{ padding: 10 }}>%</Text>
									</View>
									{errors[`level-${level.level}-quantity`] && <Text style={styles.errorText}>{errors[`level-${level.level}-quantity`].message}</Text>}
								</View>
								<View style={[styles.basePosition]}>
									<Text style={styles.label1}>Quantity {level.level}</Text>
									<View style={[styles.field, styles.hintFlexBox, errors[`quantity-${level.level}`] ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
										<Controller
											control={control}
											rules={{
												required: `Quantity ${level.level} is required`,
												validate: value => isInteger(value) || 'Please Enter an integer',
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													placeholder={'Enter Quantity'}
													onBlur={onBlur}
													onChangeText={onChange}
													value={value}
													placeholderTextColor={'#697483'}
													style={{ color: '#000000', width: '100%' }}
													keyboardType="numeric"
												/>
											)}
											name={`quantity-${level.level}`}
											defaultValue=""
										/>
									</View>
									{errors[`quantity-${level.level}`] && <Text style={styles.errorText}>{errors[`quantity-${level.level}`].message}</Text>}
								</View>
							</View>
						))}
					</View>

					<View style={styles.companyPagepricesChild1}>
						<View style={{ margin: 16 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<Text style={[styles.setSubPositionTypo]}>Set Sub Position Exit Levels</Text>
								<Image style={[styles.arrowDownIcon1, styles.arrowIconPosition]} resizeMode="contain" source={require('../../assets/dropdownArrowGrey.png')} />
							</View>

							{subPercents.map((percent, index) => (
								<View key={index} style={[styles.baseInputField, { width: '100%' }]}>
									<Text style={styles.label1}>{percent} Sub-Percent</Text>
									<View style={[styles.field, styles.hintFlexBox, errors[`subPercent-${percent}`] ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
										<Controller
											control={control}
											rules={{
												required: `${percent} Sub-Percent is required`,
												validate: value => isNumber(value) || 'Value must be a number',
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													placeholder={'Enter Sub-Percent'}
													onBlur={onBlur}
													onChangeText={onChange}
													value={value}
													placeholderTextColor={'#697483'}
													style={{ color: '#000000', width: '100%' }}
													keyboardType="numeric"
												/>
											)}
											name={`subPercent-${percent}`}
											defaultValue=""
										/>
									</View>
									{errors[`subPercent-${percent}`] && <Text style={styles.errorText}>{errors[`subPercent-${percent}`].message}</Text>}
								</View>
							))}
						</View>
					</View>
					<View style={[styles.companyPagepricesChild2, styles.companyChildPosition]}>
						<View style={{ margin: 16 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<Text style={[styles.label11, styles.togglePosition]}>Stop Loss</Text>
								<Pressable style={[styles.toggle, styles.togglePosition]} onPress={() => handleTogglePress()}>
									{isStopLossEnabled ? <Image style={styles.toggleIcon} resizeMode="contain" source={require('../../assets/toggleON.png')} />
										: <Image style={styles.toggleIcon} resizeMode="cover" source={require('../../assets/toggleOFF.png')} />
									}
								</Pressable>

							</View>
							{isStopLossEnabled && (
								<View style={[styles.baseInputField]}>
									<View style={[styles.field, styles.hintFlexBox, errors.stopLossPercentage ? { borderColor: "#dd3409" } : { borderColor: "#d6dae1" }]}>
										<Controller
											control={control}
											rules={{
												required: 'Stop loss is required',
												validate: value => isNumber(value) || 'Value must be a number',
											}}
											render={({ field: { onChange, onBlur, value } }) => (
												<TextInput
													placeholder={'Enter Stop Loss %'}
													onBlur={onBlur}
													onChangeText={onChange}
													value={value}
													placeholderTextColor={'#697483'}
													style={{ color: '#000000', width: '100%' }}
													keyboardType="numeric"
												/>
											)}
											name="stopLossPercentage"
											defaultValue=""
										/>
									</View>
									{errors.stopLossPercentage && <Text style={styles.errorText}>{errors.stopLossPercentage.message}</Text>}
								</View>
							)}
						</View>
					</View>
					{isLiveMode && <View style={[styles.companyPagepricesChild3, styles.companyChildPosition]}>
						<View style={{ margin: 16 }}>
							<Text style={[styles.labelTypo]}>Choose Broker</Text>
							{brokers.length > 0 ? <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 12, }}>
								{brokers.map((broker, index) => (
									<Pressable key={index} onPress={() => handleBrokerPress(broker)}
										style={[styles.companyChildLayout, { marginRight: 8 }, selectedBroker === broker && { borderColor: '#0158aa' }]}>
										<Image style={[styles.imageLayout]} resizeMode="cover" source={broker === 'Alice Blue' ? require('../../assets/aliceBlue.png') : require('../../assets/angelBroker.png')} />
									</Pressable>
								))}
							</View>
								: <Text style={[styles.label, { color: '#697483' }]}>No broker account connected</Text>
							}
							{errors.broker && <Text style={styles.errorText}>{errors.broker.message}</Text>}
						</View>
					</View>}
					<View style={[styles.companyPagepricesChild3, styles.companyChildPosition]}>
						<View style={{ margin: 16 }}>
							<View style={styles.buttonContainer}>
								<Pressable style={[styles.saveBaseButton, styles.continuefieldFlexBox,{flex:0.4}]} onPress={handleSubmit(onSubmit)}>
									<Text style={[styles.textSave, styles.textTypo]}>Save</Text>
								</Pressable>
								<Pressable style={[styles.clearBaseButton, styles.continuefieldFlexBox,{flex:0.4}]} onPress={() => props.navigation.navigate('AutoInvest')}>
									<Text style={[styles.textClear, styles.textTypo]}>Discard</Text>
								</Pressable>
							</View>
						</View>
					</View>

				</View>
			</ScrollView>
			</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</View>
	);
};

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(CreateTrick);

const styles = StyleSheet.create({
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	icon: {
		height: 12,
		width: 12
	},
	icon1: {
		height: 16,
		width: 16
	},
	groupChildBorder: {
		borderWidth: 1,
		borderStyle: "solid",
		borderRadius: 8,
	},
	graphLabel: {
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
		flexDirection: 'row',
	},
	arrowDownIcon: {
		height: 16,
		width: 16
	},
	text1: {
		color: "#74c1ad",
		textAlign: "center",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	mReturns: {
		marginLeft: 17,
		color: "#fff"
	},
	text2Typo: {
		lineHeight: 20,
		fontSize: 14,
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
	},
	text2: {
		color: "#74c1ad"
	},
	arrowDownParent: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: 'space-between'
	},
	textTypo4: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	apr202432: {
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	parent: {
		marginTop: 4
	},
	indicesText: {
		fontSize: 24,
		marginLeft: 17,
		color: "#fff",
		fontFamily: "NotoSans-Regular"
	},
	nifty50: {
		lineHeight: 24,
		fontSize: 20,
		color: "#fff",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		marginLeft: 16
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		justifyContent: 'center',
		alignSelf: 'center',
		color:'#445164'
	},
	modalText: {
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 20,
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
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
	},
	saveBaseButton: {
		backgroundColor: "#0158aa",
		justifyContent: "center",
		paddingHorizontal: 28,
	},
	clearBaseButton: {
		justifyContent: "center",
		paddingHorizontal: 28,
		borderWidth: 1,
		borderColor: '#0158aa',
	},
	switchInvest: {
		height: 32,
		alignItems: "center",
		flexDirection: "row",
		backgroundColor: "#eee",
		borderRadius: 8,
		overflow: "hidden"
	},
	switchTabInvest1: {
		borderRadius: 47,
		width: 56,
		height: 30,
		backgroundColor: "#eee",
		justifyContent: "center"
	},
	switchTabInvest: {
		backgroundColor: "#0158aa",
		width: 52,
		height: 31,
		justifyContent: "center",
		borderRadius: 8
	},
	switchFlexBoxInvest: {
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden"
	},
	test1: {
		color: "#2e2e2e"
	},
	live4Typo: {
		fontFamily: "Poppins-Medium",
		fontSize: 11,
		textAlign: "left",
		fontWeight: "500"
	},
	live4: {
		color: "#eee"
	},
	continuefieldFlexBox: {
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden",
	},
	textSave: {
		fontSize: 16,
		lineHeight: 24,
		textAlign: "center",
		color: "#fff"
	},
	textTypo: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	textClear: {
		fontSize: 16,
		lineHeight: 24,
		textAlign: "center",
		color: "#0158aa"
	},
	companyChildPosition: {
		width: '100%',
	},
	textFlexBox: {
		textAlign: "center",
		color: "#fff"
	},
	iconLayout: {
		height: 24,
		top: 49,
		width: 24,
		position: "absolute"
	},
	tabBg: {
		backgroundColor: "#0158aa",
		flexDirection: "row"
	},
	activeTabBg: {
		backgroundColor: "#0158aa",
	},
	tabFlexBox: {
		paddingVertical: 10,
		paddingHorizontal: 8,
		justifyContent: "center",
		flexDirection: "row",
		flex: 1
	},
	textLayout: {
		lineHeight: 20,
		fontSize: 14
	},
	tab3Border: {
		borderStyle: "solid",
		alignItems: "center"
	},
	text3Typo: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	basePosition2: {
		width: '93%',
		marginLeft: 16,
	},
	cycleTypo: {
		fontFamily: "Poppins-Medium",
		fontSize: 11,
		fontWeight: "500",
		textAlign: "left"
	},
	switchFlexBox: {
		backgroundColor: "#eee",
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden"
	},
	infoCircleIconLayout: {
		height: 16,
		width: 16
	},
	hintFlexBox: {
		marginTop: 8,
		alignSelf: "stretch",
		flexDirection: "row"
	},
	ofspacedesigncomFlexBox: {
		color: "#8f97a2",
		textAlign: "left",
		fontSize: 14,
		flex: 1
	},
	basePosition1: {
		width: '45%',
	},
	basePosition: {
		width: '48%',
	},
	setSubPositionTypo: {
		height: 18,
		color: "#445164",
		lineHeight: 20,
		textAlign: "left",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		fontSize: 14,
	},
	arrowIconPosition: {
		height: 16,
		width: 16,
	},
	labelTypo: {
		color: "#445164",
		lineHeight: 20,
		textAlign: "left",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		fontSize: 14
	},
	errorText: {
		textAlign: "left",
		fontWeight: "500",
		fontFamily: "NotoSans-Regular",
		color: "#dd3409",
		lineHeight: 20,
		fontSize: 14,
		flex: 1
	},
	companyChildLayout: {
		borderRadius: 8,
		borderColor: "#dadce0",
		borderWidth: 2
	},
	imageLayout: {
		width: 50,
		height: 50,
		borderRadius: 8,
		borderColor: "#dadce0"
	},
	text: {
		fontFamily: "NotoSans-Regular",
		textAlign: "center",
		color: "#fff"
	},
	tab: {
		alignItems: "center"
	},
	tab1: {
		borderRadius: 8,
		alignItems: "center"
	},
	text3: {
		lineHeight: 20,
		fontSize: 14,
		textAlign: "center",
		color: "#fff"
	},
	tab3: {
		borderColor: "#fff",
		borderBottomWidth: 4,
		paddingVertical: 10,
		paddingHorizontal: 8,
		justifyContent: "center",
		flexDirection: "row",
		flex: 1
	},
	tabBar: {
		top: 88,
		height: 40,
		flexDirection: "row",
		width: 393,
		left: 0,
		position: "absolute"
	},
	companyPagepricesInner: {
		backgroundColor: "#fff",
		paddingBottom: 20
	},
	rectangleView: {
		marginTop: 8,
		backgroundColor: "#fff",
		padding: 16
	},
	cycle: {
		color: "#eee"
	},
	switchTab: {
		width: '50%',
		height: 31,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden"
	},
	oneShot: {
		color: "#2e2e2e"
	},
	switchTab1: {
		borderRadius: 47,
		width: '50%',
		height: 30,
		justifyContent: "center"
	},
	switch: {
		height: 32,
		backgroundColor: "#eee",
		alignItems: "center",
		flexDirection: "row",
		overflow: "hidden",
		borderRadius: 8
	},
	label: {
		color: "#323e4f",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 20,
		textAlign: "left",
		fontSize: 14,
	},
	labelAmount: {
		color: "#0158aa",
		fontFamily: "NotoSans-Bold",
		fontWeight: "500",
		lineHeight: 20,
		textAlign: "left",
		fontSize: 16,
	},
	infoCircleIcon: {
		marginTop: 2,
		marginLeft: 4,
	},
	label1: {
		alignSelf: "stretch",
		color: "#323e4f",
		fontFamily: "NotoSans-Medium",
		fontWeight: "500",
		lineHeight: 20,
		textAlign: "left",
		fontSize: 14
	},
	ofspacedesigncom: {
		fontFamily: "NotoSans-Medium",
		fontWeight: "500"
	},
	field: {
		borderWidth: 1,
		height: 48,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
		borderStyle: "solid",
		alignItems: "center",
		borderRadius: 8,
		overflow: "hidden"
	},
	infoCircleIcon1: {
		width: 20,
		height: 20
	},
	hintText: {
		color: "#697483",
		marginLeft: 4,
		fontFamily: "NotoSans-Regular",
		textAlign: "left",
		flex: 1
	},
	baseInputField: {
		marginTop: 12
	},


	sellProfitBounce: {
		fontFamily: "NotoSans-Regular"
	},
	companyPagepricesChild1: {
		marginTop: 8,
		backgroundColor: "#fff",
		width: '100%',
	},

	companyPagepricesChild2: {
		marginTop: 8,
		backgroundColor: "#fff"
	},
	label11: {
		color: "#445164",
		lineHeight: 20,
		textAlign: "left",
		fontFamily: "NotoSans-SemiBold",
		fontWeight: "600",
		fontSize: 14,
	},
	companyPagepricesChild3: {
		marginTop: 8,
		backgroundColor: "#fff"
	},
	baseToggle: {
		borderRadius: 32,
		backgroundColor: "#eaecf0",
		width: 36,
		padding: 2,
		alignItems: "center",
		flexDirection: "row"
	},
	toggleIcon: {
		width: 32,
		height: 32
	},
	toggle: {
		flexDirection: "row"
	},
	companyPageprices: {
		overflow: "hidden",
		width: "100%",
		flex: 1,
		backgroundColor: "#dadce0"
	}
});
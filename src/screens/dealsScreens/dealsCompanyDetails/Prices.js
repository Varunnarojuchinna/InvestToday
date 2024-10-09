import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View, Pressable, ScrollView, Dimensions,ActivityIndicator } from "react-native";
import { get } from "../../../services/axios";
import { urlConstants } from "../../../constants/urlConstants";
import { useRoute } from "@react-navigation/native";
import { LineChart } from 'react-native-chart-kit';
import { formatNumber,formatTimestamp } from "../../../services/helpers";
import moment from "moment";

const Prices = () => {

    const route = useRoute();
    const { item } = route.params || {};
    const [bulkDealsPriceData, setBulkDealsPriceData] = useState();
    const [loading, setIsLoading] = useState(false);
    const [graphData, setGraphData] = useState({});
    const [selectedGraphType, setSelectedGraphType] = useState('oneDay');
    const [indicesData, setIndicesData] = useState();
    const [companyDetails, setCompanyDetails] = useState();
    const getCompanyDetails = () => {
        const params = {
            symbol: item?.symbol,
            exchange:'NSE'
        };
        get(`${urlConstants.dealsCompanyDetails}symbol=${params.symbol}&exchange=${params.exchange}`)
			.then((res) => {
                getIndicesData(res?.currentDetails,res?.updatedOn);
                getGraphData(res?.intervalList);
				const formattedData = {
					aboutCompany: res?.aboutCompany
				};
				setCompanyDetails(formattedData)
			})
			.catch(err => console.log(err))
        };

    const getIndicesData =  (data,date) => {
        setIsLoading(true);
				const formattedData = {
                    dateTime:moment(date).format("DD MMM YYYY | hh:mm A"),
                    close: formatNumber(data?.close),
                    change: parseFloat(data?.change).toFixed(2),
                    percent_change: parseFloat(data?.percent_change).toFixed(2) + "%",
                    difference: data?.close - data?.previous_close
                };
				setIndicesData(formattedData)
        setIsLoading(false);
	};

    const getBulkDealsPrices = () => {
        setIsLoading(true);

        get(urlConstants.dealsprices + item?.symbol)
            .then((res) => {
                setIsLoading(false);
                setBulkDealsPriceData(res);

            })
            .catch(err => {
                setIsLoading(false);
                console.log('bulkDeals', err)
            })
    };

    const getGraphData = (data) => {
        setIsLoading(true);
                const sortByDatetime = (data) => {
                    return data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
                  };

                const oneDay = sortByDatetime(data['1min']?.values)?.slice(0,24).map(item => parseFloat(item.close));
                const oneWeek = sortByDatetime(data['1day']?.values)?.slice(0,7).map(item => parseFloat(item.close));
                const oneMonth = sortByDatetime(data['1day']?.values)?.slice(0,24).map(item => parseFloat(item.close));
                const threeMonths = sortByDatetime(data['1week']?.values)?.slice(0,12).map(item => parseFloat(item.close));
                const sixMonths = sortByDatetime(data['1week']?.values)?.slice(0,24).map(item => parseFloat(item.close));
                const oneYear = sortByDatetime(data['1month']?.values)?.slice(0,12).map(item => parseFloat(item.close));
                const twoYear = sortByDatetime(data['1month']?.values)?.slice(0,24).map(item => parseFloat(item.close));
                const oneDayLabel = sortByDatetime(data['1min']?.values)?.slice(0,24).map(item => moment(item.datetime).format("hh:mm A"));
                const oneWeekLabel = sortByDatetime(data['1day']?.values)?.slice(0,7).map(item => moment(item.datetime).format("DD MMM"));
                const oneMonthLabel = sortByDatetime(data['1day']?.values)?.slice(0,24).map(item => moment(item.datetime).format("DD MMM"));
                const threeMonthsLabel = sortByDatetime(data['1week']?.values)?.slice(0,12).map(item =>moment(item.datetime).format("DD MMM"));
                const sixMonthsLabel = sortByDatetime(data['1week']?.values)?.slice(0,24).map(item => moment(item.datetime).format("DD MMM"));
                const oneYearLabel = sortByDatetime(data['1month']?.values)?.slice(0,12).map(item => moment(item.datetime).format("MM YYYY"));
                const twoYearLabel = sortByDatetime(data['1month']?.values)?.slice(0,24).map(item => moment(item.datetime).format("MM YYYY"));

                const dataForGraph = {
                    oneDay: {
                        labels: oneDayLabel,
                        datasets: [
                            {
                                data: oneDay,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    oneWeek: {
                        labels: oneWeekLabel,
                        datasets: [
                            {
                                data: oneWeek,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    oneMonth: {
                        labels: oneMonthLabel,
                        datasets: [
                            {
                                data: oneMonth,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    threeMonths: {
                        labels: threeMonthsLabel,
                        datasets: [
                            {
                                data: threeMonths,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    sixMonths: {
                        labels: sixMonthsLabel,
                        datasets: [
                            {
                                data: sixMonths,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    oneYear: {
                        labels: oneYearLabel,
                        datasets: [
                            {
                                data: oneYear,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                    twoYear: {
                        labels: twoYearLabel,
                        datasets: [
                            {
                                data: twoYear,
                                color: (opacity = 1) => `rgba(0, 168, 255, ${opacity})`,
                                strokeWidth: 2,
                            },
                        ],
                    },
                };

                setGraphData(dataForGraph);
                setIsLoading(false);
    };

    useEffect(() => {
        getBulkDealsPrices();
        getCompanyDetails();
    }, [])
    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
		{loading && (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size="large" color="#0158aa" />
                <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
			</View>
		)}
        {bulkDealsPriceData ? <ScrollView>
            {bulkDealsPriceData &&
                <View style={styles.companyPageprices}>
                    <View style={styles.parent}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:16}}>
                        <View>
                        <Text style={[styles.text4, styles.text4Position]}>₹ {indicesData?.close}</Text>
                        <View style={styles.arrowDownParent}>
                            <Image style={[styles.arrowDownIcon, styles.arrowLayout,indicesData?.difference>0?{}:{transform: [{ scaleY: -1 }]}]} resizeMode="cover" 
                            source={indicesData?.difference > 0 ? require('../../../assets/increase.png')
                               : require('../../../assets/decrease.png')
                            } />
                            <Text style={[styles.text5, styles.textTypo1,indicesData?.difference > 0 ? { color: '#74c1ad' } : { color: '#eb856b' }]}>{indicesData?.change} ({indicesData?.percent_change})</Text>
                        </View>
                        <Text style={styles.may2024}>{indicesData?.dateTime}</Text>
                        </View>
                        <View style={[styles.switch, styles.switchFlexBox]}>
                            <View style={[styles.switchTab, styles.switchFlexBox]}>
                                <Text style={[styles.nse, styles.nseTypo]}>NSE</Text>
                            </View>
                            <View style={[styles.switchTab1, styles.switchFlexBox]}>
                                <Text style={[styles.bse, styles.nseTypo]}>BSE</Text>
                            </View>
                        </View>
                        </View>
                        <View style={[styles.graph, styles.graphLayout]}>                   

                                {graphData[selectedGraphType] && <LineChart
                                    data={graphData[selectedGraphType]}
                                    width={Dimensions.get('window').width}
                                    height={280}
                                    yAxisSuffix=""
                                    yAxisInterval={1}
                                    verticalLabelRotation={-75}
                                    xLabelsOffset={28}
                                    chartConfig={{
                                        backgroundColor: '#ffffff',
                                        backgroundGradientFrom: '#ffffff',
                                        backgroundGradientTo: '#ffffff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(24, 152, 119, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            r: "0",
                                            strokeWidth: "2",
                                            stroke: "#000000"
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: "",
                                            stroke: 'rgba(211, 211, 211, 1)', 
                                            strokeWidth: 0.5, 
                                          },
                                        fillShadowGradient: "#0000ff",
                                        fillShadowGradientOpacity: 0.1,
                                    }}
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16
                                    }}
                                />}                         

                        </View>
                       
                        <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',marginTop:10}}>
                        <View style={[styles.tabBar1, styles.tabPosition, { flex: 7 / 10 }]}>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'oneDay' && styles.tab4]}
              onPress={() => setSelectedGraphType('oneDay')}
            >
              <Text style={[selectedGraphType === 'oneDay'?styles.text1:styles.text25, styles.textTypo1]}>1D</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'oneWeek' && styles.tab4]}
              onPress={() => setSelectedGraphType('oneWeek')}
            >
              <Text style={[selectedGraphType === 'oneWeek'?styles.text1:styles.text25, styles.textTypo1]}>1W</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'oneMonth' && styles.tab4]}
              onPress={() => setSelectedGraphType('oneMonth')}
            >
              <Text style={[selectedGraphType === 'oneMonth'?styles.text1:styles.text25, styles.textTypo1]}>1M</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'threeMonths' && styles.tab4]}
              onPress={() => setSelectedGraphType('threeMonths')}
            >
              <Text style={[selectedGraphType === 'threeMonths'?styles.text1:styles.text25, styles.textTypo1]}>3M</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'sixMonths' && styles.tab4]}
              onPress={() => setSelectedGraphType('sixMonths')}
            >
              <Text style={[selectedGraphType === 'sixMonths'?styles.text1:styles.text25, styles.textTypo1]}>6M</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'oneYear' && styles.tab4]}
              onPress={() => setSelectedGraphType('oneYear')}
            >
              <Text style={[selectedGraphType === 'oneYear'?styles.text1:styles.text25, styles.textTypo1]}>1Y</Text>
            </Pressable>
            <Pressable
              style={[styles.tabFlexBox, selectedGraphType === 'twoYear' && styles.tab4]}
              onPress={() => setSelectedGraphType('twoYear')}
            >
              <Text style={[selectedGraphType === 'twoYear'?styles.text1:styles.text25, styles.textTypo1]}>2Y</Text>
            </Pressable>
          </View>
                        <View style={[styles.switch1, styles.switchLayout,{flex:2/10},{marginRight:16}]}>
                            <View style={[styles.switchTab2, styles.switchLayout]}>
                                <Image style={styles.candleIcon} resizeMode="cover" source={require('../../../assets/candlesWhite.png')} />
                            </View>
                            <View style={styles.switchTab3}>
                                <Image style={styles.candleIcon} resizeMode="cover" source={require('../../../assets/chartIcon.png')}/>
                            </View>
                        </View>
                        </View>
                    </View>
                    <View style={styles.companyPagepricesItem}>
                        <Text style={[styles.insights, styles.textLayout]}>Insights</Text>
                        <Text style={[styles.forTue30, styles.forTue30Typo]}>for Tue, 30 APR 2024</Text>
                        <View style={[styles.companyPagepricesInner, styles.baseButton1Border]}>

                            <View style={[styles.frameParent, styles.frameParentPosition]}>
                                <View style={styles.instanceParent}>
                                    <Image style={[styles.arrowDownIcon, styles.arrowLayout]} resizeMode="cover" source={require('../../../assets/candlesBlue.png')} />
                                    <View style={styles.whiteMarubozuBullishCandlParent}>
                                        <Text style={[styles.whiteMarubozu, styles.textLayout]}>White Marubozu - Bullish Candle</Text>
                                    </View>
                                </View>
                                <Text style={[styles.stockHasFormed, styles.stockTypo]}>Stock has formed a white marubozu spark candle with change in price by 4.57%, indicationg a bullish sentiment</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Image style={[styles.iconLayout]} resizeMode="cover" source={require('../../../assets/icon.png')} />
                            <Image style={[styles.iconLayout, { marginLeft: 8, marginRight: 8 }]} resizeMode="cover" source={require('../../../assets/icon.png')} />
                            <Image style={[styles.iconLayout]} resizeMode="cover" source={require('../../../assets/icon.png')} />
                        </View>
                    </View>
                    <View style={styles.rectangleView}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <View style={[styles.baseButton, styles.baseFlexBox]}>
                                <Text style={[styles.text32, styles.textTypo]}>BUY</Text>
                            </View>
                            <View style={[styles.baseButton1, styles.baseFlexBox]}>
                                <Text style={[styles.text33, styles.textTypo]}>SELL</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.rectangleParent, styles.groupChildLayout]}>
                        <View style={[styles.groupChild, styles.groupChildLayout]}>
                            <Text style={[styles.overview, styles.returnsTypo]}>Overview</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 16 }}>
                                <View style={[styles.frameGroup, styles.frameLayout]}>
                                    <View>
                                        <Text style={styles.forTue30Typo}>Open Price</Text>
                                        <Text style={[styles.text34, styles.textLayout]}>{bulkDealsPriceData?.Overview['Open Price']?.toFixed(2) || 'N/A'}</Text>
                                    </View>
                                    <View style={[styles.frameItem, styles.frameChildBorder]} />
                                </View>
                                <View style={[styles.frameParent2, styles.frameParentLayout]}>
                                    <View style={styles.dayRangeParent}>
                                        <Text style={styles.forTue30Typo}>Day Range</Text>
                                        <View style={styles.group}>
                                            <Text style={[styles.text40, styles.textLayout]}>{bulkDealsPriceData?.Overview['Day Range']?.Low?.toFixed(2)}</Text>
                                            <Text style={[styles.text41, styles.textLayout]}>{bulkDealsPriceData?.Overview['Day Range']?.High?.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={[styles.l, styles.lTypo]}>L</Text>
                                        <View style={[styles.frameChild3, styles.frameChildBorder]} />
                                        <Text style={[styles.h, styles.lTypo]}>H</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 16 }}>

                                <View style={[styles.frameContainer, styles.frameLayout]}>
                                    <View>
                                        <Text style={styles.forTue30Typo}>Prev.Close</Text>
                                        <Text style={[styles.text34, styles.textLayout]}>{bulkDealsPriceData?.Overview['Prev. Close'].toFixed(2)}</Text>
                                    </View>
                                    <View style={[styles.frameItem, styles.frameChildBorder]} />
                                </View>
                                <View style={[styles.frameParent3, styles.frameParentLayout]}>
                                    <View style={styles.dayRangeParent}>
                                        <Text style={styles.forTue30Typo}>52 Week Range</Text>
                                        <View style={styles.group}>
                                            <Text style={[styles.text40, styles.textLayout]}>{bulkDealsPriceData?.Overview['52 Week Range']?.Low?.toFixed(2) || 'N/A'}</Text>
                                            <Text style={[styles.text41, styles.textLayout]}>{bulkDealsPriceData?.Overview['52 Week Range']?.High?.toFixed(2) || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={[styles.l, styles.lTypo]}>L</Text>
                                        <View style={[styles.frameChild3, styles.frameChildBorder]} />
                                        <Text style={[styles.h, styles.lTypo]}>H</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.frameView, styles.framePosition, { width: '45%' }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                        <View style={styles.ttmEpsParent}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.forTue30Typo}>TTM EPS</Text>
                                                <Image style={[styles.chart2Icon1, styles.chart2IconPosition]} resizeMode="cover" source={require('../../../assets/chartIcon.png')} />
                                            </View>
                                            <Text style={[styles.text34, styles.textLayout]}>{bulkDealsPriceData?.Overview['TTM EPS']?.Value?.toFixed(2)}</Text>
                                            <Text style={[styles.yoy, styles.yoyTypo]}>{bulkDealsPriceData?.Overview['TTM EPS']?.YOY} YoY</Text>
                                        </View>
                                        <View style={[styles.ttmPeParent, styles.ttmPosition]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                <Text style={styles.forTue30Typo}>TTM PE</Text>
                                                <Image style={[styles.chart2Icon2, styles.chart2IconPosition]} resizeMode="cover" source={require('../../../assets/chartIcon.png')} />
                                            </View>
                                            <Text style={[styles.text34, styles.textLayout]}>{bulkDealsPriceData?.Overview['TTM PE']?.Value?.toFixed(2)}</Text>
                                            <Text style={[styles.averagePe, styles.yoyTypo]}>Average PE</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.frameChild3, styles.frameChildBorder]} />
                                </View>
                                <View style={[styles.frameParent1, styles.framePosition, { width: '45%' }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                        <View style={styles.ttmEpsParent}>
                                            <Text style={styles.forTue30Typo}>M.Cap(B.$)</Text>
                                            <Text style={[styles.text34, styles.textLayout]}>{bulkDealsPriceData?.Overview['M.Cap(B.S)'] || 'N/A'}</Text>
                                        </View>

                                        <View style={[styles.ttmPeGroup, styles.ttmPosition]}>
                                            <Text style={styles.forTue30Typo}>TTM PE</Text>
                                            <Text style={[styles.text34, styles.textLayout]}>0.56</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.frameChild3, styles.frameChildBorder]} />
                                </View>
                            </View>

                        </View>
                    </View>
                    <View style={styles.groupParent}>
                        <View style={styles.rectangleWrapper}>
                            <View style={styles.groupItem}>
                                <View style={[styles.returnsParent, styles.text4Position]}>
                                    <Text style={styles.returnsTypo}>Returns</Text>
                                    <View style={styles.frameParent4}>
                                        <View style={styles.frameParent5}>
                                            <View style={styles.frameParent6}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>YTD</Text>
                                                    <Text style={[styles.text44, styles.textLayout]}>{bulkDealsPriceData?.Returns?.YTD || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>1 Week</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['1 Week'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>1 Month</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['1 Month'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                        </View>
                                        <View style={styles.frameParent9}>
                                            <View style={styles.frameParent6}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>3 Months</Text>
                                                    <Text style={[styles.text44, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['3 Months'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>6 Months</Text>
                                                    <Text style={[styles.text44, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['6 Months'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>1 Year</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['1 Year'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                        </View>
                                        <View style={styles.frameParent9}>
                                            <View style={styles.frameParent6}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>2 Years</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['2 Years'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>3 Years</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['3 Years'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                            <View style={styles.frameParent7}>
                                                <View>
                                                    <Text style={styles.forTue30Typo}>5 Years</Text>
                                                    <Text style={[styles.text45, styles.textLayout]}>{bulkDealsPriceData?.Returns?.['5 Years'] || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.frameChild6, styles.frameChildBorder]} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    {companyDetails?.aboutCompany && <View style={styles.groupContainer}>
                        <View style={[styles.aboutTheCompanyWrapper, styles.text4Position]}>
                            <Text style={[styles.aboutTheCompany, styles.textLayout]}>About the Company</Text>
                        </View>
                        <View style={[styles.frameChild15, styles.baseButton1Border]} >
                            <View style={[styles.stockHasFormedAWhiteMarubWrapper, styles.frameParentPosition]}>
                                <Text style={styles.stockTypo}>{companyDetails?.aboutCompany}</Text>
                            </View>
                        </View>
                    </View>}
                </View>
            }
        </ScrollView>:
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text>No Data Found</Text>
        </View>}
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
    timeFlexBox: {
        textAlign: "center",
        color: "#fff"
    },
    iconLayout1: {
        height: 24,
        top: 49,
        width: 24,
        position: "absolute"
    },
    textTypo2: {
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    tabBarPosition: {
        height: 40,
    },
    tabFlexBox1: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        flex: 1
    },
    textLayout: {
        lineHeight: 20,
        fontSize: 14
    },
    textTypo1: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "center"
    },
    text4Position: {
        marginTop: 16,
    },
    arrowLayout: {
        width: 16,
        height: 16
    },
    graphLayout: {
        alignItems: "center"
    },
    ndIconLayout: {
        maxHeight: "100%",
        maxWidth: "100%",
        overflow: "hidden"
    },
    xAxisPosition: {
        right: 0,
        position: "absolute"
    },
    ndIconPosition: {
        display: "none",
        position: "absolute"
    },
    iconPosition1: {
        left: "0.11%",
        right: "0.01%",
        width: "99.88%",
        maxHeight: "100%",
        maxWidth: "100%",
        position: "absolute",
        overflow: "hidden"
    },
    switchFlexBox: {
        height: 30,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    nseTypo: {
        fontFamily: "Poppins-Medium",
        fontSize: 11,
        fontWeight: "500",
        textAlign: "left"
    },
    switchLayout: {
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    tabPosition: {
        borderRadius: 8,
        backgroundColor: "#efefef",
        height: 32,
        marginTop: 16,
        flexDirection: "row",
        justifyContent:'space-evenly'
    },
    tabFlexBox: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    frameParentPosition: {
        marginLeft: 16,
    },
    stockTypo: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        lineHeight: 20,
        textAlign: "left",
        fontSize: 14
    },
    baseButton1Border: {
        borderWidth: 1,
        borderStyle: "solid"
    },
    iconLayout: {
        height: 4,
        width: 4,
        marginTop: 16,
    },
    forTue30Typo: {
        color: "#697483",
        lineHeight: 16,
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left"
    },
    baseFlexBox: {
        paddingHorizontal: 12,
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    textTypo: {
        fontFamily: "Inter-Medium",
        lineHeight: 16,
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center"
    },
    groupChildLayout: {
        width: '100%',
        paddingBottom: 12
    },
    returnsTypo: {
        color: "#1b2533",
        height: 16,
        lineHeight: 20,
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 14
    },
    frameLayout: {
        width: '45%',
        marginLeft: 16
    },
    frameChildBorder: {
        height: 1,
        borderTopWidth: 1,
        borderRadius: 0.001,
        borderStyle: "dotted",
        borderColor: "#dadce0"
    },
    framePosition: {
        marginTop: 16,
    },
    yoyTypo: {
        lineHeight: 10,
        fontSize: 10,
        marginTop: 4,
        fontFamily: "NotoSans-Regular",
        textAlign: "left"
    },
    chart2IconPosition: {
        marginLeft: 8,
        height: 14,
        width: 14,
    },
    
    frameParentLayout: {
        width: '45%',
    },
    lTypo: {
        lineHeight: 10,
        fontSize: 10,
        fontFamily: "NotoSans-Regular",
        textAlign: "left",
    },
    iconPosition: {
        top: 335,
        height: 4,
        width: 4,
        position: "absolute"
    },
    companyPagepricesChild: {
        height: 88,
        width: 393,
        left: 0,
        top: 0,
        position: "absolute"
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
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        fontSize: 14,
        textAlign: "center",
        top: "50%",
        position: "absolute"
    },
    statusbariphoneXLightBackg: {
        height: "1.82%",
        top: "0%",
        right: "0%",
        bottom: "98.18%",
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
    recLtd: {
        top: 46,
        left: 56,
        fontSize: 20,
        lineHeight: 29,
        color: "#fff",
        position: "absolute"
    },
    shareIcon: {
        left: 353
    },
    starIcon: {
        left: 305
    },
    text: {
        fontWeight: "700",
        fontFamily: "NotoSans-Bold",
        textAlign: "center",
        color: "#fff"
    },
    tab: {
        borderColor: "#fff",
        borderBottomWidth: 4,
        borderStyle: "solid",
        paddingVertical: 10,
        paddingHorizontal: 8
    },
    text1: {
        lineHeight: 20,
        fontSize: 14,
        color: "#fff"
    },
    tab1: {
        borderRadius: 8
    },
    text4: {
        fontSize: 24,
        lineHeight: 32,
        color: "#323e4f",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "left",
        marginLeft: 16
    },
    arrowDownIcon: {
        height: 16
    },
    text5: {
        marginLeft: 4,
        color: "#189877",
        lineHeight: 20,
        fontSize: 14
    },
    arrowDownParent: {
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 16,
    },
    may2024: {
        marginTop: 12,
        fontFamily: "NotoSans-Regular",
        lineHeight: 12,
        fontSize: 12,
        color: "#323e4f",
        marginLeft: 16,
        textAlign: "left",
    },
    text6: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        lineHeight: 12,
        fontSize: 12,
        textAlign: "left"
    },
    yAxis: {
        width: 20,
        justifyContent: "space-between",
        alignSelf: "stretch",
        alignItems: "center"
    },
    yAxisChild: {
        alignSelf: "stretch",
        width: "100%"
    },
    yAxis2: {
        alignSelf: "stretch",
        flexDirection: "row"
    },
    yAxis1: {
        justifyContent: "space-between",
        alignSelf: "stretch",
        flexDirection: "row",
        flex: 1
    },
    xAxis1: {
        alignSelf: "stretch"
    },
    xAxis: {
        bottom: 1,
        justifyContent: "space-between",
        left: 0,
        top: 0
    },
    line: {
        width: 337,
        alignSelf: "stretch"
    },
    lineLeftText: {
        justifyContent: "space-between",
        alignSelf: "stretch",
        flexDirection: "row",
        flex: 1
    },
    yAxis14: {
        height: 7,
        paddingLeft: 22,
        marginTop: 9.6,
        justifyContent: "space-between",
        flexDirection: "row"
    },
    ndIcon: {
        height: "24.31%",
        width: "99.61%",
        top: "51.14%",
        right: "0.2%",
        bottom: "24.55%",
        left: "0.19%",
        borderRadius: 1,
        maxHeight: "100%",
        maxWidth: "100%",
        overflow: "hidden"
    },
    bodyIcon: {
        height: "97.22%",
        top: "2.63%",
        bottom: "0.15%",
        opacity: 0.4
    },
    stIcon: {
        height: "73.61%",
        top: "-0.15%",
        bottom: "26.54%",
        borderRadius: 1
    },
    tooltipTextHere: {
        lineHeight: 20,
        fontSize: 14,
        color: "#fff"
    },
    tooltipChild: {
        marginLeft: -4.51,
        bottom: -5,
        left: "50%",
        height: 5,
        width: 10,
        position: "absolute"
    },
    tooltip1: {
        shadowColor: "rgba(27, 37, 51, 0.12)",
        shadowOffset: {
            width: 0,
            height: 32
        },
        shadowRadius: 80,
        elevation: 80,
        shadowOpacity: 1,
        borderRadius: 2,
        backgroundColor: "#1b2533",
        paddingHorizontal: 7,
        paddingVertical: 5,
        flexDirection: "row"
    },
    containerIcon: {
        height: 10,
        marginTop: 7.2,
        width: 10
    },
    tooltip: {
        height: "26.67%",
        width: "15.19%",
        top: "34.16%",
        right: "19.73%",
        bottom: "39.17%",
        left: "65.08%",
        alignItems: "center"
    },
    chart: {
        top: 13,
        bottom: 17,
        left: 25,
    },
    graph: {
       marginLeft: -30,
    },
    nse: {
        color: "#eee"
    },
    switchTab: {
        width: 52,
        borderRadius: 8,
        justifyContent: "center",
        backgroundColor: "#0158aa"
    },
    bse: {
        color: "#2e2e2e"
    },
    switchTab1: {
        borderRadius: 47,
        width: 56,
        backgroundColor: "#eee",
        justifyContent: "center"
    },
    switch: {
        width: 108,
        backgroundColor: "#eee",
        marginTop: 16,
        borderRadius: 8
    },
    candleIcon: {
        height: 14,
        width: 14
    },
    switchTab2: {
        width: 38,
        justifyContent: "center",
        backgroundColor: "#0158aa"
    },
    switchTab3: {
        width: 36,
        height: 22,
        backgroundColor: "#eee",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    switch1: {
        width: 78,
        marginTop: 16,
        height: 32,
        backgroundColor: "#eee",
    },
    tab4: {
        backgroundColor: "#0158aa"
    },
    text25: {
        color: "#242f3e",
        lineHeight: 20,
        fontSize: 14
    },
    tabBar1: {
        marginLeft: 16
    },
    tabBar2: {
        left: 156,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        width: 127
    },
    parent: {
        backgroundColor: "#fff",
        width: '100%',
        paddingBottom: 12

    },
    companyPagepricesItem: {
        marginTop: 8,
        backgroundColor: "#fff",
        width: '100%',
        paddingBottom: 12
    },
    insights: {
        marginTop: 12,
        color: "#1b2533",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 16,
    },
    whiteMarubozu: {
        color: "#323e4f",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    arrowRight: {
        marginLeft: 50,
        height: 16
    },
    whiteMarubozuBullishCandlParent: {
        marginLeft: 8,
        alignItems: "center",
        flexDirection: "row"
    },
    instanceParent: {
        alignItems: "center",
        flexDirection: "row"
    },
    stockHasFormed: {
        marginTop: 16
    },
    frameParent: {
        marginTop: 12
    },
    companyPagepricesInner: {
        marginTop: 12,
        borderColor: "#dadce0",
        borderWidth: 1,
        width: '93%',
        borderRadius: 8,
        marginLeft: 16,
        paddingBottom: 12
    },
    icon1: {
        left: 187
    },
    icon2: {
        left: 195
    },
    icon3: {
        left: 203
    },
    forTue30: {
        marginTop: 12,
        marginLeft: 16,
    },
    rectangleView: {
        marginTop: 8,
        backgroundColor: "#fff",
        width: '100%',
        paddingBottom:12
    },
    text32: {
        color: "#fff"
    },
    baseButton: {
        width: '45%',
        backgroundColor: "#0158aa"
    },
    text33: {
        color: "#dd3409"
    },
    baseButton1: {
        borderColor: "#dd3409",
        width: '45%',
        borderWidth: 1,
        borderStyle: "solid",
        backgroundColor: "#fff"
    },
    groupChild: {
        backgroundColor: "#fff",
    },
    overview: {
        marginTop: 16,
        marginLeft: 16
    },
    rectangleParent: {
        marginTop: 8
    },
    text34: {
        marginTop: 4,
        color: "#1b2533",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    frameItem: {
        marginTop: 16
    },
    frameGroup: {
        marginTop: 12,
    },
    frameContainer: {
        marginTop: 12,
    },
    yoy: {
        color: "#dd3409"
    },
    lineView: {
        width: 172,
        marginTop: 16,
    },
    averagePe: {
        color: "#1b2533"
    },
    frameView: {
        marginLeft: 16
    },
    text40: {
        color: "#1b2533",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    text41: {
        marginLeft: 84,
        color: "#1b2533",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    group: {
        marginTop: 4,
        flexDirection: "row"
    },
    frameChild3: {
        marginTop: 16,
        marginLeft: 8,
        width: '80%'
    },
    l: {
        color: "#dd3409",
        left: 0
    },
    h: {
        color: "#189877",
        marginLeft: 8,
    },
    frameParent2: {
        marginTop: 12
    },
    frameParent3: {
        marginTop: 12,
    },
    groupItem: {
        paddingBottom: 12,
        backgroundColor: "#fff",
        width: '100%',
    },
    rectangleWrapper: {
        width: '100%'
    },
    text44: {
        marginTop: 4,
        color: "#dd3409",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    frameChild6: {
        width: 103,
        marginTop: 16
    },
    frameParent6: {
        width: 105
    },
    text45: {
        marginTop: 4,
        color: "#189877",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    frameParent7: {
        marginLeft: 23,
        width: 105
    },
    frameParent5: {
        flexDirection: "row"
    },
    frameParent9: {
        marginTop: 24,
        flexDirection: "row"
    },
    frameParent4: {
        marginTop: 24
    },
    returnsParent: {
        marginLeft: 16
    },
    aboutTheCompany: {
        color: "#1b2533",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
    },
    aboutTheCompanyWrapper: {
        height: 20,
        marginLeft: 16
    },
    stockHasFormedAWhiteMarubWrapper: {
        marginTop: 16
    },
    frameChild15: {
        marginTop: 16,
        borderColor: "#dadce0",
        borderWidth: 1,
        width: '93%',
        borderRadius: 8,
        marginLeft: 16,
        marginBottom: 12,
        paddingBottom: 12
    },
    baseButton2: {
        width: 40,
        height: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    button: {
        top: 18,
        left: 333,
        flexDirection: "row",
        position: "absolute"
    },
    icon4: {
        left: 166
    },
    icon5: {
        left: 174
    },
    icon6: {
        left: 182
    },
    icon7: {
        left: 190
    },
    lock1Icon: {
        left: 198
    },
    icon8: {
        left: 206
    },
    icon9: {
        left: 214
    },
    icon10: {
        left: 222
    },
    groupContainer: {
        marginTop: 12,
        backgroundColor: "#fff",
        width: '100%',
    },
    companyPageprices: {
        backgroundColor: "#dadce0",
        overflow: "hidden",
        width: "100%",
        flex: 1
    }
});

export default Prices;

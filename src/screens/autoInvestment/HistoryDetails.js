import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Image, Pressable, Modal, TextInput, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import moment from "moment";
import { BrokerTypes } from "../../constants/appConstants";

const HistoryDetails = (props) => {

    const { userInfo } = props;
    const { userDetails } = userInfo;
    const [tradeDetails, setTradeDetails] = useState([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterCriteriaStock, setFilterCriteriaStock] = useState('');
    const [filterCriteriaDate, setFilterCriteriaDate] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [isLiveMode, setLiveMode] = useState(true);
    const [message, setMessage] = useState('Please wait data is loading...');
    const [totalProfit, setTotalProfit] = useState(Number(0));
    const [liveCount, setLiveCount] = useState(0);
    const [testCount, setTestCount] = useState(0);
    const [filterCriteriaFromDate, setFilterCriteriaFromDate] = useState('');
    const [filterCriteriaToDate, setFilterCriteriaToDate] = useState('');
    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [selectedToDate, setSelectedToDate] = useState(null);
    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
    const showFromDatePicker = () => setFromDatePickerVisibility(true);
    const showToDatePicker = () => setToDatePickerVisibility(true);


    useEffect(() => {
        getTradeHistory();
    }, []);

    const statusTypes = {
        1: { status: 'Pending', color: '#0158aa' },
        2: { status: 'Completed', color: '#189877' },
        3: { status: 'Cancelled', color: '#dd3409' }
    };

    const getTradeHistory = () => {
        get(urlConstants.tradeHistory,userDetails?.token)
            .then((response) => {
                if (response.length === 0){
                    setMessage('No data available');
                    return;
                }
                const formattedData = formatData(response);
                setTradeDetails(formattedData);
                setFilteredData(formattedData);                
            }).catch((error) => {
                setMessage('No data available');
                console.log(error);
            });
    };

    const calculateProfit = (buyAmount, sellAmount) => {
        setTotalProfit(prevProfit => (parseFloat(prevProfit) + parseFloat(sellAmount-buyAmount)).toFixed(2));
        return (sellAmount - buyAmount).toFixed(2);
    };

    const calculateProfitPercentage = (buyAmount, sellAmount) => {
        return ((sellAmount - buyAmount) / buyAmount * 100).toFixed(2);
    };

    const formatData = (data) => {
        let liveCounter = 0;
        let testCounter = 0;

        const formatTime = (dateTime)=>{
            const date = new Date(dateTime);
            const time = date.toISOString().split('T')[1].split('.')[0];
            return time;
        }

        const formatted = data
            .filter(order => order.status === 2 || order.status === 3)
            .reduce((acc, order) => {
                const date = new Date(order.sell_order_closed).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                const stock = {
                    trickId: order.auto_investment_id,
                    symbol: order.symbol,
                    sellPrice: order.sell_price,
                    buyPrice: Number(order.buy_price).toFixed(4),
                    brokerType: order.broker,
                    level: order.level || 'N/A',
                    quantity: order.sell_quantity,
                    sellAmount: order.sell_amount,
                    buyAmount: order.buy_amount,
                    buyTime: formatTime(order.sell_order_closed),
                    status: statusTypes[order.status].status,
                    color: statusTypes[order.status].color,
                    isLive: order.is_live,
                    exchange: order.exchange,
                    profit: calculateProfit(parseFloat(order.buy_amount), parseFloat(order.sell_amount)),
                    profitPercentage: calculateProfitPercentage(parseFloat(order.buy_amount), parseFloat(order.sell_amount)),
                };
                if (order.is_live) {
                    liveCounter++;
                } else {
                    testCounter++;
                }

                setLiveCount(liveCounter);
                setTestCount(testCounter);
                const existingDateEntry = acc.find(entry => entry.date === date);

                if (existingDateEntry) {
                    existingDateEntry.stocks.push(stock);
                } else {
                    acc.push({ date, stocks: [stock] });
                }

                return acc;
            }, []);
            formatted.sort((a, b) => {
                const dateA = moment(a.date, "DD MMM YYYY").toDate();
                const dateB = moment(b.date, "DD MMM YYYY").toDate();
                return dateB - dateA; 
            });
        return formatted;
    };



    const applyFilter = () => {
        const fromDate = selectedFromDate ? new Date(selectedFromDate.setHours(0, 0, 0, 0)) : null;
        const toDate = selectedToDate ? new Date(selectedToDate.setHours(23, 59, 59, 999)) : null;
    
        let liveCounter = 0;
        let testCounter = 0;
    
        const filtered = tradeDetails
            .map(day => {
                const dayDate = moment(day.date, "DD MMM YYYY").toDate(); 
    
                return {
                    ...day,
                    stocks: day.stocks.filter(stock => {
                        const stockDate = dayDate; 
    
                        const isWithinDateRange =
                            (!fromDate || stockDate >= fromDate) &&
                            (!toDate || stockDate <= toDate);
    
                        const matchesFilter = (
                            (filterCriteriaStock ? stock.symbol.toLowerCase().includes(filterCriteriaStock.toLowerCase()) : true) &&
                            isWithinDateRange
                        );
    
                        if (matchesFilter) {
                            if (stock.isLive) {
                                liveCounter++;
                            } else {
                                testCounter++;
                            }
                        }
    
                        return matchesFilter;
                    })
                };
            })
            .filter(day => day.stocks.length > 0)
            .sort((a, b) => {
                const dateA = moment(a.date, "DD MMM YYYY").toDate();
                const dateB = moment(b.date, "DD MMM YYYY").toDate();
                return dateA - dateB;
            });
    
        setFilteredData(filtered);
        setLiveCount(liveCounter); 
        setTestCount(testCounter); 
        setFilterModalVisible(false);
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setFilterCriteriaDate(formattedDate);
        setSelectedDate(date);
        hideDatePicker();
    };

    const handleFromDateConfirm = (date) => {
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setFilterCriteriaFromDate(formattedDate);
        setSelectedFromDate(date);
        setFromDatePickerVisibility(false);
    };

    const handleToDateConfirm = (date) => {
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setFilterCriteriaToDate(formattedDate);
        setSelectedToDate(date);
        setToDatePickerVisibility(false);
    };

    const clearFilters = () => {
        setFilterCriteriaStock('');
        setFilterCriteriaFromDate('');
        setFilterCriteriaToDate(''); 
        setSelectedFromDate(null);
        setSelectedToDate(null);
        
        let liveCounter = 0;
        let testCounter = 0;
        
        tradeDetails.forEach(day => {
            day.stocks.forEach(stock => {
                if (stock.isLive) {
                    liveCounter++;
                } else {
                    testCounter++;
                }
            });
        });
    
        setLiveCount(liveCounter);
        setTestCount(testCounter);
        setFilteredData(tradeDetails);
        setFilterModalVisible(false);
    };
    
    const closeModal = () => {
        setFilterModalVisible(false);
    };

    return (
        <ScrollView>
            <View style={styles.automaticInvesting}>
                <View style={[styles.automaticInvestingChild, styles.vectorParentPosition]} >
                    <View style={[styles.automaticInvestingInner, styles.groupChildLayout]}>
                        <View style={[styles.groupChild]}>
                            <View style={[styles.totalProfitParent, styles.parentLayout, { justifyContent: 'space-between' }]}>
                                <Text style={[styles.totalProfit, styles.text5Typo]}>Total Profit</Text>
                                <View style={[styles.parent, styles.parentLayout]}>
                                    <Image style={styles.rupeeIcon} resizeMode="contain" source={require('../../assets/currencyIconWhite.png')} />
                                    <Text style={[styles.text5, styles.text5Typo]}>{Number(totalProfit).toFixed(4)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={styles.switch}>
                            <Pressable style={isLiveMode ? [styles.switchTabMode, styles.switchFlexBox] : [styles.switchTab1, styles.switchFlexBox]}
                                onPress={() => setLiveMode(true)}>
                                <Text style={[isLiveMode ? styles.live4 : styles.test1, styles.live4Typo]}>Live ({liveCount})</Text>
                            </Pressable>
                            <Pressable style={!isLiveMode ? [styles.switchTabMode, styles.switchFlexBox] : [styles.switchTab1, styles.switchFlexBox]}
                                onPress={() => setLiveMode(false)}>
                                <Text style={[!isLiveMode ? styles.live4 : styles.test1, styles.live4Typo]}>Test ({testCount})</Text>
                            </Pressable>
                        </View>
                        <Pressable onPress={() => setFilterModalVisible(true)}>
                            <Image style={styles.filterIcon} resizeMode="cover" source={require('../../assets/filter.png')} />
                        </Pressable>
                    </View>

                    {filteredData.length > 0 ? <View style={styles.frameParent}>
                        {filteredData && filteredData.map((item, index) => (
                            <View key={index}>
                               {item?.stocks.filter(item => item?.isLive === isLiveMode).length>0 && <View style={[styles.automaticInvestingItem, styles.rectangleViewLayout]}>
                                    <Text style={[styles.may2024, styles.mayTypo]}>{item?.date}</Text>
                                </View>}
                                {item?.stocks.filter(item => item?.isLive === isLiveMode).map((stock, idx) => (
                                    <View key={`${item?.id}-${idx}`} style={styles.stockLayout}>
                                        <View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={[styles.stockName, styles.mayClr, { marginTop: 12 }]}>{stock.symbol} ({stock.exchange})</Text>
                                                <View style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={[styles.profit]}>Profit : </Text>
                                                    <View style={styles.arrowDownGroup}>
                                                        <Image style={[styles.arrowDownIcon, stock.profit > 0 ? {} : { transform: [{ scaleY: -1 }] }]} resizeMode="contain"
                                                        source={stock.profit > 0 ? require('../../assets/increase.png') : require('../../assets/decrease.png')} />
                                                        <Text style={[styles.text, styles.historyTypo, stock.profit > 0 ? { color: '#189877' } : { color: '#dd3409' }]}>{stock.profit} ({stock.profitPercentage}%)</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 16 }}>
                                            <Text style={[styles.trickId11211, styles.profitClr, { marginRight: 4 }]}>Bot ID : {stock.trickId}</Text>
                                            <Text style={[styles.stockDate, styles.profitClr]}>{stock.buyTime}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 16 }}>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Level : {stock.level}</Text>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Quantity : {stock.quantity}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 16 }}>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Buy Price : ₹ {Number(stock.buyPrice).toFixed(4)}</Text>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Sell Price : ₹ {Number(stock.sellPrice).toFixed(4)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 16 }}>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Buy Amount : ₹ {Number(stock.buyAmount).toFixed(4)}</Text>
                                                <Text style={[styles.stockDate, styles.profitClr]}>Sell Amount : ₹ {Number(stock.sellAmount).toFixed(4)}</Text>
                                            </View>                                            
                                            <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={[styles.stockDate, styles.profitClr]}>Status : </Text>
                                                    <Text style={[styles.stockName, { color: stock.color }]}>{stock.status}</Text>
                                                </View>
                                                <View style={{ marginRight: 16 }}>
                                                {stock.brokerType === BrokerTypes.ALICE_BLUE && <Image style={styles.iconPosition} source={require('../../assets/aliceBlue.png')} />}
                                                {stock.brokerType === BrokerTypes.ANGEL_ONE && <Image style={styles.iconPosition} source={require('../../assets/angelBroker.png')} />}
                                            </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                        :
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataMessage}>{message}</Text>
                        </View>}
                </View>

                <Modal
                    transparent={true}
                    visible={filterModalVisible}
                    onRequestClose={closeModal}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Filter Options</Text>
                            <View style={styles.field}>
                                <TextInput
                                    style={{ color: '#000000', flex: 1 }}
                                    placeholder="Filter by stock name"
                                    value={filterCriteriaStock}
                                    onChangeText={setFilterCriteriaStock}
                                    placeholderTextColor={'#697483'}
                                />
                            </View>
                            <View style={styles.field}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={{ color: '#000000', flex: 1 }}
                                    placeholder="Filter by From date"
                                    value={filterCriteriaFromDate}
                                    onFocus={showFromDatePicker}  
                                    placeholderTextColor={'#697483'}
                                />
                                <TouchableOpacity onPress={showFromDatePicker}>
                                    <Image style={styles.calendarIcon} resizeMode="contain" source={require('../../assets/calendarIcon.png')} />
                                </TouchableOpacity>
                            </View>
                            </View>
                            <View style={styles.field}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={{ color: '#000000', flex: 1 }}
                                    placeholder="Filter by To date"
                                    value={filterCriteriaToDate}
                                    onFocus={showToDatePicker}  
                                    placeholderTextColor={'#697483'}
                                 />
                                <TouchableOpacity onPress={showToDatePicker}>
                                    <Image style={styles.calendarIcon} resizeMode="contain" source={require('../../assets/calendarIcon.png')} />
                                </TouchableOpacity>
                            </View>
                            </View>
                            <DateTimePickerModal
                                isVisible={isFromDatePickerVisible}
                                mode="date"
                                onConfirm={handleFromDateConfirm}
                                onCancel={() => setFromDatePickerVisibility(false)}
                            />
                            <DateTimePickerModal
                                isVisible={isToDatePickerVisible}
                                mode="date"
                                onConfirm={handleToDateConfirm}
                                onCancel={() => setToDatePickerVisibility(false)}
                            />
                            <View style={styles.buttonContainer}>
                                <Pressable style={[styles.saveBaseButton, styles.continuefieldFlexBox]} onPress={applyFilter}>
                                    <Text style={[styles.textSave, styles.textTypo]}>Apply</Text>
                                </Pressable>
                                <Pressable style={[styles.clearBaseButton, styles.continuefieldFlexBox]} onPress={clearFilters}>
                                    <Text style={[styles.textClear, styles.textTypo]}>Clear</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    arrowDownIcon: {
        height: 12,
        width: 12,
        marginTop:12,
        marginRight: 4
    },
    arrowDownGroup: {
        alignItems: "center",
        flexDirection: "row",
    },
    switchTab1: {
        borderRadius: 47,
        width: 56,
        height: 30,
        backgroundColor: "#eee",
        justifyContent: "center"
    },
    test1: {
        color: "#2e2e2e"
    },
    switchFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    switchTabMode: {
        backgroundColor: "#0158aa",
        width: 52,
        height: 31,
        justifyContent: "center",
        borderRadius: 8
    },
    switch: {
        marginLeft: 16,
        marginTop: 16,
        height: 32,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#eee",
        borderRadius: 8,
        overflow: "hidden"
    },
    live4: {
        color: "#eee"
    },
    live4Typo: {
        fontFamily: "Poppins-Medium",
        fontSize: 11,
        textAlign: "left",
        fontWeight: "500"
    },
    vectorParentPosition: {
        width: '100%',
    },
    continuefieldFlexBox: {
        paddingVertical: 2,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden",
    },
    saveBaseButton: {
        backgroundColor: "#0158aa",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    live4: {
        color: "#eee"
    },
    live4Typo: {
        fontFamily: "Poppins-Medium",
        fontSize: 11,
        textAlign: "left",
        fontWeight: "500"
    },
    switchTab: {
        width: 52,
        height: 30,
        justifyContent: "center",
        borderRadius: 8
    },
    switchFlexBox: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        overflow: "hidden"
    },
    clearBaseButton: {
        justifyContent: "center",
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#0158aa',
    },
    textSave: {
        fontSize: 14,
        lineHeight: 24,
        textAlign: "center",
        color: "#fff"
    },
    textClear: {
        fontSize: 14,
        lineHeight: 24,
        textAlign: "center",
        color: "#0158aa"
    },
    textTypo: {
        fontFamily: "NotoSans-Regular",
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
        overflow: "hidden",
        marginTop: 8,
        alignSelf: "stretch",
        flexDirection: "row",
        borderColor: "#d6dae1"
    },
    mayClr: {
        color: "#445164",
        marginLeft: 16
    },
    profitClr: {
        color: "#697483",
    },
    mayTypo: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
    },
    historyTypo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    stockLayout: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",
        borderRadius: 8,
        width: '93%',
        paddingBottom: 12,
        marginLeft: 16,
    },
    groupChildLayout: {
        height: 46,
        width: '93%',
    },
    parentLayout: {
        flexDirection: "row",
        height: 18,
        alignItems: "center",
    },
    text5Typo: {
        textAlign: "left",
        fontSize: 14,
    },
    rectangleViewLayout: {
        justifyContent: "center",
        height: 20,
        backgroundColor: "#cce5fd",
        width: '100%',
    },
    timePosition: {
        top: "50%",
        position: "absolute"
    },
    iconPosition: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderColor: "#dadce0",
        borderWidth: 2
    },
    automaticInvestingChild: {
        backgroundColor: "#fff",
    },
    stockName: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left",
        fontSize: 14,
        marginTop: 12
    },
    stockName: {
        fontFamily: "NotoSans-Bold",
        fontWeight: "600",
        textAlign: "left",
        fontSize: 14
    },
    trickId11211: {
        lineHeight: 17,
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        color: "#697483",
        marginLeft: 16,
        textAlign: "left",
    },
    profit: {
        marginTop: 12,
        color: "#697483",
        fontSize: 14,
        fontFamily: "NotoSans-Regular",
        textAlign: "left",
    },
    text: {
        color: "#189877",
        marginTop: 12,
        textAlign: "left",
        fontWeight: "600",
        fontSize: 14
    },
    stockNameGroup: {
        marginTop: 8
    },
    groupChild: {
        backgroundColor: "#189877",
        borderRadius: 8,
    },
    totalProfit: {
        color: "#fff",
        fontFamily: "NotoSans-Regular",
    },
    text5: {
        fontWeight: "700",
        fontFamily: "NotoSans-Bold",
        color: "#fff",
    },
    rupeeIcon: {
        marginTop: 4,
        width: 12,
        height: 12,
        marginRight: 4,
        overflow: "hidden"
    },
    totalProfitParent: {
        margin: 16,
    },
    rectangleParent: {
        left: 0,
        top: 0
    },
    automaticInvestingInner: {
        marginTop: 16,
        marginLeft: 16
    },
    frameGroup: {
        top: 240,
        left: 16,
        position: "absolute"
    },
    history: {
        marginTop: 30,
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 16
    },
    automaticInvestingItem: {
        marginTop: 12
    },
    may2024: {
        color: "#445164",
        marginLeft: 16
    },
    rectangleView: {
        top: 633
    },
    may20241: {
        top: 637,
        color: "#445164",
        left: 16
    },
    filterIcon: {
        marginTop: 16,
        height: 24,
        width: 24,
        marginRight: 16
    },
    automaticInvesting: {
        backgroundColor: "#dadce0",
        flex: 1,
        overflow: "hidden",
        width: "100%"
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    modalTitle: {
        color: '#445164',
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14

    },
    input: {
        height: 40,
        borderColor: '#808080',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 8,
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    stockDate: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        color: "#808080",
        marginLeft: 16,
        textAlign: "left",
    },
    stockStatus: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        color: "#808080",
        marginLeft: 16,
        textAlign: "left",
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    noDataMessage: {
        fontSize: 16,
        color: '#808080',
        textAlign: 'center'
    },
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HistoryDetails);

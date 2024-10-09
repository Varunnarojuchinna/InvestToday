import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Image, Pressable, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BrokerTypes } from "../../constants/appConstants";

const OrderHistory = (props) => {
    const { userInfo } = props;
    const { userDetails } = userInfo;
    const [orderDetails, setOrderDetails] = useState([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isLiveMode, setLiveMode] = useState(true);
    const [filterCriteriaStock, setFilterCriteriaStock] = useState('');
    const [filterCriteriaDate, setFilterCriteriaDate] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [message, setMessage] = useState('Please wait data is loading...');
    const [liveCount, setLiveCount] = useState(0);
    const [testCount, setTestCount] = useState(0);
    const [filterCriteriaFromDate, setFilterCriteriaFromDate] = useState('');
    const [filterCriteriaToDate, setFilterCriteriaToDate] = useState('');
    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [selectedToDate, setSelectedToDate] = useState(null);
    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
    const [page, setPage] = useState(1);
    const showFromDatePicker = () => setFromDatePickerVisibility(true);
    const showToDatePicker = () => setToDatePickerVisibility(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getOrderHistory();
    }, [page]);

    const orderTypes = {
        1: 'BUY',
        2: 'SELL'
    };

    const statusTypes = {
        1: {status:'Pending',color:'#0158aa'},
        2: {status:'Completed',color:'#189877'},        
        3: {status:'Cancelled',color:'#dd3409'},
        4: {status:'Rejected',color:'#dd3409'},
    };

    const getOrderHistory = () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        get(urlConstants.orderHistory + `?pageNumber=${page}&pageSize=20`, userDetails?.token)
            .then((response) => {
                if (response.length === 0) {
                    setHasMore(false);
                    setMessage('No more data available');
                    return;
                }

                const formattedData = formatData(response);

                setOrderDetails(prevOrderDetails => [...prevOrderDetails, ...formattedData]);
                setFilteredData(prevFilteredData => [...prevFilteredData, ...formattedData]);
                setIsLoading(false);
            })
            .catch((error) => {
                setMessage('No data available');
                setIsLoading(false);
                console.log(error);
            });
    };
    const formatData = (data) => {
        let liveCounter = 0;
        let testCounter = 0;

        const formatTime = (dateTime)=>{
            const date = new Date(dateTime);
            const time = date.toISOString().split('T')[1].split('.')[0];
            return time;
        }

        const formatted = data.reduce((acc, order) => {
            const date = new Date(order.created_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            const statusInfo = statusTypes[order.status] || {};
            const stock = {
                stockName: order.company_name,
                trickId: order.auto_investment_id,
                price: parseFloat(order.price),
                orderId: order.order_id,
                orderType: orderTypes[order.type],
                symbol: order.symbol,
                brokerType: order.broker_type,
                level: order.level||'N/A',
                amount: order.quantity * order.price,
                quantity: order.quantity,
                time: formatTime(order.updated_on),
                status: statusInfo.status,
                color: statusInfo.color,
                isLive: order.is_live,
                exchange: order.exchange,
                reason: order.reason
            };

            if (order.is_live) {
                liveCounter++;
            } else {
                testCounter++;
            }

            const existingDateEntry = acc.find(entry => entry.date === date);

            if (existingDateEntry) {
                existingDateEntry.stocks.push(stock);
            } else {
                acc.push({ date, stocks: [stock] });
            }

            return acc;
        }, []);

        setLiveCount(liveCounter);
        setTestCount(testCounter);

        return formatted;
    };


    const loadMoreData = () => {
        if (!isLoading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const renderFooter = () => {
        if (!isLoading) return null;
        return <ActivityIndicator style={{ margin: 20 }} />;
    };

    const applyFilter = () => {
        const fromDate = selectedFromDate ? new Date(selectedFromDate.setHours(0, 0, 0, 0)) : null;
        const toDate = selectedToDate ? new Date(selectedToDate.setHours(23, 59, 59, 999)) : null;
    
        let liveCounter = 0;
        let testCounter = 0;
    
        const filtered = orderDetails
            .flatMap(day => {
                const dayDate = moment(day.date, "DD MMM YYYY").toDate();
                
                const filteredStocks = day.stocks.filter(stock => {
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
                });
    
                return filteredStocks.length > 0 ? [{ ...day, stocks: filteredStocks }] : [];
            });
    
        filtered.sort((a, b) => {
            const dateA = moment(a.date, "DD MMM YYYY").toDate();
            const dateB = moment(b.date, "DD MMM YYYY").toDate();
            return dateA - dateB;
        });
    
        setFilteredData(filtered);
        setLiveCount(liveCounter); 
        setTestCount(testCounter); 
        setFilterModalVisible(false);
    };
    
    const resetData = () => {
        setFilteredData(orderDetails);
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
    
        orderDetails.forEach(day => {
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
        setFilteredData(orderDetails);
        setFilterModalVisible(false);
    };
    
    const closeModal = () => {
        clearFilters();
        setFilterModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <View key={item.id}>
            {item?.stocks.filter(stock => stock?.isLive === isLiveMode).length > 0 && (
                <View style={[styles.automaticInvestingItem, styles.rectangleViewLayout]}>
                    <Text style={[styles.may2024, styles.mayTypo]}>{item?.date}</Text>
                </View>
            )}
            {item?.stocks.filter(stock => stock?.isLive === isLiveMode).map((stock, idx) => (
                <View key={`${item?.id}-${idx}`} style={styles.stockLayout}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.stockName, styles.mayClr, { marginTop: 12 }]}>{stock.symbol} ({stock.exchange})</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Text style={[styles.trickId11211, styles.profitClr]}>Bot ID : {stock.trickId}</Text>
                                <Text style={[styles.trickId11211, styles.profitClr]}>Time : {stock.time}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
                            <View style={[stock.orderType === 'BUY' ? { backgroundColor: "#189877" } : { backgroundColor: "#dd3409" }, styles.switchTab, styles.switchFlexBox]}>
                                <Text style={[styles.live4, styles.live4Typo]}>{stock.orderType}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View>
                            {isLiveMode && <Text style={[styles.trickId11211, styles.profitClr]}>Order ID : {stock.orderId}</Text>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={[styles.trickId11211, styles.profitClr]}>Level : {stock.level}</Text>
                                    <Text style={[styles.trickId11211, styles.profitClr]}>Price : ₹ {(stock.price).toFixed(4)}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.trickId11211, styles.profitClr]}>Quantity : {stock.quantity}</Text>
                                    <Text style={[styles.trickId11211, styles.profitClr]}>Amount : ₹ {stock.amount.toFixed(4)}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.trickId11211, styles.profitClr]}>Status : </Text>
                                <Text style={[styles.stockName, { color: stock.color }]}>{stock.status}</Text>
                            </View>
                            {stock.reason && stock.status === 'Rejected' && (
                                <View style={{ width: '80%' }}>
                                    <Text style={[styles.trickId11211, styles.profitClr]}>Reason: </Text>
                                    <Text style={[styles.reasonName, styles.reasonText]}>{stock.reason}</Text>
                                </View>
                            )}
                        </View>
                        <View style={{ marginRight: 16 }}>
                            {stock.brokerType === BrokerTypes.ALICE_BLUE && <Image style={styles.iconPosition} source={require('../../assets/aliceBlue.png')} />}
                            {stock.brokerType === BrokerTypes.ANGEL_ONE && <Image style={styles.iconPosition} source={require('../../assets/angelBroker.png')} />}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    )

    return (
        <ScrollView>
            <View style={styles.automaticInvesting}>
                <View style={[styles.automaticInvestingChild, styles.vectorParentPosition]} >
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

                    <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={loadMoreData}
                // onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={<Text>{message}</Text>}
            />
    
                    {/* {filteredData.length > 0 ? (
                        <View style={styles.frameParent}>
                            {filteredData.map((item, index) => (
                                <View key={index}>
                                    {item?.stocks.filter(stock => stock?.isLive === isLiveMode).length > 0 && (
                                        <View style={[styles.automaticInvestingItem, styles.rectangleViewLayout]}>
                                            <Text style={[styles.may2024, styles.mayTypo]}>{item?.date}</Text>
                                        </View>
                                    )}
                                    {item?.stocks.filter(stock => stock?.isLive === isLiveMode).map((stock, idx) => (
                                        <View key={`${item?.id}-${idx}`} style={styles.stockLayout}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={[styles.stockName, styles.mayClr, { marginTop: 12 }]}>{stock.symbol} ({stock.exchange})</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.trickId11211, styles.profitClr]}>Bot ID : {stock.trickId}</Text>
                                                        <Text style={[styles.trickId11211, styles.profitClr]}>Time : {stock.time}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
                                                    <View style={[stock.orderType === 'BUY' ? { backgroundColor: "#189877" } : { backgroundColor: "#dd3409" }, styles.switchTab, styles.switchFlexBox]}>
                                                        <Text style={[styles.live4, styles.live4Typo]}>{stock.orderType}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <View>
                                                    {isLiveMode && <Text style={[styles.trickId11211, styles.profitClr]}>Order ID : {stock.orderId}</Text>}
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <View>
                                                            <Text style={[styles.trickId11211, styles.profitClr]}>Level : {stock.level}</Text>
                                                            <Text style={[styles.trickId11211, styles.profitClr]}>Price : ₹ {(stock.price).toFixed(4)}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={[styles.trickId11211, styles.profitClr]}>Quantity : {stock.quantity}</Text>
                                                            <Text style={[styles.trickId11211, styles.profitClr]}>Amount : ₹ {stock.amount.toFixed(4)}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flexDirection: 'row'}}>
                                                        <Text style={[styles.trickId11211, styles.profitClr]}>Status : </Text>
                                                        <Text style={[styles.stockName, { color: stock.color }]}>{stock.status}</Text>
                                                    </View>
                                                    {stock.reason && stock.status==='Rejected' && (
                                                    <View style={{width:'80%'}}>
                                                        <Text style={[styles.trickId11211, styles.profitClr]}>Reason: </Text>
                                                        <Text style={[styles.reasonName, styles.reasonText]}>{stock.reason}</Text>
                                                    </View>
                                                    )}                             
                                                </View>
                                                <View style={{ marginRight: 16 }}>
                                                {stock.brokerType === BrokerTypes.ALICE_BLUE && <Image style={styles.iconPosition} source={require('../../assets/aliceBlue.png')} />}
                                                {stock.brokerType === BrokerTypes.ANGEL_ONE && <Image style={styles.iconPosition} source={require('../../assets/angelBroker.png')} />}
                                            </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataMessage}>{message}</Text>
                        </View>
                    )} */}
                </View>
            </View>

            <Modal 
                visible={filterModalVisible}
                transparent={true}
                animationType="slide" 
                onRequestClose={() => setFilterModalVisible(false)}
                >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Options</Text>
                <View style={styles.field}>
                <TextInput
                    style={{ color: '#000000' }}
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
    </ScrollView>
    );
};

const styles = StyleSheet.create({
    switchTab1: {
        borderRadius: 47,
        width: 56,
        height: 30,
        backgroundColor: "#eee",
        justifyContent: "center"
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
    test1: {
        color: "#2e2e2e"
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
        fontWeight: 'bold',
        color: '#000',
    },
    trickId11211: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        color: "#697483",
        marginLeft: 16,
        textAlign: "left",
    },
    buy: {
        fontFamily: "NotoSans-Bold",
        fontSize: 14,
        color: "#189877",
    },
    sell: {
        fontFamily: "NotoSans-Bold",
        fontSize: 14,
        color: "#dd3409",
    },
    profit: {
        color: "#697483",
    },
    text: {
        color: "#189877",
        marginTop: 12,
        textAlign: "left",
        fontWeight: "600",
        lineHeight: 20,
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
    automaticInvestingInner: {
        marginTop: 16,
        marginLeft: 16
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
        width: "100%",
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
        color: "#445164",
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
    profitLabel: {
        color: "#000000",
        marginLeft: 16,
        marginTop: 10,
    },
    editIcon: {
        width: 30,
        height: 30,
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
        marginTop: 20,
    },
    noDataMessage: {
        fontSize: 16,
        color: '#808080',
        textAlign: 'center'
    },
    reasonText: {
        fontFamily: "NotoSans-Regular",
        fontSize: 8,  
        color: '#dd3409',
        marginLeft: 16,
        textAlign: "left"
    },
    reasonName: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left",
        fontSize: 14,
    },
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(OrderHistory);

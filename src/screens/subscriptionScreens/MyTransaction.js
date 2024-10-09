import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Modal, TextInput, TouchableOpacity } from 'react-native';
import { get } from '../../services/axios'; 
import { urlConstants } from '../../constants/urlConstants';
import { connect } from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    const time = date.toISOString().split('T')[1].split('.')[0];
    return time;
};

const getPaymentType = (type) => {
    switch (type) {
        case 1:
            return 'NetBanking';
        case 2:
            return 'UPI';
        case 3:
            return 'Wallets';
        case 4:
            return 'Cards';
        default:
            return 'Cards';
    }
};

const MyTransaction = (props) => {
    const { userInfo } = props;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Please wait transactions are loading...');
    const [groupedTransactions, setGroupedTransactions] = useState({});
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterCriteriaFromDate, setFilterCriteriaFromDate] = useState('');
    const [filterCriteriaToDate, setFilterCriteriaToDate] = useState('');
    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
    const showFromDatePicker = () => setFromDatePickerVisibility(true);
    const showToDatePicker = () => setToDatePickerVisibility(true);

    useEffect(() => {
        getTransactionHistory();
    }, [filterCriteriaFromDate, filterCriteriaToDate]);

    const getTransactionHistory = async () => {
        try {
            const response = await get(urlConstants.getTransactionHistory,userInfo?.userDetails?.token);
            console.log('API Response:', response);

            if (response && Array.isArray(response)) {
                setLoading(false);
                if (response.length > 0) {
                    const filtered = response.filter(transaction => {
                        const transactionDate = new Date(transaction.created_on);
                        const fromDate = new Date(filterCriteriaFromDate);
                        const toDate = new Date(filterCriteriaToDate);

                        const isAfterFromDate = filterCriteriaFromDate ? transactionDate >= fromDate : true;
                        const isBeforeToDate = filterCriteriaToDate ? transactionDate <= toDate : true;

                        return isAfterFromDate && isBeforeToDate;
                    });

                    const grouped = filtered.reduce((acc, transaction) => {
                        const date = new Date(transaction.created_on).toDateString();
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(transaction);
                        return acc;
                    }, {});
                    setGroupedTransactions(grouped);
                } else {
                    setMessage('No Transactions available');
                }
            } else {
                setLoading(false);
                setMessage('Unexpected API Response');
            }
        } catch (error) {
            setLoading(false);
            setMessage('Error fetching transactions');
            console.error('Error Details:', error.response || error.message || error);
        }
    };

    const handleFromDateConfirm = (date) => {
        setFilterCriteriaFromDate(date.toDateString());
        setFromDatePickerVisibility(false);
    };

    const handleToDateConfirm = (date) => {
        setFilterCriteriaToDate(date.toDateString());
        setToDatePickerVisibility(false);
    };

    const applyFilter = () => {
        setFilterModalVisible(false);
        getTransactionHistory();
    };

    const clearFilters = () => {
        setFilterCriteriaFromDate('');
        setFilterCriteriaToDate('');
        setFilterModalVisible(false);
        getTransactionHistory();
    };

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>My Transactions</Text>
                <Pressable onPress={() => setFilterModalVisible(true)} style={styles.filterContainer}>
                    <Image style={styles.filterIcon} resizeMode="cover" source={require('../../assets/filter.png')} />
                </Pressable>
            </View>
            <ScrollView>
                {!loading && Object.keys(groupedTransactions).length > 0 ? (
                    sortedDates.map((date, index) => (
                        <View key={index}>
                            <View style={[styles.automaticInvestingItem, styles.rectangleViewLayout]}>
                                <Text style={[styles.may2024, styles.mayTypo]}>{moment(date).format('DD MMM YYYY')}</Text>
                            </View>
                            {groupedTransactions[date].map((transaction, idx) => (
                                <View key={idx} style={styles.card}>
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <View style={styles.transactionDetails}>
                                                <Text style={styles.label}>Payment Type: </Text>
                                                <Text style={styles.value}>{getPaymentType(transaction.type)}</Text>
                                            </View>
                                            <View style={styles.transactionDetails}>
                                                <Text style={styles.label}>Amount: </Text>
                                                <Text style={styles.value}>₹{transaction.amount}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.column, { marginLeft: 16 }]}>
                                            <View style={styles.transactionDetails}>
                                                <Text style={styles.label}>Time: </Text>
                                                <Text style={styles.value}>{formatTime(transaction.created_on)}</Text>
                                            </View>
                                            <View style={styles.transactionDetails}>
                                                <Text style={styles.label}>Status: </Text>
                                                <Text style={styles.value}>{'Success'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.message}>{message}</Text>
                )}
            </ScrollView>

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
    );
};

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

export default connect(mapStateToProps)(MyTransaction);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
        borderBottomColor: '#dadce0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1b2533',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterIcon: {
        width: 24,
        height: 24,
    },
    message: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#9e9e9e',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderColor: '#dadce0',
        borderWidth: 1,
        padding: 12,
        marginBottom: 8,
        marginHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    transactionDetails: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontWeight: '500',
        color: '#445164',
    },
    value: {
        color: '#1b2533',
    },
    automaticInvestingItem: {
        marginTop: 12,
        marginBottom: 8, 
    },
    rectangleViewLayout: {
        justifyContent: "center",
        height: 20,
        backgroundColor: "#cce5fd",
        width: '100%',
    },
    may2024: {
        color: "#445164",
        marginLeft: 16
    },
    mayTypo: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#d6dae1',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginRight: 8,
        fontSize: 14,
        color: '#445164',
    },
    calendarIcon: {
        width: 24,
        height: 24,
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
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    saveBaseButton: {
        backgroundColor: '#0158aa',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 8,
    },
    clearBaseButton: {
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0158aa',
    },
    textSave: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
    },
    textClear: {
        fontSize: 14,
        color: '#0158aa',
        textAlign: 'center',
    },
    textTypo: {
        fontFamily: 'NotoSans-Regular',
        fontWeight: '500',
    },
});

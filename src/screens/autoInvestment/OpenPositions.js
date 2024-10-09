import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Modal, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { connect } from 'react-redux';
import * as authAction from '../../redux/actions/authAction';
import { bindActionCreators } from 'redux';

const OpenPositions = (props) => {
  const { userInfo } = props;
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedBotMode, setSelectedBotMode] = useState('All');
  const [showBotModeDropdown, setShowBotModeDropdown] = useState(false);
  const [openPositions, setOpenPositions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [message, setMessage] = useState('Please wait data is loading...');

  const botModeOptions = ['All', 'Live', 'Test','Active', 'InActive'];

  useEffect(() => {
    getOpenPositions();
  }, []);

  useEffect(() => {
    if (openPositions.length > 0) {
      applyFilters();
    }
  }, [selectedBotMode]);

  const formatted = (responseData) => {
    return responseData.map((order) => ({
      symbol: order.symbol,
      trickId: order.auto_investment_id,
      qty: order.sum,
      ltp: order.current_price,
      level: order.level || 'N/A',
      averagePrice: order.avg,
      positionAmount: order.position_amount,
      currentAmount: order.current_amount,
      gainLoss: order.gain_loss,
      isLive: order.is_live,
      status: order.status,
    }));
  };
  
  const count = filteredData?.length;

  const getOpenPositions = () => {
    get(urlConstants.openPositions, userInfo?.userDetails?.token)
      .then(async (response) => {
        if (response.length === 0)
        {
          setMessage('No data available');
          return;
        }
        const formattedData = await formatted(response).sort((a, b) => b.status - a.status);
        setOpenPositions(formattedData);  
        setFilteredData(formattedData); 
      })
      .catch((error) => {
        console.error('Error fetching data:', error.response?.data || error.message);
        setMessage('No data available');
      });
  };

  const applyFilters = () => {
    const filtered = openPositions.filter(item =>
      (selectedBotMode === 'All' || (selectedBotMode === 'Live' && item.isLive) || (selectedBotMode === 'Test' && !item.isLive) ||
       (selectedBotMode === 'Active' && item.status) || (selectedBotMode === 'InActive' && !item.status))
    ).sort((a, b) => b.status - a.status);
    filtered.length === 0 ? setMessage('No data available') : setMessage('Please wait data is loading...');
    setFilteredData(filtered);
  };

  const renderDropdownItem = (item, setSelected, setShowDropdown) => (
    <Pressable
      style={styles.dropdownItem}
      onPress={() => {
        setSelected(item);
        setShowDropdown(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'space-between' }}>
        <View style={styles.switch}>
          <View style={[styles.switchTabMode, styles.switchFlexBox]}>
            <Text style={[ styles.live4, styles.live4Typo]}>{selectedBotMode } ({count})</Text>
          </View>         
        </View>
        <Pressable onPress={() => setFilterModalVisible(true)}>
          <Image style={styles.filterIcon} resizeMode="cover" source={require('../../assets/filter.png')} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {filteredData?.length > 0 ? (
          <View style={styles.frameParent}>
            {filteredData?.map((item, index) => (
              <View key={index}>                
                  <View key={item.trickId} style={styles.stockLayout}>
                    <View style={styles.detailsContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.stockName}>{item.symbol}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Image style={styles.frameChild} resizeMode="cover"
                          source={item?.status ?
                            require("../../assets/dotLiveGreen.png")
                            : require("../../assets/redDot.png")} />
                        <Text style={[item?.status ? styles.live : styles.test, styles.livePosition]}>{item?.status ? 'Active' : 'InActive'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Image style={styles.frameChild} resizeMode="cover"
                          source={item?.isLive ?
                            require("../../assets/dotLiveGreen.png")
                            : require("../../assets/dotTestYellow.png")} />
                        <Text style={[item?.isLive ? styles.live : styles.test, styles.livePosition]}>{item?.isLive ? 'Live' : 'Test'}</Text>
                      </View>
                      </View>
                    </View>
                      <View style={styles.twoColumns}>
                        <View style={styles.column1}>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Bot ID:</Text>
                            <Text style={styles.value}>{item.trickId}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>QTY:</Text>
                            <Text style={styles.value}>{item.qty}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>LTP:</Text>
                            <Text style={styles.value}>{Number(item.ltp).toFixed(4)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Level:</Text>
                            <Text style={styles.value}>{item.level}</Text>
                          </View>
                        </View>
                        <View style={styles.column2}>                    
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Average Price:</Text>
                            <Text style={styles.value}>{Number(item.averagePrice).toFixed(4)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Position Amount:</Text>
                            <Text style={styles.value}>{Number(item.positionAmount).toFixed(4)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Current Amount:</Text>
                            <Text style={styles.value}>{Number(item.currentAmount).toFixed(4)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Gain/Loss:</Text>
                            <View style={styles.gainLossContainer}>
                              <Image
                                style={[styles.arrowDownIcon, item.gainLoss > 0 ? {} : { transform: [{ scaleY: -1 }] }]}
                                resizeMode="contain"
                                source={item.gainLoss > 0 ? require('../../assets/increase.png') : require('../../assets/decrease.png')}
                              />
                              <Text style={[styles.gainLossText, item.gainLoss > 0 ? { color: '#189877' } : { color: '#dd3409' }]}>
                                {Number(item.gainLoss).toFixed(4)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataMessage}>{message}</Text>
          </View>
        )}
      </ScrollView>
      {filterModalVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <Text style={styles.mayClr}>
                  Select Bot Mode/Status
                </Text>
              <TouchableOpacity
                onPress={() => setShowBotModeDropdown(!showBotModeDropdown)}
                style={[styles.field,showBotModeDropdown&&{borderColor:'#0158aa',borderwidth:2}]}
              >
                <Text style={styles.mayClr}>
                  {selectedBotMode}
                </Text>
                <Image source={require('../../assets/dropdownArrowGrey.png')} style={styles.arrDownIcon} />
              </TouchableOpacity>
              {showBotModeDropdown && (
                <View style={styles.dropdown}>
                  <FlatList
                    data={botModeOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) =>
                      renderDropdownItem(item, setSelectedBotMode, setShowBotModeDropdown)
                    }
                  />
                </View>
              )}
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.saveBaseButton, styles.continuefieldFlexBox]}
                  onPress={() => {
                    applyFilters();
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[styles.textSave, styles.textTypo]}>Apply</Text>
                </Pressable>
                <Pressable
                  style={[styles.clearBaseButton, styles.continuefieldFlexBox]}
                  onPress={() => {
                    setSelectedBotMode('All');
                    setShowBotModeDropdown(false);
                    applyFilters();
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[styles.textClear, styles.textTypo]}>Clear</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  livePosition: {
    alignSelf: 'flex-end',
    marginTop: 8,
    lineHeight: 17,
    fontFamily: "NotoSans-Regular",
    fontSize: 12,
    marginRight: 12,
},
frameChild: {
  marginTop: 8,
  marginRight:4,
  width: 8,
  height: 8,
},
live: {
  color: "#189877"
},
inactive: {
  color: "#dd3409"
},
test: {
  color: "#e1ad01"
},
  rectangleViewLayout: {
    marginTop: 4,
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  noDataMessage: {
    marginLeft: 16,
    fontSize: 16,
    color: '#808080',
    textAlign: 'center'
  },
  switchTab1: {
    borderRadius: 47,
    width: 56,
    height: 30,
    backgroundColor: "#eee",
    justifyContent: "center"
  },
  switchTabMode: {
    backgroundColor: "#0158aa",
    paddingHorizontal:4,
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
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
  },
  stockLayout: {
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderStyle: "solid",
    borderRadius: 8,
    width: '93%',
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  detailsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockName: {
    fontFamily: "NotoSans-SemiBold",
    fontWeight: "600",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 'bold',
    color: '#445164',
  },
  twoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column1: {
    flex: 1,
    marginRight: 6,
    alignItems: 'flex-start',
  },
  column2: {
    flex: 1,
    marginRight: 6,
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  label: {
    fontFamily: "NotoSans-Regular",
    fontSize: 12,
    color: "#808080",
    marginRight: 4,
  },
  value: {
    fontFamily: "NotoSans-Regular",
    fontSize: 12,
    color: "#00000080",
  },
  filterIcon: {
    marginTop: 16,
    height: 24,
    width: 24,
    marginRight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    color: "#445164",
    fontFamily: "NotoSans-SemiBold",
    fontWeight: "600",
    textAlign: "left",
    lineHeight: 20,
    fontSize: 14,
    marginBottom: 12,
  },
  field: {
    borderWidth: 1,
    borderColor: '#d6dae1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  fieldText: {
    fontSize: 14,
    color: '#00000080',
  },
  dropdown: {
    marginTop:4,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
    maxHeight: 150,
  },
  dropdownItem: {
    paddingTop:4,
    paddingLeft: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#808080',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 16,
  },
  saveBaseButton: {
    backgroundColor: "#0158AA",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  clearBaseButton: {
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0158AA',
    borderRadius: 4,
  },
  textSave: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff",
  },
  textClear: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    color: "#0158AA",
  },
  textTypo: {
    fontFamily: "NotoSans-Regular",
    fontWeight: "500",
  },
  continuefieldFlexBox: {
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  positionAmount: {
    color: "#697483",
    fontSize: 12,
    fontFamily: "NotoSans-Regular",
    lineHeight: 16
  },
  text6Typo: {
    fontFamily: "NotoSans-Regular",
    textAlign: "left"
  },
  arrowDownGroup: {
    alignItems: "center",
    flexDirection: "row",
  },
  text3: {
    marginTop: 4
  },
  textTypo1: {
    color: "#1b2533",
    fontFamily: "NotoSans-SemiBold",
    fontWeight: "600",
    textAlign: "left",
    lineHeight: 20,
    fontSize: 14
  },
  arrowDownIcon: {
    width: 8,
    height: 8,
    marginRight: 4,
  },
  gainLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gainLossText: {
    fontSize: 12,
  },
  mayClr: {
    color: '#808080',
    fontSize: 16,
  },
  arrDownIcon: {
    height: 16,
    width: 16,
  },
});

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenPositions);
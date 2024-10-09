import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Image, Pressable, TextInput, FlatList, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import TricksList from "./TricksList";
import { ScrollView } from "react-native-gesture-handler";
import { bindActionCreators } from 'redux';
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";

const SearchStocks = (props) => {
  const { userInfo } = props;
  const { userDetails } = userInfo;
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [exchange, setExchange] = useState("");

  const getStocks = useCallback(async () => {
    try {
      const response = await get(`${urlConstants.searchStocks}name=${searchText}`);
      setStocks(response);
      setFilteredOptions(response);
    } catch (error) {
      console.log(error);
    }
  }, [searchText]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText) {
        getStocks();
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, getStocks]);

  const filterOptions = (text) => {
    setSearchText(text);
    setFilteredOptions(
      stocks.filter((stock) =>
        stock.name.toLowerCase().includes(text.toLowerCase())
      )
    );
    setShowOptions(true);
  };

  const onOptionPress = (stock) => {
    setSearchText(stock.name);
    setExchange(stock.exchange);
    setSelectedOption(stock.name);
    setShowOptions(false);
  };
  const handleClose = () => {
    setSearchText('');
    setSelectedOption(null);
    setShowOptions(false);
  };

  return (
    <View style={styles.investors}>
      <View style={{ backgroundColor: "#0158aa", padding: 16 }}>
        <View style={styles.field}>
          <TextInput
            style={styles.ofspacedesigncom}
            onFocus={() => setShowOptions(true)}
            onChangeText={filterOptions}
            placeholder="Search Stocks"
            placeholderTextColor={"#697483"}
            value={searchText}
          />
          {searchText || showOptions ? (
            <Pressable onPress={handleClose}>
              <Image
                style={styles.iconLayout}
                resizeMode="cover"
                source={require('../../assets/closeButton.png')}
              />
            </Pressable>
          ) : (
            <Pressable onPress={() => navigation.navigate('AutoInvest')}>
              <Image
                style={styles.iconLayout}
                resizeMode="cover"
                source={require('../../assets/search.png')}
              />
            </Pressable>
          )}
        </View>
      </View>
      {showOptions && filteredOptions.length > 0 && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={filteredOptions}
            renderItem={({ item }) => (
              <Pressable
                key={`${item.symbol}-${item.exchange}`}
                onPress={() => onOptionPress(item)}
                style={{ minHeight: 30, justifyContent: 'center', paddingHorizontal: 16 }}
              >
                <Text style={styles.stockName}>{item.name}{' - '}{item.exchange}</Text>
              </Pressable>
            )}
            keyExtractor={(item) => `${item.symbol}-${item.exchange}`}
          />
        </View>
      )}
      <ScrollView style={{ height: '100%' }}>
        <View style={styles.automaticInvestingChild}>
          <View style={styles.frameParent}>
            {stocks.filter(item => item.name === selectedOption && item.exchange=== exchange).map((stock, index) => (
              <Pressable
                key={index}
                style={styles.stockLayout}
                onPress={() => { navigation.navigate('CreateTrick', { stock }) }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 16 }}>
                  <View style={{ flex: 3 }}>
                    <Text style={[styles.stockSymbol, styles.mayClr]}>{stock.symbol}</Text>
                    <Text style={[styles.stockName, styles.mayClr]}>{stock.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end',flex:1 }}>
                    <Text style={[styles.text, styles.historyTypo]}>{stock?.exchange}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ paddingBottom: 16, backgroundColor: '#fff' }}>
          <TricksList />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  investors: {
    backgroundColor: "#dadce0",
    height: '100%',
    overflow: "hidden",
    width: "100%",
    flex: 1
  },
  automaticInvestingChild: {
    backgroundColor: "#fff",
},
vectorParentPosition: {
  width: '100%',
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
  marginLeft: 16,
},
mayTypo: {
  fontFamily: "NotoSans-Regular",
  fontSize: 12,
  textAlign: "left",
  color: "#189877",
  fontWeight: "600",
},
text: {
  color: "#0158aa",
  textAlign: "left",
  fontWeight: "600",
  lineHeight: 20,
  fontSize: 14
},
stockSymbol: {
  color: "#242f3e",
  fontFamily: "NotoSans-SemiBold",
  fontWeight: "600",
  textAlign: "left",
  lineHeight: 20,
  fontSize: 14
},
stockName: {
  fontFamily: "NotoSans-Regular",
  fontWeight: "500",
  color: "#697483",
  textAlign: "left",
  lineHeight: 20,
  fontSize: 14,
},
  baseInputField: {
    height: 48
  },
  field: {
    alignSelf: "stretch",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: "#fff",
    overflow: "hidden",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ofspacedesigncom: {
    fontFamily: "NotoSans-Regular",
    color: "#697483",
    textAlign: "left",
    lineHeight: 24,
    fontSize: 16,
    flex: 1
  },
  iconLayout: {
    height: 16,
    width: 16
  },
  dropdownContainer: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  investorsChild: {
    backgroundColor: "#fff",
  },
  recentsSearches: {
    textAlign: "left",
    color: "#445164",
    fontFamily: "NotoSans-Medium",
    fontWeight: "500",
    lineHeight: 24,
    fontSize: 16,
  },
  label: {
    lineHeight: 20,
    textAlign: "left",
    fontSize: 14,
    color: "#445164",
    fontFamily: "NotoSans-Medium",
    fontWeight: "500"
  },
  arrowRightIcon: {
    height: 16,
    width: 16,
    marginLeft: 4
  },
  baseBadge: {
    borderRadius: 4,
    backgroundColor: "#f5f6f7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
	marginRight: 8
  },
  badgeParent: {
    flexDirection: "row",
  },
  badgeGroup: {
    marginTop: 8,
    flexDirection: "row",
  },
  frameParent: {
    marginTop: 12,
  },
});

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators(ActionCreators, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(SearchStocks);

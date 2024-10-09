import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { urlConstants } from "../../constants/urlConstants";
import { get } from "../../services/axios";

const FII_DIIActivity = () => {
  const [selectedTab, setSelectedTab] = useState('FII');
  const [fiiData, setFiiData] = useState([]);
  const [diiData, setDiiData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await get(urlConstants.fiiDiiActivity);

        if (response && Array.isArray(response)) {
          const fii = response.filter(item => item.category === 'fiiFpi*');
          const dii = response.filter(item => item.category === 'dii*');
          setFiiData(fii);
          setDiiData(dii);
        } else {
          console.error('Error: Response is not an array or is empty.');
        }
      } catch (error) {
        console.error('Error fetching FII/DII data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.column}>
          <View style={styles.transactionDetails}>
            <Text style={styles.label}>Category: {item.category}</Text>
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.label}>Buy Value</Text>
            <Text style={styles.subLabel}>(₹ Crores) : {item.buyValue}</Text>
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.label}>Net Value</Text>
            <Text style={styles.subLabel}>(₹ Crores) : {item.netValue}</Text>
          </View>
        </View>

        <View style={[styles.column, { marginLeft: 16 }]}>
          <View style={styles.transactionDetails}>
            <Text style={styles.label}>Date: {item.date}</Text>
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.label}>Sell Value</Text>
            <Text style={styles.subLabel}>(₹ Crores) : {item.sellValue}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const currentData = selectedTab === 'FII' ? fiiData : diiData;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'FII' && styles.activeTab]}
          onPress={() => setSelectedTab('FII')}
        >
          <Text style={[styles.tabText, selectedTab === 'FII' ? styles.activeTabText : styles.inactiveTabText]}>FII/FPI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'DII' && styles.activeTab]}
          onPress={() => setSelectedTab('DII')}
        >
          <Text style={[styles.tabText, selectedTab === 'DII' ? styles.activeTabText : styles.inactiveTabText]}>DII</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0158aa" />
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#0158aa',
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#000000',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderColor: '#dadce0',
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  transactionDetails: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    color: '#445164',
    lineHeight: 20,
  },
  subLabel: {
    fontWeight: '400',
    color: '#445164',
    lineHeight: 18,
  },
});

export default FII_DIIActivity;
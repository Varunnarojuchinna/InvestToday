import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity,StyleSheet, ActivityIndicator, Image } from 'react-native';
import { get } from "../../services/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { urlConstants } from "../../constants/urlConstants";
import { useNavigation } from "@react-navigation/native";
const SearchInvestor = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [prefilledList, setPrefilledList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent searches from AsyncStorage
        const searches = await AsyncStorage.getItem('recentSearches');
        if (searches !== null) {
          setRecentSearches(JSON.parse(searches));
        }

        // Fetch pre-filled list from backend
        get(urlConstants.investorsData)
            .then((res) => {
                setLoading(false)
                setPrefilledList(res);
                setResults(res);             
                    
            })
            .catch(err => {
                setLoading  (false)
            })
        
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults(prefilledList);
  };

  const handleSearch = (text) => {
    setQuery(text);
    if (text) {
      const filteredResults = prefilledList.filter(item =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filteredResults);
    } else {
      setResults(prefilledList);
    }
  };

  const handleRecentSearch = (search) => {
    navigation.navigate('InvestorDetails');
  };

  const handleResultItemClick = (query) => {
    const updatedRecentSearches = [query, ...recentSearches.filter(item => item !== query)];
    setRecentSearches(updatedRecentSearches);
    AsyncStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
    navigation.navigate('InvestorDetails');
  };

  const handleRemoveRecentSearch = async (search)=>{
    try {
        const searches = await AsyncStorage.getItem('recentSearches');
        if (searches !== null) {
          let currentSearches = JSON.parse(searches);    
          const updatedRecentSearches = currentSearches.filter(item => item !== search);    
          await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));    
          setRecentSearches(updatedRecentSearches);
        }
      } catch (error) {
        console.error('Error removing recent search:', error);
      }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0158aa" />
          <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
        </View>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Investors"
          placeholderTextColor={'#697483'}
          value={query}
          onChangeText={handleSearch}
        />
        {query ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/delete-sign.png' }}
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : (
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/search.png' }}
            style={styles.icon}
          />
        )}
      </View>
      <View style={styles.recentSearchesContainer}>
        <Text style={styles.recentSearchesTitle}>Recent searches</Text>
        <View style={styles.recentSearchesList}>
          {recentSearches.map((item, index) => (
            <View key={index.toString()} style={styles.recentSearchItemContainer}>
              <TouchableOpacity onPress={() => handleRecentSearch(item)}>
                <Text style={styles.recentSearchItem}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveRecentSearch(item)} style={styles.removeButton}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/delete-sign.png' }}
                  style={styles.removeIcon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleResultItemClick(item)}>
            <Text style={styles.resultItem}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.resultsList}
      />
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5'
  },
  header: {
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    // backgroundColor: 'blue'
  },
  searchInput: {
    color: '#000',
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#CCC',
    paddingRight: 40, // Add some right padding to make space for the icons
  },
  clearButton: {
    position: 'absolute',
    right: 2,
    top: '70%',
    transform: [{ translateY: -10 }],
  },
  icon: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  resultsList: {
    flex: 1,
  },
//   resultItem: {
//     padding: 8,
//     backgroundColor: '#FFF',
//     borderBottomWidth: 1,
//     borderColor: '#EEE',
//     textTransform: 'uppercase',
//     fontSize: 16,
//     color: '#444'
//   },
  resultItem: {
    padding: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE',
    textTransform: 'uppercase', // Makes the text uppercase
    fontFamily: 'Times New Roman', // You can use 'Roboto' or any other standard font
    fontSize: 16,
    color: '#444', // Black color
    fontWeight: 'normal',
    borderStyle: 'solid'
  },
  recentSearchesContainer: {
    marginBottom: 16,
  },
  recentSearchesTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
  recentSearchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    padding: 8,
  },
  recentSearchItem: {
    fontSize: 14,
    textTransform: 'uppercase',
    color:'#445164',

  },
  removeButton: {
    marginLeft: 8,
  },
  removeIcon: {
    width: 16,
    height: 16,
  },
});



export default SearchInvestor;

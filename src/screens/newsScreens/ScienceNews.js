import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {get} from '../../services/axios';
import {urlConstants} from '../../constants/urlConstants';
import {useNavigation} from '@react-navigation/native';

const ScienceNews = () => {
  const navigation = useNavigation();
  const [scienceNews, setScienceNews] = useState();
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    getScienceData();
  }, []);

  const getScienceData = () => {
    setIsLoading(true);
    const params = {
      category: 'science',
    };
    get(`${urlConstants.news}category=${params.category}`)
      .then(res => {
        setIsLoading(false);
        const formattedData = res?.map(item => ({
          title: item.title,
          description: item.description ? item.description : item.title,
          image: item.urlToImage,
          content: item?.content,
        }));
        setScienceNews(formattedData);
      })
      .catch(err => {
        setIsLoading(false);
        console.log('science', err);
      });
  };
  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0158aa" />
          <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
        </View>
      )}
      <ScrollView>
        <View style={styles.news2}>
          {scienceNews?.length > 0 &&
            scienceNews.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.news2Child2,
                  styles.childLayout1,
                  {backgroundColor: index % 2 === 0 ? '#fff3dc' : '#fff'},
                ]}>
                <View
                  style={{
                    borderTopEndRadius: 16,
                    marginLeft: 16,
                    marginRight: 16,
                  }}>
                  <Image
                    style={[styles.news2Child3, styles.childLayout]}
                    resizeMode="cover"
                    source={
                      item.image
                        ? {uri: item.image}
                        : require('../../assets/news1.png')
                    }
                  />
                  <Text
                    style={[styles.centerReceivesSeven8, styles.centerTypo2]}>
                    {item?.title}
                  </Text>
                  <Pressable
                    style={styles.centerRecievesForContainer}
                    onPress={() =>
                      navigation.navigate('ViewFullDetails', {item: item})
                    }>
                    <Text style={styles.textTypo2}>
                      {item?.description}
                      <Text style={styles.readMore}>READ MORE</Text>
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: 16,
                  }}>
                  <Text style={[styles.hourAgo, styles.iconPosition2]}>
                    1 Hour ago
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Image
                      style={[styles.shareIcon, styles.shareIconLayout]}
                      resizeMode="cover"
                      source={require('../../assets/shareIcon.png')}
                    />
                    <Image
                      style={[styles.bookmark2Icon, styles.bookmark2IconLayout]}
                      resizeMode="cover"
                      source={require('../../assets/bookmark.png')}
                    />
                    <Image
                      style={[styles.playIcon, styles.playIconLayout]}
                      resizeMode="cover"
                      source={require('../../assets/play.png')}
                    />
                  </View>
                </View>
              </View>
            ))}
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
  news2ChildPosition: {
    width: '100%',
  },
  news2: {
    backgroundColor: '#eceef0',
    overflow: 'hidden',
    flex: 1,
    width: '100%',
  },
  news2Child2: {
    paddingTop: 16,
    backgroundColor: '#fff3dc',
  },
  childLayout1: {
    width: '100%',
  },
  childLayout: {
    height: 160,
    width: '100%',
  },
  centerTypo2: {
    fontSize: 16,
    width: '100%',
    color: '#445164',
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
    marginTop: 8,
  },
  textTypo2: {
    width: '100%',
    color: '#445164',
    fontFamily: 'NotoSans-Regular',
    fontSize: 12,
    textAlign: 'left',
    letterSpacing: 0,
  },
  readMore: {
    textDecorationLine: 'underline',
  },
});

export default ScienceNews;

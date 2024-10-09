import React from 'react';
import {Image, StyleSheet, Text, View, Pressable, useWindowDimensions} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import RenderHTML from 'react-native-render-html';

const ViewNewsFullDetails = props => {
  const { width } = useWindowDimensions();
  const {item} = props.route.params;

  const isHTML = content => {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(content);
  };

  return (
    <ScrollView>
      <View style={styles.news3}>
        <Image
          style={[styles.news3Item, styles.news3ItemPosition]}
          resizeMode="cover"
          source={
            item?.image ? {uri: item?.image} : require('../../assets/news1.png')
          }
        />
        <View style={{margin: 16}}>
          <Text style={styles.centerReceivesSeven}>{item?.title}</Text>

          <Text style={styles.centerRecievesForContainer}>
            <Text style={styles.centerRecievesFor}>
              {isHTML(item?.content) ? (
                <RenderHTML
                  contentWidth={width}
                  source={{html: item?.content}}
                  defaultTextProps={{style: styles.text}}
                />
              ) : (
                <Text style={styles.text}>{item?.content}</Text>
              )}
            </Text>
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Image
              style={[styles.playIcon, styles.iconLayout]}
              resizeMode="cover"
              source={require('../../assets/play.png')}
            />
            <Image
              style={[styles.bookmark2Icon, styles.iconLayout]}
              resizeMode="cover"
              source={require('../../assets/bookmark.png')}
            />
            <Image
              style={[styles.shareIcon, styles.iconLayout]}
              resizeMode="cover"
              source={require('../../assets/shareIcon.png')}
            />
          </View>
          <Text style={[styles.readMoreOn, styles.labelTypo]}>
            Read More on
          </Text>
          <View style={{flexDirection: 'row', marginTop: 16}}>
            <View style={[styles.badge, styles.badgePosition]}>
              <View style={styles.baseBadge}>
                <Text style={[styles.label, styles.labelTypo]}>Amaraja</Text>
              </View>
            </View>
            <View style={[styles.badge1, styles.badgePosition]}>
              <View style={styles.baseBadge}>
                <Text style={[styles.label, styles.labelTypo]}>PLI Scheme</Text>
              </View>
            </View>
            <View style={[styles.badge2, styles.badgePosition]}>
              <View style={styles.baseBadge}>
                <Text style={[styles.label, styles.labelTypo]}>Centre</Text>
              </View>
            </View>
            <View style={[styles.badge3, styles.badgePosition]}>
              <View style={styles.baseBadge}>
                <Text style={[styles.label, styles.labelTypo]}>Tag 4</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.rectangleParent, styles.news3ChildPosition]}>
          <View style={[styles.groupChild, styles.news3ItemPosition]}>
            <Text style={[styles.relatedArticles, styles.timeTypo]}>
              Related Articles
            </Text>
            <Image
              style={[styles.groupItem, styles.groupLayout]}
              resizeMode="cover"
              source={require('../../assets/news1.png')}
            />
            <Text style={[styles.centerReceivesSeven1, styles.centerTypo1]}>
              Center receives seven bids for PLI scheme: RIL, among others...
            </Text>
            <Text style={[styles.centerRecievesFor1, styles.centerTypo]}>
              Center recieves for seven bids for PLI schemeCenter....
            </Text>
            <Image
              style={[styles.groupInner, styles.groupInnerPosition]}
              resizeMode="cover"
              source={require('../../assets/news1.png')}
            />
            <Text
              style={[styles.centerReceivesSeven2, styles.groupInnerPosition]}>
              Center receives seven bids for PLI scheme: RIL, among others...
            </Text>
            <Text style={[styles.centerRecievesFor2, styles.centerTypo]}>
              Center recieves for seven bids for PLI schemeCenter....
            </Text>
            <Image
              style={[styles.rectangleIcon, styles.rectangleIconPosition]}
              resizeMode="cover"
              source={require('../../assets/news1.png')}
            />
            <Text
              style={[
                styles.centerReceivesSeven3,
                styles.rectangleIconPosition,
              ]}>
              Center receives seven bids for PLI scheme: RIL, among others...
            </Text>
            <Text style={[styles.centerRecievesFor3, styles.centerTypo]}>
              Center recieves for seven bids for PLI schemeCenter....
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.wrapper, styles.wrapperLayout]}
          onPress={() => {}}>
          <Image style={styles.icon} resizeMode="cover" source="Frame 7.png" />
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  news3ChildPosition: {
    width: '100%',
  },
  sevenBidsTypo: {
    color: '#137a5f',
    fontFamily: 'NotoSans-Bold',
    fontWeight: '700',
  },
  textTypo: {
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
  },
  news3ItemPosition: {
    width: '100%',
  },
  timeTypo: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    position: 'absolute',
  },
  groupLayout: {
    height: 85,
    width: 120,
    borderRadius: 8,
    left: 16,
  },
  centerTypo1: {
    width: 233,
    left: 144,
    color: '#fff',
    fontSize: 14,
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
  },
  centerTypo: {
    color: '#eceef0',
    lineHeight: 18,
    width: 233,
    left: 144,
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
    textAlign: 'left',
    position: 'absolute',
  },
  groupInnerPosition: {
    top: 159,
    position: 'absolute',
  },
  rectangleIconPosition: {
    top: 268,
    position: 'absolute',
  },
  iconLayout: {
    height: 16,
    width: 16,
  },
  badgePosition: {
    flexDirection: 'row',
  },
  labelTypo: {
    fontFamily: 'NotoSans-Medium',
    fontWeight: '500',
    lineHeight: 16,
    fontSize: 14,
    textAlign: 'left',
  },
  wrapperLayout: {
    width: 24,
    position: 'absolute',
  },
  iconPosition: {
    top: 60,
    height: 16,
    width: 16,
    position: 'absolute',
  },
  news3Child: {
    top: 88,
    height: 195,
  },
  centerReceivesSeven: {
    fontSize: 20,
    color: '#1b2533',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
  },
  centerRecievesFor: {
    color: '#242f3e',
    fontFamily: 'NotoSans-Regular',
  },
  sevenBids: {
    textDecorationLine: 'underline',
  },
  text: {
    color: '#445164',
    width: '60%',
  },
  pliSchemeCenterRecievesFor: {
    textDecorationLine: 'underline',
  },
  centerRecievesForContainer: {
    fontSize: 14,
    width: '100%',
    textAlign: 'left',
  },
  apr19th2024: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
    textAlign: 'left',
  },
  groupChild: {
    backgroundColor: '#000',
    height: 369,
  },
  relatedArticles: {
    top: 16,
    lineHeight: 20,
    fontFamily: 'NotoSans-Bold',
    fontWeight: '700',
    color: '#fff',
    left: 16,
  },
  groupItem: {
    top: 50,
    position: 'absolute',
  },
  centerReceivesSeven1: {
    top: 50,
    position: 'absolute',
  },
  centerRecievesFor1: {
    top: 93,
  },
  groupInner: {
    height: 85,
    width: 120,
    borderRadius: 8,
    left: 16,
  },
  centerReceivesSeven2: {
    width: 233,
    left: 144,
    color: '#fff',
    fontSize: 14,
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
  },
  centerRecievesFor2: {
    top: 202,
  },
  rectangleIcon: {
    height: 85,
    width: 120,
    borderRadius: 8,
    left: 16,
  },
  centerReceivesSeven3: {
    width: 233,
    left: 144,
    color: '#fff',
    fontSize: 14,
    textAlign: 'left',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
  },
  centerRecievesFor3: {
    top: 311,
  },
  rectangleParent: {
    height: 369,
  },
  shareIcon: {
    marginLeft: 16,
    marginTop: 16,
  },
  bookmark2Icon: {
    marginLeft: 16,
    marginTop: 16,
  },
  playIcon: {
    marginTop: 16,
  },
  label: {
    color: '#445164',
  },
  baseBadge: {
    borderRadius: 50,
    backgroundColor: '#d1eae4',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
  },
  badge1: {
    flexDirection: 'row',
  },
  badge2: {
    flexDirection: 'row',
  },
  badge3: {
    flexDirection: 'row',
  },
  readMoreOn: {
    marginTop: 16,
    color: '#323e4f',
  },
  news3Item: {
    height: 300,
  },
  batteryIcon: {
    marginTop: 0.23,
    right: 15,
    height: 11,
    top: '50%',
  },
  wifiIcon: {
    width: 15,
    height: 11,
  },
  cellularIcon: {
    width: 17,
    height: 11,
  },
  time: {
    marginTop: -0.1,
    left: 23,
    width: 30,
    height: 17,
    top: '50%',
    fontFamily: 'NotoSans-SemiBold',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0,
  },
  statusbariphoneXLightBackg: {
    height: '3.03%',
    top: '0%',
    right: '0%',
    bottom: '96.97%',
    left: '0%',
    position: 'absolute',
    width: '100%',
  },
  icon: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    top: 56,
    height: 24,
    left: 16,
  },

  news3: {
    backgroundColor: '#eceef0',
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
});

export default ViewNewsFullDetails;

import React, { useState,useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Image ,ActivityIndicator,RefreshControl} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { get } from "../../services/axios";
import { urlConstants } from "../../constants/urlConstants";
import { useNavigation } from "@react-navigation/native";

const AllNews = () => {
    const [businessNews,setBusinessNews]=useState();
    const [scienceNews,setScienceNews]=useState();
    const [sportsNews,setSportsNews]=useState();
    const [healthNews,setHealthNews]=useState();
    const [technologyNews,setTechnologyNews]=useState();
    const [loading,setIsLoading] = useState(false);

    const navigation = useNavigation();

    useEffect(()=>{
    getBusinessData();
    getHealthData();
    getScienceData();
    getSportsData();
    getTechnologyData();
   },[])

    const getBusinessData = ()=>{
        setIsLoading(true);
        const params={
            category:'business',
			pageSize:2
		}
		get(`${urlConstants.news}category=${params.category}&pageSize=${params.pageSize}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.slice(0,2).map(item => ({
				title:item.title,
				description:item.description?item.description:item.title,
				image:item.urlToImage,
                content:item.content
			}))
				setBusinessNews(formattedData)
		})
		.catch(err => {
            setIsLoading(false);
            console.log('news',err)})
    }
    const getHealthData = ()=>{
        setIsLoading(true);
        const params={
            category:'health',
			pageSize:1		}
		get(`${urlConstants.news}category=${params.category}&pageSize=${params.pageSize}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.slice(0,1).map(item => ({
				title:item.title,
				description:item.description?item.description:item.title,
				image:item.urlToImage,
                content:item.content
			}))
				setHealthNews(formattedData)
		})
		.catch(err => {
            setIsLoading(false);
            console.log('news',err)}
        )
    };
    const getScienceData = ()=>{
        setIsLoading(true);
        const params={
            category:'science',
			pageSize:2		}
		get(`${urlConstants.news}category=${params.category}&pageSize=${params.pageSize}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.slice(0,2).map(item => ({
				title:item.title,
				description:item.description?item.description:item.title,
				image:item.urlToImage,
                content:item.content
			}))
            setScienceNews(formattedData)
		})
		.catch(err => {
            setIsLoading(false);
            console.log('news',err)}
        )
    }
    const getSportsData = ()=>{
        setIsLoading(true);
        const params={
            category:'sports',
			pageSize:1		
        }
		get(`${urlConstants.news}category=${params.category}&pageSize=${params.pageSize}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.slice(0,1).map(item => ({
				title:item.title,
				description:item.description?item.description:item.title,
				image:item.urlToImage,
                content:item.content
			}))
			setSportsNews(formattedData)
		})
		.catch(err => {
            setIsLoading(false);
            console.log('news',err)}
        )
    }
    const getTechnologyData = ()=>{
        setIsLoading(true);
        const params={
            category:'technology',
			pageSize:2		}
		get(`${urlConstants.news}category=${params.category}&pageSize=${params.pageSize}`)
		.then((res) => {
            setIsLoading(false);
			const formattedData = res?.slice(0,2).map(item => ({
				title:item.title,
				description:item.description?item.description:item.title,
				image:item.urlToImage,
                content:item.content
			}))
            setTechnologyNews(formattedData)
		})
		.catch(err => {
            setIsLoading(false)
            console.log('news',err)})
    }
    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0158aa" />
                    <Text style={{ color: '#000', marginTop: 10,fontFamily:'NotoSans-SemiBold' }}>Please wait, data is loading</Text>
                </View>
            )}
        <ScrollView>
            <View style={styles.news2}>
                <View style={[styles.news2Child, styles.news2ChildPosition]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
                        <Text style={[styles.business, styles.businessTypo]}>Business</Text>
                        <Pressable onPress={()=>navigation.navigate('Business')}>
                        <View style={[styles.button2, styles.buttonPosition]}>
                            <View style={styles.baseButton}>
                                <Text style={[styles.text1, styles.textTypo]}>View All</Text>
                            </View>
                        </View>
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginRight: 16 }}>
                        {businessNews?.length > 0 && businessNews.map((item, index) => (
                            <View key={index} style={{ width: '48%', }}>
                                <Pressable style={[styles.news2Item, styles.news2InnerLayout]} onPress={() => navigation.navigate('ViewFullDetails',{item:item})} >
                                    <Image style={[styles.news2Child1, styles.groupChildLayout1]} resizeMode="cover" 
                                    source={
                                        item.image ? { uri: item.image }
                                            : require('../../assets/news1.png')
                                    }
                                    />
                                    <Text style={[styles.centerReceivesSeven1, styles.centerPosition2]}numberOfLines={3}>{item?.title}</Text>
                                    <Text style={[styles.centerRecievesFor, styles.hourTypo]} numberOfLines={3}ellipsizeMode="tail">{item?.description}</Text>
                                </Pressable>
                            </View>))}
                    </View>
                </View>
                <View style={[styles.news2Child2, styles.childLayout1]} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 }}>
                        <Text style={[styles.markets, styles.marketsTypo]}>Health</Text>
                        <Pressable onPress={()=>navigation.navigate('Health')}>
                        <View style={[styles.button, styles.buttonPosition]}>
                            <View style={styles.baseButton}>
                                <Text style={[styles.text1, styles.textTypo]}>View All</Text>
                            </View>
                        </View>
                        </Pressable>
                    </View>
                    {healthNews?.length>0 && <View style={{ borderTopEndRadius: 16, marginLeft: 16, marginRight: 16 }}>
                        <Image style={[styles.news2Child3, styles.childLayout]} resizeMode="cover" 
                        source={
                            healthNews[0]?.image ? { uri: healthNews[0].image }
                                : require('../../assets/news1.png')
                        }
                        />
                        <Text style={[styles.centerReceivesSeven8, styles.centerTypo2]}numberOfLines={3}>{healthNews[0]?.title}</Text>
                        <Pressable style={styles.centerRecievesForContainer}  onPress={() => navigation.navigate('ViewFullDetails',{item:healthNews[0]})}>
                            <Text style={styles.textTypo2}>{healthNews[0]?.description}
                                <Text style={styles.readMore}>READ MORE</Text>
                            </Text>
                        </Pressable>
                    </View>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
                        <Text style={[styles.hourAgo, styles.iconPosition2]}>1 Hour ago</Text>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Image style={[styles.shareIcon, styles.shareIconLayout]} resizeMode="cover" source={require('../../assets/shareIcon.png')} />
                            <Image style={[styles.bookmark2Icon, styles.bookmark2IconLayout]} resizeMode="cover" source={require('../../assets/bookmark.png')} />
                            <Image style={[styles.playIcon, styles.playIconLayout]} resizeMode="cover" source={require('../../assets/play.png')} />
                        </View>
                    </View>
                </View>
                <View style={[styles.rectangleView, styles.news2ChildPosition]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
                        <Text style={[styles.business1, styles.businessTypo]}>Science</Text>
                        <Pressable onPress={()=>navigation.navigate('Science')}>
                        <View style={[styles.button1, styles.buttonPosition]}>
                            <View style={styles.baseButton}>
                                <Text style={[styles.text2, styles.textTypo]}>View All</Text>
                            </View>
                        </View>
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginRight: 16 }}>
                        {scienceNews?.length > 0 && scienceNews.map((item, index) => (
                            <View key={index} style={{ width: '48%', }}>
                                <Pressable style={[styles.news2Item, styles.news2InnerLayout]}  onPress={() => navigation.navigate('ViewFullDetails',{item:item})} >
                                    <Image style={[styles.news2Child1, styles.groupChildLayout1]} resizeMode="cover" 
                                    source={
                                        item.image ? { uri: item.image }
                                            : require('../../assets/news1.png')
                                    } />
                                    <Text style={[styles.centerReceivesSeven1, styles.centerPosition2]}numberOfLines={3}>{item?.title}</Text>
                                    <Text style={[styles.centerRecievesFor, styles.hourTypo]}numberOfLines={3}>{item?.description}</Text>
                                </Pressable>
                            </View>))}
                    </View>
                </View>
                <View style={[styles.news2Child2, styles.childLayout1]} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 }}>
                        <Text style={[styles.markets, styles.marketsTypo]}>Sports</Text>
                        <Pressable onPress={()=>navigation.navigate('Sports')}>
                        <View style={[styles.button, styles.buttonPosition]}>
                            <View style={styles.baseButton}>
                                <Text style={[styles.text1, styles.textTypo]}>View All</Text>
                            </View>
                        </View>
                        </Pressable>
                    </View>
                    {sportsNews?.length >0&&<View style={{ borderTopEndRadius: 16, marginLeft: 16, marginRight: 16 }}>
                        <Image style={[styles.news2Child3, styles.childLayout]} resizeMode="cover" 
                        source={
                            sportsNews[0]?.image ? { uri: sportsNews[0].image }
                                : require('../../assets/news1.png')
                        }/>
                        <Text style={[styles.centerReceivesSeven8, styles.centerTypo2]}numberOfLines={3}>{sportsNews[0]?.title}</Text>
                        <Pressable style={styles.centerRecievesForContainer}  onPress={() => navigation.navigate('ViewFullDetails',{item:sportsNews[0]})}>
                            <Text style={styles.textTypo2}>{sportsNews[0]?.description}
                                <Text style={styles.readMore}>READ MORE</Text>
                            </Text>
                        </Pressable>
                    </View>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
                        <Text style={[styles.hourAgo, styles.iconPosition2]}>1 Hour ago</Text>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Image style={[styles.shareIcon, styles.shareIconLayout]} resizeMode="cover" source={require('../../assets/shareIcon.png')} />
                            <Image style={[styles.bookmark2Icon, styles.bookmark2IconLayout]} resizeMode="cover" source={require('../../assets/bookmark.png')} />
                            <Image style={[styles.playIcon, styles.playIconLayout]} resizeMode="cover" source={require('../../assets/play.png')} />
                        </View>
                    </View>
                </View>
                <View style={[styles.news2Child, styles.news2ChildPosition]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
                        <Text style={[styles.business, styles.businessTypo]}>Technology</Text>
                        <Pressable onPress={()=>navigation.navigate('Technology')}>
                        <View style={[styles.button2, styles.buttonPosition]}>
                            <View style={styles.baseButton}>
                                <Text style={[styles.text1, styles.textTypo]}>View All</Text>
                            </View>
                        </View>
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginRight: 16 }}>
                        {technologyNews?.length > 0 && technologyNews.map((item, index) => (
                            <View key={index} style={{ width: '48%', }}>
                                <Pressable style={[styles.news2Item, styles.news2InnerLayout]}  onPress={() => navigation.navigate('ViewFullDetails',{item:item})} >
                                    <Image style={[styles.news2Child1, styles.groupChildLayout1]} resizeMode="cover" 
                                    source={
                                        item.image ? { uri: item.image }
                                            : require('../../assets/news1.png')
                                    } />
                                    <Text style={[styles.centerReceivesSeven1, styles.centerPosition2]}numberOfLines={3}>{item?.title}</Text>
                                    <Text style={[styles.centerRecievesFor, styles.hourTypo]}numberOfLines={3}>{item?.description}</Text>
                                </Pressable>
                            </View>))}
                    </View>
                </View>

                <View style={[styles.rectangleParent3, styles.groupChild13Layout]}>
                    <View style={[styles.groupChild13, styles.groupChild13Layout]} >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Text style={[styles.relatedArticles, styles.businessTypo]}>Related Articles</Text>
                            <View style={[styles.button2, styles.buttonPosition]}>
                                <View style={styles.baseButton}>
                                    <Text style={[styles.text1, styles.textTypo]}>View All</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row',marginTop:16 }}>
                            <Image style={[styles.groupChild14, styles.groupChildLayout]} resizeMode="cover" source={require('../../assets/news1.png')} />
                            <View style={{marginLeft:8,flex:2}}>
                                <Text style={[styles.centerReceivesSeven10, styles.centerTypo1]}>Center receives seven bids for PLI scheme: RIL, among others...</Text>
                                <Text style={[styles.centerRecievesFor8, styles.centerTypo]}>Center recieves for seven bids for PLI schemeCenter....</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row',marginTop:16  }}>
                            <Image style={[styles.groupChild14, styles.groupChildLayout]} resizeMode="cover" source={require('../../assets/news1.png')} />
                            <View style={{marginLeft:8,flex:2}}>
                                <Text style={[styles.centerReceivesSeven10, styles.centerTypo1]}>Center receives seven bids for PLI scheme: RIL, among others...</Text>
                                <Text style={[styles.centerRecievesFor8, styles.centerTypo]}>Center recieves for seven bids for PLI schemeCenter....</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row',marginTop:16  }}>
                            <Image style={[styles.groupChild14, styles.groupChildLayout]} resizeMode="cover" source={require('../../assets/news1.png')} />
                            <View style={{marginLeft:8,flex:2}}>
                                <Text style={[styles.centerReceivesSeven10, styles.centerTypo1]}>Center receives seven bids for PLI scheme: RIL, among others...</Text>
                                <Text style={[styles.centerRecievesFor8, styles.centerTypo]}>Center recieves for seven bids for PLI schemeCenter....</Text>
                            </View>
                        </View>

                    </View>
                </View>
                <Pressable style={[styles.wrapper, styles.wrapperLayout]} onPress={() => { }}>
                    <Image style={styles.icon} resizeMode="cover" source="Frame 7.png" />
                </Pressable>
            </View>
        </ScrollView>
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
    news2ChildPosition: {
        width: '100%',
    },
    businessTypo: {
        textAlign: "center",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        lineHeight: 20,
        fontSize: 14
    },
    news2InnerLayout: {
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    groupChildPosition: {
        left: 205,
        width: 172
    },
    centerTypo6: {
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        position: "absolute"
    },
    groupChildLayout1: {
        height: 101,
    },
    centerPosition2: {
        width: '93%'
    },
    hourTypo: {
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        color: "#445164",
        textAlign: "left",
        letterSpacing: 0,
        marginLeft: 8
    },
    rectanglePosition: {
        top: 864,
        height: 226,
        position: "absolute"
    },
    centerTypo5: {
        left: 8,
        top: 117,
        textAlign: "left",
        color: "#323e4f",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        fontSize: 14,
        position: "absolute"
    },
    centerPosition: {
        top: 178,
        left: 8,
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
        letterSpacing: 0,
        position: "absolute"
    },
    groupViewPosition: {
        top: 1106,
        height: 226,
        position: "absolute"
    },
    groupChild6Layout: {
        height: 286,
        width: 393,
        left: 0,
        position: "absolute"
    },
    centerTypo4: {
        top: 161,
        textAlign: "left",
        color: "#323e4f",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        fontSize: 14,
        position: "absolute"
    },
    centerTypo3: {
        top: 222,
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
        letterSpacing: 0,
        position: "absolute"
    },
    childLayout1: {
        width: '100%',
    },
    marketsTypo: {
        color: "#445164",
        textAlign: "center",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        lineHeight: 20,
        fontSize: 14,
    },
    childLayout: {
        height: 142,
        width: '100%',
    },
    centerTypo2: {
        fontSize: 16,
        width: '100%',
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        marginTop: 8
    },
    shareIconLayout: {
        height: 16,
        width: 16,
    },
    bookmark2IconLayout: {
        height: 16,
        width: 16
    },
    playIconLayout: {
        height: 16,
        width: 16
    },
    textTypo2: {
        width: '100%',
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
        letterSpacing: 0
    },
    iconPosition1: {
        top: 366,
        position: "absolute"
    },
    groupChild13Layout: {
        height: 369,
        width: '100%',
    },
    groupChildLayout: {
        height: 85,
        width: 120,
        borderRadius: 8,
    },
    centerTypo1: {
        width: 'auto',
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        fontSize: 14
    },
    centerTypo: {
        lineHeight: 18,
        width: 233,
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
    },
    groupChild15Position: {
        top: 159,
        position: "absolute"
    },
    groupChild16Position: {
        top: 268,
        position: "absolute"
    },
    buttonPosition: {
        flexDirection: "row",
    },
    textTypo: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "700",
        textAlign: "center"
    },
    tabBarPosition: {
        height: 40,
        backgroundColor: "#0158aa",
    },
    wrapperLayout: {
        height: 24,
        width: 24,
    },
    timePosition: {
        top: "50%",
        position: "absolute"
    },
    iconPosition: {
        top: 60,
        height: 16,
        width: 16,
        position: "absolute"
    },
    tabFlexBox: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        flex: 1
    },
    news2Child: {
        height: 294,
        backgroundColor: "#fff"
    },
    business: {
        color: "#242f3e",
        textAlign: "center",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
    },
    news2Item: {
        width: '100%',
        borderColor: "#d8d8d8",
        borderWidth: 1,
        paddingBottom:8
    },
    news2Inner: {
        width: 172,
        height: 226,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        backgroundColor: "#fff",
        position: "absolute",
        borderColor: "#d8d8d8",
        top: 172
    },
    centerReceivesSeven: {
        width: 156,
        color: "#323e4f",
        top: 289,
        textAlign: "left",
        letterSpacing: 0,
        fontSize: 14,
        left: 213
    },
    rectangleIcon: {
        width: 173,
        top: 172,
        left: 16
    },
    news2Child1: {
        width: '100%',
    },
    centerReceivesSeven1: {
        width: '90%',
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        color: "#323e4f",
        letterSpacing: 0,
        fontSize: 14,
        marginLeft: 8
    },
    centerRecievesFor: {
        color: "#445164",
        fontSize: 12,
        width: '90%',
    },
    centerRecievesFor1: {
        color: "#445164",
        fontSize: 12,
        width: '100%',
    },
    rectangleView: {
        backgroundColor: "#fff",
        paddingBottom: 16

    },
    business1: {
        color: "#242f3e",
        textAlign: "center",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
    },
    groupChild: {
        borderColor: "#d6dae1",
        top: 0,
        width: 173,
        left: 0
    },
    groupItem: {
        top: 0,
        width: 173,
        left: 0
    },
    centerReceivesSeven2: {
        width: 157
    },
    centerRecievesFor2: {
        width: 157
    },
    rectangleParent: {
        width: 173,
        left: 16
    },
    groupInner: {
        top: 0,
        width: 172,
        borderColor: "#d8d8d8",
        height: 226,
        borderWidth: 1,
        left: 0
    },
    centerReceivesSeven3: {
        width: 156
    },
    groupChild1: {
        top: 0,
        width: 172,
        left: 0
    },
    centerRecievesFor3: {
        width: 156
    },
    rectangleGroup: {
        width: 172,
        left: 205
    },
    groupChild2: {
        top: 0,
        width: 173,
        borderColor: "#d8d8d8",
        height: 226,
        borderWidth: 1,
        left: 0
    },
    rectangleContainer: {
        width: 173,
        left: 16
    },
    groupView: {
        width: 172,
        left: 205
    },
    groupChild6: {
        top: 0,
        backgroundColor: "#fff"
    },
    business2: {
        top: 16,
        color: "#242f3e",
        textAlign: "center",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        left: 16,
        position: "absolute"
    },
    groupChild7: {
        top: 44,
        width: 173,
        borderColor: "#d8d8d8",
        height: 226,
        borderWidth: 1,
        left: 16
    },
    groupChild8: {
        top: 44,
        width: 172,
        height: 226,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        backgroundColor: "#fff",
        position: "absolute",
        borderColor: "#d8d8d8"
    },
    centerReceivesSeven6: {
        width: 156,
        left: 213
    },
    groupChild9: {
        top: 44,
        width: 173,
        left: 16
    },
    groupChild10: {
        top: 44,
        width: 172,
        left: 205
    },
    centerReceivesSeven7: {
        width: 157,
        left: 24
    },
    centerRecievesFor6: {
        width: 157,
        left: 24
    },
    centerRecievesFor7: {
        width: 156,
        left: 213
    },
    rectangleParent1: {
        top: 1764
    },
    news2Child2: {
        backgroundColor: "#fff3dc",
    },
    readMore: {
        textDecorationLine: "underline"
    },
    hourAgo: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
        letterSpacing: 0,
        flex: 2
    },
    
    groupChild11: {
        backgroundColor: "#fff3dc",
        top: 0
    },
    markets1: {
        top: 16
    },
    groupChild12: {
        top: 44
    },
    centerReceivesSeven9: {
        top: 202
    },
    centerRecievesForContainer1: {
        top: 254,
        left: 16,
        position: "absolute"
    },
    hourAgo1: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        fontSize: 12,
        textAlign: "left",
        letterSpacing: 0,
        left: 16
    },
    shareIcon1: {
        height: 16,
        width: 16,
        left: 360
    },
    bookmark2Icon1: {
        left: 320,
        height: 16,
        width: 16
    },
    playIcon1: {
        left: 280,
        height: 16,
        width: 16
    },
    rectangleParent2: {
        top: 1348
    },
    groupChild13: {
        backgroundColor: "#fff3dc",
        padding:16
    },
    relatedArticles: {
        color: "#445164",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        textAlign: "center",
    },
    groupChild14: {
        flex:1
    },
    
    groupChild15: {
        height: 85,
        width: 120,
        borderRadius: 8,
        left: 16
    },
    centerReceivesSeven11: {
        width: 233,
        left: 144,
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        fontSize: 14
    },
    centerRecievesFor9: {
        top: 202
    },
    groupChild16: {
        height: 85,
        width: 120,
        borderRadius: 8,
        left: 16
    },
    centerReceivesSeven12: {
        width: 233,
        left: 144,
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        fontSize: 14
    },
    centerRecievesFor10: {
        top: 311
    },
    text1: {
        lineHeight: 16,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        fontSize: 12,
        color: "#445164"
    },
    baseButton: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    button: {
        flexDirection: "row"
    },
    text2: {
        color: "#000",
        lineHeight: 16,
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        fontSize: 12
    },
    button1: {
        flexDirection: "row"
    },
    button2: {
        flexDirection: "row"
    },
    news2Child4: {
        left: 348,
        width: 45
    },
    icon: {
        height: "100%",
        width: "100%"
    },
    refresh2: {
        alignSelf: 'center'
    },
    news2Child5: {
        height: 88,
        top: 0
    },
    batteryIcon: {
        marginTop: 1.33,
        right: 15,
        height: 11,
        width: 24,
        top: "50%"
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
        marginTop: 1,
        left: 23,
        width: 30,
        height: 17,
        color: "#fff",
        top: "50%",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        letterSpacing: 0,
        textAlign: "center",
        fontSize: 14
    },
    statusbariphoneXLightBackg: {
        height: "1.83%",
        top: "0%",
        right: "0%",
        bottom: "98.17%",
        left: "0%",
        position: "absolute",
        width: "100%"
    },
    wrapper: {
        top: 56,
        left: 16
    },
    news: {
        top: 53,
        left: 56,
        fontSize: 20,
        lineHeight: 29,
        color: "#fff"
    },
    searchNormalIcon: {
        left: 361
    },
    notificationBellIcon: {
        left: 321
    },
    text4: {
        color: "#fff",
        fontFamily: "NotoSans-Bold",
        fontWeight: "700",
        textAlign: "center"
    },
    tab: {
        borderColor: "#fff",
        borderBottomWidth: 4,
        borderStyle: "solid",
        paddingVertical: 10,
        paddingHorizontal: 8
    },
    text5: {
        color: "#fff",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14
    },
    tab1: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8
    },
    text7: {
        opacity: 0.4,
        color: "#fff",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        lineHeight: 20,
        fontSize: 14
    },
    tabBar: {
        width: '100%',
        flexDirection: "row",
    },
    news2: {
        backgroundColor: "#eceef0",
        overflow: "hidden",
        flex: 1,
        width: "100%"
    }
});

export default AllNews;

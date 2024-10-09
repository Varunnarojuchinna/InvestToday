import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import Splash from 'react-native-splash-screen';

const images = [
    require("./../assets/advisory.png"),
    require('./../assets/news.png'),
    require('./../assets/monitorStocks.png'),
];

const ActiveDotImages = [
    require("./../assets/activeDot1.png"),
    require('./../assets/activeDot2.png'),
    require('./../assets/activeDot3.png'),
];

const SplashScreen = ({ navigation }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        Splash.hide();

        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const handleSkip = () => {
        navigation.navigate('LoadingScreen')
    };
    return (
        <View style={styles.container}>
            <Image style={[styles.shapeIcon, styles.iconLayout]} resizeMode="stretch" source={require("./../assets/logoWhite.png")} />

            <Image source={images[activeIndex]} style={styles.image} />
            {activeIndex === 0 && (
                <View style={styles.advisoryContainer}>
                    <Text style={styles.advisoryBoldText}>Advisory</Text>
                    <Text style={styles.advisoryText}>where every decision counts. Get real-time insights and expert analysis for your financial success.</Text>
                </View>
            )}
            {activeIndex === 1 && (
                <View style={styles.newsContainer}>
                    <Text style={styles.newsBoldText}>News</Text>
                    <Text style={styles.newsText}>Stay ahead with Invest Today's latest stock updates. Breaking news, expert analysis, and market trends at your fingertips.</Text>
                </View>
            )}
            {activeIndex === 2 && (
                <View style={styles.monitorContainer}>
                    <Text style={styles.monitorBoldText}>Monitor the stocks</Text>
                    <Text style={styles.monitorText}>Track your investments effortlessly, Real-time updates, customisable alerts, and insightful analytics for smarter decisions.</Text>
                </View>
            )}
            <Image source={ActiveDotImages[activeIndex]} />
            <Pressable style={[styles.baseButton, styles.baseFlexBox]} onPress={() => navigation.navigate('SignUp')}>
                <Text style={[styles.text, styles.textTypo]}>Get Started</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => { handleSkip() }}>
                <View style={styles.baseFlexBox}>
                    <Text style={[styles.text1, styles.textTypo]}>Skip for now</Text>
                </View>
            </Pressable>
        </View>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shapeIcon: {
        alignSelf: 'center',
        width: 180,
        height: 70
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: "#fff"
    },
    text1: {
        fontSize: 16,
        lineHeight: 24,
        color: "#6fb72c",
        fontFamily: "NotoSans-Medium",
        fontWeight: "500"
    },
    textTypo: {
        fontFamily: "NotoSans-Medium",
        fontWeight: "500",
        textAlign: "center"
    },
    image: {
        width: '60%',
        height: height * 0.4,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    advisoryContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    advisoryBoldText: {
        lineHeight: 31,
        fontWeight: "600",
        fontFamily: "NotoSans-SemiBold",
        textAlign: "center",
        color: "#fff",
        fontSize: 20
    },
    advisoryText: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "NotoSans-Regular",
        color: "#f5f6f7",
        marginTop: 8,
        textAlign: "center",
        width: 290
    },
    newsContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    newsBoldText: {
        lineHeight: 31,
        fontWeight: "600",
        fontFamily: "NotoSans-SemiBold",
        textAlign: "center",
        color: "#fff",
        fontSize: 20
    },
    newsText: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "NotoSans-Regular",
        color: "#f5f6f7",
        marginTop: 8,
        textAlign: "center",
        width: 290,
        overflow: 'hidden',
        flexWrap: 'wrap'
        
    },
    monitorContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    monitorBoldText: {
        lineHeight: 31,
        fontWeight: "600",
        fontFamily: "NotoSans-SemiBold",
        textAlign: "center",
        color: "#fff",
        fontSize: 20
    },
    monitorText: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "NotoSans-Regular",
        color: "#f5f6f7",
        marginTop: 8,
        textAlign: "center",
        width: 290,
        overflow: 'hidden',
    },
    paginationContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#90ee90',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        marginTop: 40,
        flexDirection: "row"
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 10,
    },
    baseButton: {
        backgroundColor: "#6fb72c",
        width: 173,
        paddingHorizontal: 32,
        paddingVertical: 16,
        marginTop: 49
    },
    baseFlexBox: {
        justifyContent: "center",
        borderRadius: 8,
        flexDirection: "row",
        overflow: "hidden",
        alignItems: "center"
    },
});

export default SplashScreen;

import React,{useEffect} from "react";
import {Image, StyleSheet, Text, View} from "react-native";
import { CommonActions } from '@react-navigation/native';

const Loadingscreen = ({navigation}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
		navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: 'Dashboard' }],
			})
		);
		}, 1000);
	
		return () => clearTimeout(timer);
	  }, [navigation]);
	  
  	return (
    		<View style={[styles.loadingscreen,{flexDirection:'column'}]}>
      			        <Image style={styles.frameChild} resizeMode='contain' source={require('./../assets/logo.png')} />
        				<Image style={[styles.shapeIcon]} resizeMode="cover" source={require('./../assets/loading.png')} />
        				<Text style={[styles.settingUpYour, styles.timeTypo]}>Launching to Dashboard.....</Text>  			
        		
    		</View>);
};

const styles = StyleSheet.create({
  	shapeIconPosition: {
    		top: 0,
    		position: "absolute"
  	},
  	investPosition: {
    		left: "0%",
    		top: "0%"
  	},
  	timeTypo: {
    		textAlign: "center",
    		fontSize: 14,
  	},
  	todayTypo: {
    		textAlign: "left",
    		fontFamily: "MagistralCondW08-Medium",
    		position: "absolute"
  	},
  	loadingscreenChild: {
    		width: 393,
    		left: 0,
    		height: 852
  	},
  	batteryIcon: {
    		marginTop: -4.17,
    		right: 15,
    		width: 24,
    		height: 11,
    		top: "50%",
    		position: "absolute"
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
    		marginTop: -5.5,
    		left: 23,
    		letterSpacing: 0,
    		fontWeight: "600",
    		fontFamily: "NotoSans-SemiBold",
    		color: "#fff",
    		width: 30,
    		height: 17,
    		top: "50%"
  	},
  	statusbariphoneXLightBackg: {
    		height: "5.99%",
    		right: "0%",
    		bottom: "94.01%",
    		position: "absolute",
    		width: "100%"
  	},
  	shapeIcon: {
    		marginTop:20,
    		width: 19,
    		height: 19
  	},
  	settingUpYour: {
    		marginTop: 8,
    		lineHeight: 20,
    		fontWeight: "500",
    		fontFamily: "NotoSans-Medium",
    		color: "#697483",
  	},
  	content: {
    		top: 384,
    		left: 112,
    		width: 171,
    		height: 55,
            alignItems:'center'
  	},
  	frameChild: {
    		width: 62,
    		height: 73
  	},
  	invest: {
    		fontSize: 60,
    		color: "#16896b",
    		left: "0%",
    		top: "0%"
  	},
  	today: {
    		top: "71.91%",
    		left: "65.77%",
    		fontSize: 20,
    		color: "#8f97a2"
  	},
  	name: {
    		width: 149,
    		height: 89,
    		marginLeft: 8
  	},
  	groupParent: {
    		flexDirection: "row",
    		alignItems: "center",
    		padding: 8,
    		left: 0
  	},
  	logologoWhite: {
    		top: 222,
    		left: 75,
    		width: 235,
    		height: 105,
    		position: "absolute"
  	},
  	loadingscreen: {
    		backgroundColor: "#080808",
    		flex: 1,
    		width: "100%",
            alignItems:'center',
            justifyContent:'center'
  	}
});

export default Loadingscreen;

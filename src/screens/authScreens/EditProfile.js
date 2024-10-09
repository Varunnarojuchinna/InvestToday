import * as React from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as authAction from '../../redux/actions/authAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SourceType } from "../../constants/appConstants";

const EditProfile = (props) => {
    const { userInfo } = props;
    const navigation = useNavigation();

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword'); 
    };

    const handlePersonalDetails = () => {
        navigation.navigate('PersonalDetails');
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.option} onPress={handlePersonalDetails}>
                <Image style={styles.icon} source={require('../../assets/profileFill.png')} />
                <Text style={styles.optionText}>Personal Details</Text>
            </Pressable>
           {userInfo?.userDetails.source_type!=SourceType.CREATE_USER_GOOGLE_SIGN_IN &&
            <Pressable style={styles.option} onPress={handleChangePassword}>
                <Image style={styles.icon} source={require('../../assets/securityProfile.png')} />
                <Text style={styles.optionText}>Change Password</Text>
            </Pressable>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 15,
        paddingTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    optionText: {
        fontFamily: 'NotoSans-Regular',
        color: "#323e4f",
        alignSelf: "stretch",
        fontWeight: "500",
        textAlign: "left",
        fontSize: 18
    },
});

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const ActionCreators = Object.assign({}, authAction);
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
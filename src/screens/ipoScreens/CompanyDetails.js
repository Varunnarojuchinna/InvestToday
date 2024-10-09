import React,{useState} from "react";
import { StyleSheet, View, Text, Image, Pressable,Alert,ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { convertToLakhs, toInitCaps } from "../../services/helpers";
import RNBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';

const CompanyDetails = (props) => {
    const { item } = props.route.params;
    const [loading, setLoading] = useState(false);
        const downloadPDF = async (name) => {
        try {
            setLoading(true);
            let companyName
        const formatName = () => {
            companyName = name.replace(/\s+/g, '').replace(/&/g, '').replace(/ipo/i, '').toLowerCase();
            return companyName
          };
          
          const generateUrl = async () => {
            const formattedName = await formatName(name);
            return `https://storage.googleapis.com/investoday-ipos/${formattedName}.pdf`;
          };
          
          const url = await generateUrl('Effwa Infra & Research Limited IPO');

          const downloads = RNFS.DownloadDirectoryPath;
    
          if (!downloads) {
            throw new Error('Downloads directory path is undefined');
          }
    
          RNBlobUtil.config({
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              path: `${downloads}/${companyName}.pdf`,
              description: 'Downloading PDF',
            },
          })
          .fetch('GET', url)
                    .then((res) => {
                        setLoading(false);
              Alert.alert('Download Complete', 'File downloaded to: ' + res.path());
            })
            .catch((error) => {
                setLoading(false);
              console.log(error);
              Alert.alert('Download Failed', 'An error occurred while downloading the file.');
            });
        } catch (error) {
            setLoading(false);
          console.log('Error in downloadPDF:', error.message);
          Alert.alert('Error', error.message);
        }
      };    
     
    const SubscriptionDetails = ({ details }) => {
        const validDetails = Object.entries(details).filter(([key, value]) => value !== '[.]' && value !== '');

        return (
            <View style={[styles.rectangleView, styles.ipocompanyChildPosition]}>
                <View style={{ marginTop: 12 }}>
                    <Text style={[styles.subscription, styles.objectiveTypo]}>Subscription</Text>
                </View>
                <View style={[styles.ipocompanyChild1, styles.ipocompanyChildLayout1]}>
                    {validDetails.map(([key, value]) => (
                        <View key={key} style={[styles.frameParent3, styles.frameParentPosition2]}>
                            <View>
                                <Text style={styles.mbTypo}>{toInitCaps(key)}</Text>
                                <Text style={styles.textTypo}>
                                    <Text style={styles.bid}>{`Bid : `}</Text>
                                    <Text style={styles.lakhs1}>{convertToLakhs(value)} Lakhs</Text>
                                </Text>
                            </View>
                            <View style={[styles.frameChild1, styles.frameChildBorder]} />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const ObjectivesList = () => {
        return (
            <View>
            {item.ipoObjectives?.map((objective, index) => (
              <Text key={index} style={styles.stockHasFormed}>{objective}</Text>
            ))}
          </View>
        );
      };

    return (
        <ScrollView>
            <View style={styles.ipocompany}>
                <View style={[styles.ipocompanyInner, styles.ipocompanyChildPosition]}>
                    <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 12 }}>
                        <Text style={[styles.energyMissionMachineries, styles.promotersPosition]}>{item?.companyName}</Text>
                        <View style={[styles.switchTab, styles.switchTabFlexBox]}>
                            <Text style={styles.nse}>{item?.exchanges}</Text>
                        </View>
                    </View>
                    {/* <View style={[styles.electricityParent, styles.parentFlexBox1]}>
                        <Image style={styles.electricityIcon} resizeMode="cover" source={require('../../assets/service.png')} />
                        <Text style={[styles.capitalGoods, styles.may2024ToTypo]}>Capital Goods (N/A)</Text>
                    </View>
                    <View style={[styles.electricityGroup, styles.parentFlexBox1]}>
                        <Image style={styles.electricityIcon} resizeMode="cover" source={require('../../assets/service.png')} />
                        <Text style={[styles.capitalGoods, styles.may2024ToTypo]}>Engineering - Industrial Equipments (N/A)</Text>
                    </View> */}
                            <View style={[styles.stockHasFormedAWhiteMarubWrapper, {marginLeft:16}]}>
                                <Text style={styles.stockTypo}>{item?.aboutCompany}</Text>
                            </View>
                </View>
                <View style={[styles.ipocompanyChild, styles.ipocompanyChildPosition]}>
                    <Text style={[styles.offerDetails, styles.objectiveTypo, { marginTop: 16 }]}>Offer Details</Text>
                    <View style={[styles.calendarParent, styles.parentFlexBox1]}>
                        <Image style={styles.calendarIcon} resizeMode="cover" source={require('../../assets/calendarIcon.png')} />
                        <Text style={[styles.may2024To, styles.may2024ToTypo]}>{item.fromDate}{' to '}{item.toDate}</Text>
                    </View>
                    <View style={[styles.ipocompanyItem, styles.ipocompanyChildLayout1]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between',flex:1 }}>

                            <View style={[styles.frameParent, styles.frameParentLayout]}>
                                <View>
                                    <Text style={styles.mbTypo}>Issue Type</Text>
                                    <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.issueType}</Text>
                                </View>
                            </View>
                            <View style={[styles.frameGroup, styles.frameParentLayout]}>
                                <View>
                                    <Text style={styles.mbTypo}>Offer Price</Text>
                                    <Text style={[styles.rs13120, styles.textTypo]}>Rs {item?.price}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.frameItem, styles.frameChildBorder]} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between',flex:1 }}>

                            <View style={[styles.frameContainer, styles.framePosition]}>
                                <View>
                                    <Text style={styles.mbTypo}>Issue Size (Cr)</Text>
                                    <Text style={[styles.text, styles.textTypo]}>{item?.issueSize}</Text>
                                </View>
                            </View>
                            <View style={[styles.frameView, styles.framePosition]}>
                                <View>
                                    <Text style={styles.mbTypo}>Min Application Share</Text>
                                    <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.lotSize}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.frameItem, styles.frameChildBorder]} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between',flex:1 }}>

                            <View style={[styles.frameParentPosition3]}>
                                <View>
                                    <Text style={styles.mbTypo}>Max. Retail Subscription</Text>
                                    <Text style={[styles.text, styles.textTypo]}>{item?.issueSize}</Text>
                                </View>
                            </View>
                            <View style={[styles.frameParentPosition3]}>
                                <View>
                                    <Text style={styles.mbTypo}>Face Value</Text>
                                    <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.faceValue}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.frameItem, styles.frameChildBorder]} />

                        <View style={[styles.ipocompanyInner1, styles.ipocompanyInnerPosition]}>
                            <View>
                                <Text style={styles.mbTypo}>No.of Shares offered</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.totalSharesValue} Lakhs</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {item?.subscriptionDetails?.length>0 && <SubscriptionDetails details={item?.subscriptionDetails} />}
                
                <View style={[styles.ipocompanyChild2, styles.ipocompanyChildPosition]}>
                    <View style={{ marginTop: 16 }}>
                        <Text style={[styles.objective, styles.objectiveTypo]}>Objective</Text>
                    </View>
                    <View style={[styles.ipocompanyChild3, styles.ipocompanyChildBorder]}>
                        <View style={{ flexDirection: 'row',justifyContent:'space-between',alignItems:'center', marginRight: 16, marginTop: 12 }}>
                            <Image style={styles.document3Icon} resizeMode="cover" source={require('../../assets/documentIcon.png')} />
                            <View style={[styles.draftRedHerringProspectusParent, styles.baseButtonPosition]}>
                                <Text style={[styles.draftRedHerring, styles.text5Typo]}>Draft Red Herring Prospectus (DRHP)</Text>
                                <Text style={[styles.mb, styles.mbTypo]}>[4.07 MB]</Text>
                            </View>
                            <Pressable style={[styles.baseButton, styles.baseButtonPosition]} onPress={()=>downloadPDF(item?.companyName)}>
                                <Image style={styles.calendarIcon} resizeMode="cover" source={require('../../assets/arrowDownBlack.png')} />
                            </Pressable>
                        </View>
                        {loading && <View style={{alignItems:'center',justifyContent:'center'}}>
                            <ActivityIndicator size="large" color="#0158aa" />
                            <Text style={{marginLeft: 10,fontSize: 16,color:'#000'}}>Downloading file...</Text>
                            </View>}
                            {item?.ipoObjectives?.length >0 && 
                            <Text style={[styles.ipoObjective, styles.objectiveTypo]}>IPO Objective</Text>}
                            <View style={styles.stockHasFormedAWhiteMarubWrapper}>
                            <ObjectivesList/>
                        </View>
                    </View>
                </View>

                <View style={[styles.ipocompanyChild5, styles.ipocompanyChildPosition]}>
                    <View style={styles.promoterShareholdingParent}>
                        <Image style={[styles.securityUserIcon, styles.facilitatorsPosition]} resizeMode="cover" source={require('../../assets/securityProfile.png')} />
                        <Text style={[styles.promoterShareholding, styles.text4Position]}>Promoter Shareholding</Text>
                    </View>
                    <View style={[styles.ipocompanyChild6, styles.ipocompanyChildLayout1]} >

                        <View style={[styles.frameParent9, styles.frameParentLayout]}>
                            <View>
                                <Text style={styles.mbTypo}>Promoter Holding pre IPO</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>{item.promoterDetails?.shareHoldingPreIssue||'--'}</Text>
                            </View>
                            <View style={[styles.frameChild12, styles.frameChildBorder]} />
                        </View>
                        <View style={[styles.frameParent10, styles.frameParentLayout]}>
                            <View>
                                <Text style={styles.mbTypo}>No.of shared pre IPO</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.shareHoldingPreIssue} Lakhs</Text>
                            </View>
                            <View style={[styles.frameChild12, styles.frameChildBorder]} />
                        </View>
                        <View style={[styles.frameParent11, styles.frameParentLayout]}>
                            <View>
                                <Text style={styles.mbTypo}>No.of shares post IPO</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.shareHoldingPostIssue} Lakhs</Text>
                            </View>
                            <View style={[styles.frameChild12, styles.frameChildBorder]} />
                        </View>
                        <View style={[styles.ipocompanyInner3, styles.ipocompanyInnerPosition]}>
                            <View>
                                <Text style={styles.mbTypo}>Shares Offered To Public</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>{item?.numberOfShares} Lakhs</Text>
                            </View>
                        </View>
                    </View>
                    {item?.promoterNames?.length>0 && <><Text style={[styles.promoters, styles.text5Typo]}>Promoters</Text>
                    <View style={[styles.ipocompanyChild11, styles.ipocompanyChildBorder]}>
                        <View style={styles.avatarParent}>
                            <View style={{}}>
                                <Text style={[styles.text5]}>{item?.promoterNames}</Text>
                            </View>
                        </View>
                    </View></>}                    
                </View>
                <View style={[styles.ipocompanyChild8, styles.ipocompanyChildPosition]} >

                    <View style={styles.facilitatorsWrapper}>
                        <Text style={[styles.facilitators, styles.facilitatorsPosition]}>Facilitators</Text>
                    </View>
                    <View style={[styles.ipocompanyChild9, styles.ipocompanyChildBorder]}>

                        <View style={[styles.frameParent12, styles.frameParentLayout]}>
                            <View>
                                <Text style={styles.mbTypo}>Lead Managers</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>Hem Securities Ltd.</Text>
                            </View>
                            <View style={[{width:'95%'}, styles.frameChildBorder]} />
                        </View>
                        <View style={[styles.ipocompanyInner4]}>
                            <View>
                                <Text style={styles.mbTypo}>Registrars</Text>
                                <Text style={[styles.bookBuilding, styles.textTypo]}>Bigshare Services Pvt.Ltd.</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </View>
        </ScrollView>
        );
};

const styles = StyleSheet.create({
    ipocompanyChildPosition: {
        backgroundColor: "#fff",
        width: '100%',
        marginBottom: 12
    },
    frameChild15: {
        marginTop: 16,
        borderColor: "#dadce0",
        borderWidth: 1,
        width: '93%',
        borderRadius: 8,
        marginLeft: 16,
        marginBottom: 12,
        paddingBottom: 12
    },
    objectiveTypo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        textAlign: "left"
    },
    ipocompanyChildLayout1: {
        width: '93%',
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",
        borderRadius: 8,
        marginLeft: 16,
        padding:16
    },
    stockTypo: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        lineHeight: 20,
        textAlign: "left",
        fontSize: 14
    },
    parentFlexBox: {
        alignItems: "center",
        flexDirection: "row",
        left: 16,
        position: "absolute"
    },
    textLayout: {
        lineHeight: 20,
        fontSize: 14
    },
    stockHasFormedAWhiteMarubWrapper: {
        marginTop: 16
    },
    parentFlexBox1: {
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 16,
    },
    groupContainer: {
        marginTop: 12,
        backgroundColor: "#fff",
        width: '100%',
    },
    aboutTheCompany: {
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        marginLeft: 4,
    },
    aboutTheCompanyWrapper: {
        height: 20,
    },
    baseButton1Border: {
        borderWidth: 1,
        borderStyle: "solid"
    },
    may2024ToTypo: {
        marginLeft: 8,
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        lineHeight: 20,
        fontSize: 14
    },
    promotersPosition: {
        lineHeight: 24,
        fontSize: 16,
        left: 16,
    },
    frameParentLayout: {
        flex:1
    },
    textTypo: {
        marginTop: 4,
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        lineHeight: 20,
        fontSize: 14
    },
    frameChildBorder: {
        marginTop: 16,
        height: 1,
        borderTopWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid"
    },
    framePosition: {
        marginTop: 12,
        flex:1
    },
    frameParentPosition3: {
        marginTop: 12,
        flex:1
    },
    frameParentPosition2: {
        marginTop: 12,
    },
    frameParentPosition1: {
        marginTop: 12,
    },
    frameParentPosition: {
        marginTop: 12,
    },
    ipocompanyChildBorder: {
        width: '93%',
        borderWidth: 1,
        borderColor: "#dadce0",
        borderStyle: "solid",
        borderRadius: 8,
        marginLeft: 16,
    },
    switchTabFlexBox: {
        justifyContent: "center",
        backgroundColor: "#0158aa",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    baseButtonPosition: {
        marginLeft: 8,
    },
    text5Typo: {
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "500",
        textAlign: "left",

    },
    mbTypo: {
        color: "#697483",
        lineHeight: 16,
        fontSize: 12,
        fontFamily: "NotoSans-Regular",
        textAlign: "left"
    },
    ipocompanyChildLayout: {
        margin: 16,
        borderRadius: 8,
    },
    text4Position: {
        marginLeft: 12,

    },
    timeTypo: {
        color: "#fff",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        position: "absolute"
    },
    ipocompanyChild: {
        width: '100%',
        paddingBottom: 12
    },
    offerDetails: {
        textAlign: "left",
        color: "#1b2533",
        lineHeight: 20,
        fontSize: 14,
        marginLeft: 16,
    },
    ipocompanyItem: {
       marginTop: 12,
        backgroundColor: "#fafafa",
        paddingBottom:12
    },
    calendarIcon: {
        width: 16,
        height: 16
    },
    may2024To: {
        textAlign: "center"
    },
    calendarParent: {
        marginTop: 12
    },
    ipocompanyInner: {
        width: '100%',
        paddingBottom: 12
    },
    energyMissionMachineries: {
        width:'80%',
        color: "#445164",
        textAlign: "left",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600"
    },
    electricityIcon: {
        height: 24,
        width: 24
    },
    capitalGoods: {
        textAlign: "left"
    },
    electricityParent: {
        marginTop: 12
    },
    electricityGroup: {
        marginTop: 12
    },
    bookBuilding: {
        color: "#445164"
    },
    frameChild: {
        width: '200%'
    },
    frameChild1: {
        width: '90%'
    },
    frameParent: {
        marginTop: 12,
    },
    rs13120: {
        color: "#189877"
    },
    frameItem: {
        width: '100%'
    },
    frameGroup: {
        marginTop: 12,
    },
    text: {
        color: "#0158aa"
    },
    ipocompanyInner1: {
        marginTop: 12
    },
    rectangleView: {
        width: '100%',
        paddingBottom: 12
    },
    subscription: {
        textAlign: "left",
        color: "#1b2533",
        lineHeight: 20,
        fontSize: 14,
        marginLeft: 16,
    },
    ipocompanyChild1: {
        marginTop: 12,
        backgroundColor: "#fafafa",
    },
    bid: {
        color: "#445164"
    },
    lakhs1: {
        color: "#189877"
    },
    frameParent3: {
        marginLeft: 32
    },
    frameParent4: {
        left: 203
    },
    frameParent5: {
        marginLeft: 32
    },    
    frameParent6: {
        left: 203
    },
    frameParent7: {
        marginLeft: 32
    },
    frameParent8: {
        left: 203
    },
    ipocompanyInner2: {
        marginTop: 12
    },
    ipocompanyChild2: {
        width: '100%',
        paddingBottom: 12
    },
    objective: {
        textAlign: "left",
        color: "#1b2533",
        lineHeight: 20,
        fontSize: 14,
        marginLeft: 16,
    },
    ipocompanyChild3: {
        marginTop: 12,
        padding:8
    },
    nse: {
        fontSize: 11,
        fontFamily: "Poppins-Medium",
        color: "#eee",
        fontWeight: "500",
        textAlign: "left"
    },
    switchTab: {
        width: 52,
        height: 31,
    },
    document3Icon: {
        height: 24,
        width: 24,
    },
    draftRedHerring: {
        color: "#445164",
        lineHeight: 20,
        fontSize: 14
    },
    mb: {
        lineHeight: 16,
        fontSize: 12,
    },
    draftRedHerringProspectusParent: {
        width: '80%',
    },
    baseButton: {
        shadowColor: "rgba(27, 37, 51, 0.06)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 16,
        elevation: 16,
        shadowOpacity: 1,
        padding: 8,
        justifyContent: "center",
        backgroundColor: "#0158aa",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "hidden"
    },
    stockHasFormed: {
        color: "#445164",
        fontFamily: "NotoSans-Regular",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14,
        marginTop:8
    },
    stockHasFormedAWhiteMarubWrapper: {
        marginTop: 12,
        width: '90%',
        marginLeft: 16,
    },
    ipocompanyChild4: {
        top: 1106
    },
    ipoObjective: {
       marginTop: 20,
        marginLeft: 16,
        color: "#445164",
        textAlign: "left",
        lineHeight: 20,
        fontSize: 14,
    },
    ipocompanyChild5: {
        width: '100%',
        paddingBottom: 12
    },
    promoters: {
        marginTop: 12,
        lineHeight: 24,
        fontSize: 14,
        marginLeft: 16,
        color: "#1b2533"
    },
    ipocompanyChild6: {
        marginTop: 12,
        paddingBottom:12
    },
    promoterShareholding: {
        textAlign: "left",
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        lineHeight: 20,
        fontSize: 14
    },
    securityUserIcon: {
        height: 24,
        width: 24
    },
    promoterShareholdingParent: {
        marginTop: 12,
        marginLeft: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    frameChild12: {
        width: '100%'
    },
    frameParent10: {
        marginTop: 12,
    },
    frameParent11: {
        marginTop: 12,
    },
    ipocompanyInner3: {
        marginTop: 12
    },
    ipocompanyChild8: {
        paddingBottom:12,
        width: '100%'
    },
    ipocompanyChild9: {
        marginTop: 12,
        paddingBottom:12,
    },
    ipocompanyChild10: {
    },
    facilitators: {
        textAlign: "left",
        color: "#1b2533",
        fontFamily: "NotoSans-SemiBold",
        fontWeight: "600",
        lineHeight: 20,
        fontSize: 14
    },
    facilitatorsWrapper: {
        marginTop: 12,
        marginLeft: 16,
    },
    frameParent12: {
        marginTop: 12,
        marginLeft: 16
    },
    ipocompanyInner4: {
        marginTop: 12,
        marginLeft: 16
    },
    ipocompanyChild11: {
        marginTop: 12,
    },
    text5: {
        color: "#445164",
        lineHeight: 20,
        fontSize: 14,
        fontFamily: "NotoSans-Regular",
        fontWeight: "500",
        textAlign: "left",
        
    },
    avatarParent: {
        marginTop: 16,
        marginLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        marginRight: 12
    },  
    ipocompany: {
        backgroundColor: "#dadce0",
        flex: 1,
        overflow: "hidden",
        width: "100%"
    }
});

export default CompanyDetails;

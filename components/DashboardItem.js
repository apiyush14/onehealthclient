import React from 'react';
import { StyleSheet, Text, View} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale} from '../utils/Utils';
import { Ionicons } from '@expo/vector-icons';

/*
Dashboard item
*/

//View
const DashboardItem=props=>{
return(
 	  <View style={{...props.style,...styles.circleDashboardBorderStyle}}>
        <LinearGradient style={styles.circleDashboardContainerStyle}
          colors={['black', 'brown']}>
        </LinearGradient>

        <View style={styles.iconStyle}>
          <Ionicons name={props.icon} size={50} color='springgreen'/>
        </View>
        
        <View style={styles.textContainerStyle}>
         <Text style={styles.textStyle}>{props.text}</Text>
         <Text style={styles.textStyle}>{props.footerText}</Text>
        </View>

       </View>
 	);
};


const styles = StyleSheet.create({
    circleDashboardBorderStyle: {
        width: verticalScale(140),
        height: verticalScale(140),
        borderRadius: verticalScale(70),
        borderWidth: 3,
        borderColor: 'lightgreen',
        alignItems: 'center'
    },
    circleDashboardContainerStyle: {
        width: verticalScale(140),
        height: verticalScale(140),
        borderRadius: verticalScale(70),
        alignItems: 'center'
    },
    iconStyle: {
        position: 'absolute',
        alignSelf: 'center'
    },
    textContainerStyle: {
        flex: 1,
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'column',
        position: 'absolute',
        marginTop: '35%'
    },
    textStyle: {
        paddingVertical: '5%',
        color: 'springgreen',
        fontSize: moderateScale(16, 0.8)
    }
});

export default DashboardItem;
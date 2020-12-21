import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,ImageBackground, Dimensions} from 'react-native';

/*
Event Item Card with shadow effects
*/

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const EventItem=props=>{
return(
 	<View style={styles.eventItemContainer}>
 	<TouchableOpacity onPress={props.onClickEventItem}>
 	<View style={styles.imageContainer}>
 	<ImageBackground 
 	source={{uri:props.image}} 
 	style={styles.bgImage}>
 	<Text style={styles.title}>{props.title}</Text>
 	</ImageBackground>
 	</View>
 	</TouchableOpacity>
 	</View>
 	);
};


const styles = StyleSheet.create({
	title: {
     fontSize: windowWidth/21,
     color: 'white',
     backgroundColor: 'rgba(0,0,0,0.5)',
     paddingVertical: 5,
     paddingHorizontal: 12,
     textAlign: 'center'
	},
 eventItemContainer: {
 	height: windowHeight/6.5,
 	width: windowWidth/1.1,
 	backgroundColor: 'white',
 	borderRadius: 10,
 	marginHorizontal: 10,
 	marginBottom: 15,
 	opacity: 0.7,
 	shadowOffset: { width: 4, height: 4 },  
    shadowColor: 'black',  
    shadowOpacity: 0.7,
    shadowRadius: 2,
    elevation: 10
 },
 imageContainer:{
    width: '100%',
    height: '100%',
    borderRadius: 10,
 },
 bgImage: {
 	width: '100%',
 	height: '100%',
    overflow: 'hidden',
    borderRadius: 10,
 	justifyContent: 'flex-end'
 }
});

export default EventItem;
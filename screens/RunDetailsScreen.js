import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Platform, ImageBackground,Modal} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import { scale, moderateScale, verticalScale} from '../utils/Utils';
import StatusCodes from "../utils/StatusCodes.json";
import { useDispatch } from 'react-redux';
import * as runActions from '../store/run-actions';
import * as eventActions from '../store/event-actions';
import Card from '../components/Card';
import {Ionicons} from '@expo/vector-icons';
import {useSelector} from 'react-redux';
import RunDetails from '../models/rundetails';
import EventResultsView from '../components/EventResultsView';

let isCalledFromHistoryScreenVar=false;
let runStartDateTime = null;
let runId = 0;
let eventId = 0;
let runDetails = null;

const RunDetailsScreen = props=>{

  // State Selectors
  const eventResultDetails = useSelector(state => state.events.eventResultDetails);

  const dispatch = useDispatch();

  //State Variables
  //const [mapState,setMapState]=useState(null);
  const [runPath, setRunPath] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [runDate, setRunDate] = useState(null);
  const [runDay, setRunDay] = useState(null);
  const [runDistance, setRunDistance] = useState(0);
  const [runTotalTime, setRunTotalTime] = useState(0);
  const [runCaloriesBurnt, setRunCaloriesBurnt] = useState(0);
  const [runPace, setRunPace] = useState(0.00);
  const [userRank, setUserRank] = useState(0);
  const [isEvent, setIsEvent] = useState(false);
  const [isCalledFromHistoryScreen, setIsCalledFromHistoryScreen] = useState(false);
  const [trackTimer, setTrackTimer] = useState({
    seconds: "00",
    minutes: "00",
    hours: "00"
  });

  const [modalVisible, setModalVisible] = useState(false);

  //Load Screen Use Effect hook used to populate state variables
  useEffect(() => {
    runDetails = props.route.params.runDetails;
    if (props.route.params.sourceScreen) {
      if (props.route.params.sourceScreen === 'RunHistoryScreen') {
        isCalledFromHistoryScreenVar=true;
        setIsCalledFromHistoryScreen(true);
      }
      else{
        isCalledFromHistoryScreenVar=false;
        setIsCalledFromHistoryScreen(false);
      }
    }

    if (parseInt(runDetails.eventId) > 0) {
      var eventResult = eventResultDetails.find(eventResult => eventResult.runId === runDetails.runId);
      setUserRank(eventResult !== undefined ? eventResult.userRank : 0);
      setIsEvent(true);
    }

    if (runDetails.runDistance) {
      const pathArray = runDetails.runPath;
      //To handle No Location Available Scenario
      if (pathArray.length > 0) {
        setRunPath(pathArray);
        setMapRegion({
          latitude: pathArray[Math.floor(pathArray.length / 2)].latitude,
          longitude: pathArray[Math.floor(pathArray.length / 2)].longitude,
          latitudeDelta: Math.abs(pathArray[pathArray.length - 1].latitude - pathArray[0].latitude) + 0.005,
          longitudeDelta: Math.abs(pathArray[pathArray.length - 1].longitude - pathArray[0].longitude) + 0.005
        });
      }

      setRunDate(runDetails.runDate);
      setRunDay(runDetails.runDay);
      setRunDistance(runDetails.runDistance);
      setRunPace(runDetails.runPace);
      setRunCaloriesBurnt(runDetails.runCaloriesBurnt);

      runStartDateTime = runDetails.runStartDateTime;
      runId = runDetails.runId;
      eventId = runDetails.eventId;
      var runTotalTimeVar = runDetails.runTotalTime;
      let secondsVar = ("0" + (Math.floor(runTotalTimeVar / 1000) % 60)).slice(-2);
      let minutesVar = ("0" + (Math.floor(runTotalTimeVar / 60000) % 60)).slice(-2);
      let hoursVar = ("0" + Math.floor(runTotalTimeVar / 3600000)).slice(-2);
      setTrackTimer({
        seconds: secondsVar,
        minutes: minutesVar,
        hours: hoursVar
      });
      setRunTotalTime(runTotalTimeVar);
    }
    saveRun();
  }, [props.route.params]);

  //Method to save Run In Local DB and Server
  const saveRun = () => {
    if ((!isCalledFromHistoryScreenVar)) {
      dispatch(runActions.addRun(runDetails)).then((response) => {
        if (runDetails.eventId > 0) {
          if (response.status === StatusCodes.NO_INTERNET) {
            Alert.alert("Internet Issue", "Your Event Run is not yet submitted due to connectivity issue, please check the internet connection and reload the application to submit this run!!!");
          } else if (response.status === StatusCodes.DISTANCE_NOT_ELIGIBLE) {
            Alert.alert("Run Not Eligible", "Your Event Run is not eligible for submission, we have saved it as a normal run!!!");
          } else if (response.status >= StatusCodes.BAD_REQUEST) {
            Alert.alert("Technical Issue", "Your Event Run is not yet submitted due to technical issue, please reload the application to submit this run!!!");
          } else {
            Alert.alert("Success", "Your Event Run has been submitted successfully!!!");
          }
        } else if (response.status === StatusCodes.INTERNAL_SERVER_ERROR) {
          Alert.alert("Run Not Saved", "Sorry, we could not save this Run!!!");
        }
      });
    }
  };

  //Event Result Action Listener
  const onClickEventResults = () => {
    //Async Dispatch Clean Event Registration State
    dispatch(eventActions.cleanEventResultState());
    setModalVisible(true);
  };

  //Close Event Item Listener
  const onCloseEventResult = () => {
    setModalVisible(false);
    //Async Dispatch Clean Event Registration State
    dispatch(eventActions.cleanEventResultState());
  };
//View
return (
 <View style={styles.runDetailsContainerStyle}>
   <Modal animationType="slide" transparent={true} visible={modalVisible}
    onRequestClose={()=>{}}>
   <EventResultsView 
   onCloseEventResult={onCloseEventResult} 
   eventId={eventId}/>
  </Modal>

  {runPath&&runPath.length>0?(
  <MapView style={styles.mapContainerStyle} region={mapRegion}
   pitchEnabled={true} rotateEnabled={true} zoomEnabled={true} scrollEnabled={true}>
   <Polyline 
   strokeWidth={3}
   strokeColor='red'
   coordinates={runPath}/>
   {runPath[0]!==undefined?(
   <Marker opacity={0.8} pinColor='green' coordinate={runPath[0]}/>):(<View></View>)}
   {runPath[runPath.length-1]!==undefined?(
   <Marker opacity={0.8} pinColor='wheat' coordinate={runPath[runPath.length-1]}/>):(<View></View>)}
  </MapView>):
   <View style={styles.mapContainerStyle}>
    <ImageBackground 
      source={require('../assets/images/no_location.jpg')} 
      style={styles.bgImage}>
     </ImageBackground>
   </View>}

 <View style={styles.scrollViewContainerStyle}>
  <ScrollView style={styles.runMetricsContainerStyle}>
   {isEvent&&userRank>0?(
   <TouchableOpacity onPress={onClickEventResults}>
   <View style={styles.rowStyle}>
    <Card style={{width:'97%'}}>
      <Ionicons name={Platform.OS === 'android'?"md-trophy":"ios-trophy"} size={verticalScale(21)} color='springgreen'/>
      <Text style={styles.mediumTextStyle}>{userRank}</Text>
      <Text style={styles.mediumTextStyle}>Rank</Text>
      <Text style={styles.smallTextStyle}>Touch to see Results</Text>
    </Card>
   </View>
   </TouchableOpacity>):(<View></View>)}

   <View style={styles.rowStyle}>
    <Card style={{width:'60%'}}>
     <Ionicons name={Platform.OS === 'android'?"md-walk":"ios-walk"} size={verticalScale(25)} color='springgreen'/>
     <Text style={styles.largeTextStyle}>{parseFloat(runDistance/1000).toFixed(2)} KM</Text>
    </Card>

    <Card style={{width:'35%'}}>
     <Ionicons name={Platform.OS === 'android'?"md-stopwatch":"ios-stopwatch"} size={verticalScale(16)} color='springgreen'/>
     <Text style={styles.mediumTextStyle}>{trackTimer.hours}:{trackTimer.minutes}:{trackTimer.seconds}</Text>
     <Text style={styles.smallTextStyle}>HH:MM:SS</Text>
    </Card>
   </View>

   <View style={styles.rowStyle}>
    <Card style={{width:'35%'}}>
      <Ionicons name={Platform.OS === 'android'?"md-calendar":"ios-calendar"} size={verticalScale(20)} color='springgreen'/>
      <Text style={styles.mediumTextStyle}>{runDate}</Text>
      <Text style={styles.mediumTextStyle}>{runDay}</Text>
    </Card>

    <Card style={{width:'25%'}}>
      <Ionicons name={Platform.OS === 'android'?"md-flame":"ios-flame"} size={verticalScale(20)} color='springgreen'/>
      <Text style={styles.mediumTextStyle}>{parseFloat(runCaloriesBurnt).toFixed(2)}</Text>
      <Text style={styles.mediumTextStyle}>Calories</Text>
    </Card>

    <Card style={{width:'33%'}}>
      <Ionicons name={Platform.OS === 'android'?"md-speedometer":"ios-speedometer"} size={verticalScale(20)} color='springgreen'/>
      <Text style={styles.mediumTextStyle}>{parseFloat(runPace).toFixed(2)}</Text>
      <Text style={styles.mediumTextStyle}>Pace</Text>
    </Card>

   </View>
  </ScrollView>

  {!isCalledFromHistoryScreen?(
  <TouchableOpacity onPress={()=>{props.navigation.navigate('Home')}}>
   <View style={styles.tabViewStyle}>
    <View style={styles.iconViewStyle}>
     <Ionicons name={Platform.OS === 'android'?"md-home":"ios-home"} size={verticalScale(21)} color='royalblue'/>
     <Text style={styles.iconTextStyle}>Home</Text>
    </View>
   </View>
  </TouchableOpacity>):(<View></View>)}
 </View>
 </View>
);
};

const styles = StyleSheet.create({
  runDetailsContainerStyle: {
    flex: 1,
    backgroundColor: 'lightgrey',
    flexDirection: 'column',
  },

  mapContainerStyle: {
    flex: 0.4,
    borderRadius: 20
  },
  scrollViewContainerStyle: {
    flex: 0.6
  },

  tabViewStyle:{
    bottom: '1%',
    alignItems: 'center',
    backgroundColor: 'white',
    height: verticalScale(70)
  },
  iconViewStyle: {
    flex: 1,
    top:'10%',
    alignItems: 'center'
  },

  runMetricsContainerStyle: {
    flexDirection: 'column',
    alignSelf: 'center'
  },
  bgImage: {
   flex: 1
  },

  rowStyle: {
    flex: 1,
    height: '30%',
    flexDirection: 'row',
    alignItems: 'center'
  },

  largeTextStyle: {
    fontSize: moderateScale(25, 0.8),
    color: 'springgreen',
    fontFamily: 'open-sans'
  },
  mediumTextStyle: {
    fontSize: moderateScale(14, 0.8),
    color: 'springgreen',
    fontFamily: 'open-sans'
  },
  smallTextStyle: {
    fontSize: moderateScale(9, 0.8),
    color: 'springgreen',
    fontFamily: 'open-sans'
  },

  iconTextStyle: {
    fontSize: moderateScale(10, 0.8),
    color: 'royalblue',
    fontFamily: 'open-sans'
  }

});

export default RunDetailsScreen;
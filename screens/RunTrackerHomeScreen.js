import React, {useState,useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {View,StyleSheet,Alert,Modal,ImageBackground,Text,PermissionsAndroid,Platform,NativeModules} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import RoundButton from '../components/RoundButton';
import {useDispatch,useSelector} from 'react-redux';
import {useIsFocused} from "@react-navigation/native";
import * as runActions from '../store/run-actions';
import * as eventActions from '../store/event-actions';
import StatusCodes from "../utils/StatusCodes.json";

import ChallengeList from '../components/ChallengeList';
import EventView from '../components/EventView';

var DistanceCalculatorModule=NativeModules.DistanceCalculatorModule;

const RunTrackerHomeScreen = (props) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [isMoreContentAvailableOnServer, setIsMoreContentAvailableOnServer] = useState(true);

  // State Selectors
  const eventRegistrationDetails = useSelector(state => state.events.eventRegistrationDetails).filter(event => event.runId === 0);
  const eventDetails = useSelector(state => state.events.eventDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const pendingRunsForSync = useSelector(state => state.runs.runs.filter(run => run.isSyncDone === "0"));

  // State Variables
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 20,
    longitudeDelta: 20
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEventDetails, setModalEventDetails] = useState(null);
  const [ongoingEventDetails, setOngoingEventDetails] = useState(null);

  // Use Effect Hook to be loaded everytime the screen loads
  useEffect(() => {
    if (isFocused) {
      setIsMoreContentAvailableOnServer(true);
      setOngoingEventDetails(null);
      checkAndUpdateOngoingEvent();
      if (pendingRunsForSync !== null && pendingRunsForSync.length > 0) {
        dispatch(runActions.syncPendingRuns(pendingRunsForSync));
      }
    }
  }, [props, isFocused]);

  //Async Load User Data upon initialization
  useEffect(() => {
    const fetchData = async () => {
      dispatch(runActions.loadRuns());
      dispatch(runActions.loadRunSummary());
      dispatch(eventActions.loadEventsFromServer(0));
      dispatch(eventActions.loadEventRegistrationDetails());
      dispatch(eventActions.loadEventResultDetailsFromServer(0));
    }
    fetchData();
  }, []);

  //Load Location Details
  useEffect(() => {
    (async () => {
      await requestActivityRecognitionPermission();
      Location.requestForegroundPermissionsAsync().then(response => {
        if (response.status === 'granted') {
          Location.hasServicesEnabledAsync().then(response => {
            if (response) {
              Location.getCurrentPositionAsync({}).then(response => {
                setMapRegion({
                  latitude: response.coords.latitude,
                  longitude: response.coords.longitude,
                  latitudeDelta: 0.000757,
                  longitudeDelta: 0.0008
                });
              });
            } else {
              Alert.alert("Location Service Not Enabled", "Please enable Location Services for us to accurately track your runs");
            }
          });
        }
      });
    })();
  }, []);

  //Request Pedometer Permission
  const requestActivityRecognitionPermission = async () => {
    const permissionsResult = await PermissionsAndroid.request(
      "android.permission.ACTIVITY_RECOGNITION"
    );
    return permissionsResult;
  };

  //Use effect for Event Registration Changes
  useEffect(() => {
    (async () => {
      setOngoingEventDetails(null);
      checkAndUpdateOngoingEvent();
    })();
  }, [eventRegistrationDetails]);

  //Method to check if there is an Ongoing Event
  const checkAndUpdateOngoingEvent = () => {
    let currentTime = new Date().getTime();
    if (eventRegistrationDetails !== null && eventRegistrationDetails.length > 0) {
      eventRegistrationDetails.map((event) => {
        var eventStartDateTime = new Date(event.eventStartDate);
        var eventEndDateTime = new Date(event.eventEndDate);
        if (currentTime >= eventStartDateTime.getTime() &&
          currentTime < eventEndDateTime.getTime()) {
          setOngoingEventDetails(event);
          NetInfo.fetch().then(state=>setIsOfflineMode(!state.isConnected));
        }
      });
    }
  };

  //Click Event Item Listener
  const onClickEventItem = (eventItem) => {
    setModalEventDetails(eventItem);
    setModalVisible(true);
  };

  //Close Event Item Listener
  const onCloseEventItem = (eventItem) => {
    setModalVisible(false);
  };

  //Register Event Listener
  const onRegisterEventItem = (eventItem) => {
    dispatch(eventActions.registerUserForEvent(modalEventDetails)).then((response) => {
      if (response.status === StatusCodes.NO_INTERNET) {
        Alert.alert("Internet Issue", "Active Internet Connection Required!!!", [{
          text: 'OK',
          onPress: () => {
            setModalVisible(false)
          }
        }], {
          cancelable: false
        });
      } else
      if (response.status != StatusCodes.OK) {
        Alert.alert("Registration Failed", "Registration for the event failed, please try again later!!!", [{
          text: 'OK',
          onPress: () => {
            setModalVisible(false)
          }
        }], {
          cancelable: false
        });
      } else {
        Alert.alert("Registration Successful", "You have been registered successfully, see you on Run Day!!!", [{
          text: 'OK',
          onPress: () => {
            setModalVisible(false)
          }
        }], {
          cancelable: false
        });
      }
    });
  };

  //Method to lazy load Events from server 
  const loadMoreDataFromServer = () => {
    setIsLoading(true);
    let pageNumber = Math.floor(eventDetails.length / 10);
    dispatch(eventActions.loadEventsFromServer(pageNumber)).then((response) => {
      if (response.status >= StatusCodes.BAD_REQUEST) {
        setIsMoreContentAvailableOnServer(false);
      } else if (response.data && (!response.data.moreContentAvailable)) {
        setIsMoreContentAvailableOnServer(false);
      } else {
        setIsMoreContentAvailableOnServer(true);
      }
      setIsLoading(false);
    });
  };

  //Run Action
  const runAction = async () => {
    var permissionsResult = false;
    DistanceCalculatorModule.isStepCountingAvailable((response) => {
      var isMotionSensorAvailable = response;
      if (isMotionSensorAvailable) {
        if (Platform.Version > 28) {
          permissionsResult = PermissionsAndroid.check(
            "android.permission.ACTIVITY_RECOGNITION"
          );
        } else {
          permissionsResult = PermissionsAndroid.check(
            "com.google.android.gms.permission.ACTIVITY_RECOGNITION"
          );
        }
        if (permissionsResult) {
          navigateToRunTrackerScreen();
        } else {
          Alert.alert("Permission Required", "Physical Activity Permission is mandatory to track distance, make sure to grant this permission", [{
            text: 'OK',
            onPress: () => {
              requestActivityRecognitionPermission().then((response) => {
                if (response === 'granted') {
                  navigateToRunTrackerScreen();
                }
              });
            }
          }], {
            cancelable: false
          });
        }
      } else {
        Alert.alert("No Sensor Detected", "We could not detect any motion sensor in this device");
      }
    });
  };
  //Method to navigate to Run Tracker Screen
  const navigateToRunTrackerScreen = () => {
    props.navigation.navigate('LiveRunTracker', {
      eventId: ongoingEventDetails !== null ? ongoingEventDetails.eventId : 0
    });
  };

//Logic to handle shutter tab for challenges

/*
var isHidden = true;
const [bounceValue, setBounceValue] = useState(new Animated.Value(360));

const toggleSubView=()=>{
 var toValue = 360;
 if(isHidden) {
  toValue = 0;
}
Animated.spring(
  bounceValue,
  {
    toValue: toValue,
    velocity: 3,
    tension: 2,
    friction: 8,
    useNativeDriver: true
  }
  ).start();
isHidden = !isHidden;
};*/

//View
return (
  <View style={styles.runTrackerHomeContainerStyle}>
   
  <Modal animationType="slide" transparent={true} visible={modalVisible}
  onRequestClose={()=>{}}>
   <EventView 
   onRegisterEventItem={onRegisterEventItem} 
   onCloseEventItem={onCloseEventItem} 
   eventDetails={modalEventDetails}/>
  </Modal>

  {ongoingEventDetails===null?(
  <MapView style={styles.mapContainerStyle} region={mapRegion}
  pitchEnabled={false} rotateEnabled={false} zoomEnabled={true} scrollEnabled={false}>
  <Marker coordinate={mapRegion}/>
  </MapView>)
  :(
    <View style={styles.mapContainerStyle}>
    {!isOfflineMode?(
    <ImageBackground
      source={{uri:"http://192.168.1.66:7001/event-details/getDisplayImage/"+ongoingEventDetails.eventId+"?imageType=DISPLAY"}}
      style={styles.bgImageStyle}>
    </ImageBackground>):(
    <ImageBackground
      source={require('../assets/images/login.jpg')}
      style={styles.bgImageStyle}>
    </ImageBackground>
   )}
   </View>
  )}

  <View style={styles.runButtonStyle}>
   <RoundButton
   title="Go"
   onPress={runAction}/>
  </View>

  {ongoingEventDetails===null?(
  <View style={styles.challengeListStyle}>
  <ChallengeList 
  listData={eventDetails}
  onEndReached={loadMoreDataFromServer}
  isLoading={isLoading}
  onClickEventItem={onClickEventItem}/>
  </View>):(<View></View>)}

  {/* Commented for now as Challenge is out of scope for now
  <Animated.View style={[styles.subView,{transform: [{translateY:bounceValue}]}]}>
  <Button title="Challenge" onPress={()=>{toggleSubView()}}/>
  <View style={styles.tabListView}>
  <ChallengeList listData={CHALLENGES}/>
  </View>
  </Animated.View>*/}

  </View>
  );
};

const styles = StyleSheet.create({

  runTrackerHomeContainerStyle: {
    flex: 1,
    backgroundColor: 'lightgrey',
    flexDirection: 'column',
  },

  mapContainerStyle: {
    flex: 1,
    borderRadius: 20
  },

  bgImageStyle: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%'
  },

  runButtonStyle: {
    position: 'absolute',
    top: '70%',
    alignSelf: 'center',
    opacity: 0.9
  },

  challengeListStyle: {
    position: 'absolute',
    top: '2%'
  },

  /*tabListView: {
    position: 'absolute',
    top: '20%'
  },

  subView: {
    position: "absolute",
    backgroundColor: "white",
    height: 400,
    width: '100%',
    alignSelf: 'center',
    bottom: 0
  }*/
});

export default RunTrackerHomeScreen;
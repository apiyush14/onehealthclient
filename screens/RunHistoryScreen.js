import React, {useState,useEffect} from 'react';
import {View,Text,StyleSheet,ActivityIndicator} from 'react-native';
import { scale, moderateScale, verticalScale} from '../utils/Utils';
import {useIsFocused} from "@react-navigation/native";
import {useSelector,useDispatch} from 'react-redux';
import {Ionicons} from '@expo/vector-icons';
import RunHistoryList from '../components/RunHistoryList';
import DashboardItem from '../components/DashboardItem';
import * as runActions from '../store/run-actions';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const RunHistoryScreen = props => {

    //State Variables
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isMoreContentAvailableOnServer, setIsMoreContentAvailable] = useState(true);

    // State Selectors
    const runsHistory = useSelector(state => state.runs.runs);
    const runSummary = useSelector(state => state.runs.runSummary);
    const pendingRunsForSync = useSelector(state => state.runs.runs.filter(run => run.isSyncDone === "0"));

    // Use Effect Hook to be loaded everytime the screen loads
    useEffect(() => {
      //console.log('=========Run History Sync============');
      //console.log(runsHistory);
      if (isFocused && pendingRunsForSync !== null && pendingRunsForSync.length > 0) {
        dispatch(runActions.syncPendingRuns(pendingRunsForSync));
      }
    }, [props, isFocused]);

  //Method to lazy load Runs from server 
  const loadMoreDataFromServer = () => {
    if (isMoreContentAvailableOnServer) {
      setIsLoading(true);
      let pageNumber = Math.floor(runsHistory.length / 3);
      dispatch(runActions.loadRunsFromServer(pageNumber)).then((response) => {
        if (!response.isMoreContentAvailable) {
          setIsMoreContentAvailable(false);
        } else {
          setIsMoreContentAvailable(true);
        }
        setIsLoading(false);
      });
    }
  };
    //Event Listener to be called on selecting Run and to navigate to Run History Screen
    const onSelectRunHistoryItem = (itemdata) => {
      //console.log('============On Select Run History=============');
      //console.log(itemdata);
      props.navigation.navigate('RunDetailsScreen', {
        runTrackSnapUrl: itemdata.item.runTrackSnapUrl,
        runDate: itemdata.item.runDate,
        runDay: itemdata.item.runDay,
        runTotalTime: itemdata.item.runTotalTime,
        runDistance: itemdata.item.runDistance,
        runPace: itemdata.item.runPace,
        runCaloriesBurnt: itemdata.item.runCaloriesBurnt,
        runPath: itemdata.item.runPath,
        runId: itemdata.item.runId,
        sourceScreen: 'RunHistoryScreen'
      });
    };

  // Run History Footer View
  const renderRunSummaryFooter = () => {
    return (
      <View>
      {isLoading?
       (
        <ActivityIndicator size="large" color="green"/>
       ):
       (
       <View></View>
       )
      }
      </View>
    );
  };

  // Run Summary Header View
  const renderRunSummaryHeader = () => {
    return ( 
    <View style={styles.runsHistoryDashboardContainerStyle}>

     <DashboardItem
      text={runSummary!=null?parseFloat(runSummary.totalDistance/1000).toFixed(2)+" KM":0+" KM"}
      footerText="Total Distance"
      style={styles.totalDistanceDashboardItemStyle} 
      icon="ios-walk"/>

     <DashboardItem 
      text={runSummary!=null?parseFloat(runSummary.averageDistance/1000).toFixed(2)+" KM":0+" KM"}
      footerText="Avg Distance"
      style={styles.averageDistanceDashboardItemStyle} 
      icon="ios-stats"/>

     <DashboardItem 
      text={runSummary!=null?parseFloat(runSummary.averagePace).toFixed(2):0.00}
      footerText="Avg Pace"
      style={styles.averagePaceDashboardItemStyle} 
      icon="ios-stopwatch"/>

    <View style={styles.footerContainerStyle}>
     <View style={styles.footerViewContainerStyle}>
      <View style={styles.footerValueContainerStyle}> 
       <Ionicons name="ios-ribbon" size={30} color='springgreen'/>
       <Text style={styles.footerTextStyle}>{runSummary!=null?parseInt(runSummary.totalRuns):0}</Text>
      </View>
      <Text style={styles.footerTextStyle}>Total Runs</Text>
     </View>

     <View style={styles.divisorStyle}>
     </View>

     <View style={styles.footerViewContainerStyle}>
      <View style={styles.footerValueContainerStyle}>
       <Ionicons name="ios-flame" size={30} color='springgreen'/>
       <Text style={styles.footerTextStyle}>0</Text> 
      </View>
      <Text style={styles.footerTextStyle}>Calories</Text>
     </View>

    </View>
    </View>
    );
  };

//View
  return ( 
  <View style={styles.runHistoryContainerStyle}>
    <RunHistoryList
     onSelectRunItem={onSelectRunHistoryItem}
     onEndReached={loadMoreDataFromServer}
     isLoading={isLoading}
     header={renderRunSummaryHeader()}
     footer={renderRunSummaryFooter()}
     listData={runsHistory}/>
   </View>
  );
};

const styles = StyleSheet.create({
  runHistoryContainerStyle: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column'
  },

  runsHistoryDashboardContainerStyle: {
    width: width,
    paddingVertical: '20%',
    backgroundColor: 'black',
    borderRadius: 25
  },

  averagePaceDashboardItemStyle: {
    position: 'absolute',
    left: '2%',
    top: '10%',
    alignSelf: 'flex-start'
  },
  totalDistanceDashboardItemStyle: {
    alignSelf: 'center',
    top: '30%'
  },
  averageDistanceDashboardItemStyle: {
    position: 'absolute',
    right: '2%',
    top: '10%',
    alignSelf: 'flex-end'
  },

  footerContainerStyle: {
    flex: 1,
    top: '20%',
    height: verticalScale(70),
    borderColor: 'springgreen',
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerViewContainerStyle: {
    flex: 0.5,
    alignItems: 'center'
  },
  footerValueContainerStyle: {
    flexDirection: 'row'
  },
  divisorStyle: {
    borderWidth: 0.5,
    borderColor: 'springgreen',
    height: '100%'
  },
  footerTextStyle: {
    paddingHorizontal: '3%',
    color: 'springgreen',
    fontSize: moderateScale(18, 0.8),
    alignSelf: 'center'
  }

});

export default RunHistoryScreen;
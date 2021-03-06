import React from 'react';
import {Ionicons} from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator,HeaderBackButton} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import RunTrackerHomeScreen from '../screens/RunTrackerHomeScreen';
import LiveRunTracker from '../screens/LiveRunTracker';
import RunDetailsScreen from '../screens/RunDetailsScreen';
import RunHistoryScreen from '../screens/RunHistoryScreen';
import LogInScreen from '../screens/LogInScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import LogOutScreen from '../screens/LogOutScreen';
import SplashScreen from '../screens/SplashScreen';
import TermsAndConditions from '../screens/TermsAndConditions';
import Privacy from '../screens/Privacy';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import EventsListSummaryScreen from '../screens/EventsListSummaryScreen';
import {useDispatch,useSelector} from 'react-redux';
import * as userActions from '../store/user-actions';
import { scale, moderateScale, verticalScale} from '../utils/Utils';

const drawerNavigator = createDrawerNavigator();
const stackNavigator=createStackNavigator();
const tabNavigator=createBottomTabNavigator();

//Main Navigator
const RunTrackerNavigator=()=>{
  const dispatch=useDispatch();
  return (
    <NavigationContainer>
    <drawerNavigator.Navigator screenOptions={{
      swipeEnabled: false
    }}>
    <drawerNavigator.Screen name="Home" component={RunTrackerStackNavigator}/>
    <drawerNavigator.Screen name="Profile" component={UserProfileScreen}/>
    <drawerNavigator.Screen name="Terms & Conditions" component={TermsAndConditions}/>
    <drawerNavigator.Screen name="Privacy" component={Privacy}/>
    <drawerNavigator.Screen name="Feedback" component={FeedbackScreen}/>
    <drawerNavigator.Screen name="LogOut" component={LogOutScreen}
    listeners={({ navigation }) => ({
        state: (e) => {
        if (e.data.state.index === 5) {
          dispatch(userActions.cleanUserDataStateAndDB());
        }
        }
    })}
    />
    </drawerNavigator.Navigator>
    </NavigationContainer>
    );
};

// Tab Navigator
const RunTrackerTabNavigator=({navigation, route})=>{
  
  return (
   <tabNavigator.Navigator 
   screenOptions={(screenRoute) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (screenRoute.route.name === 'Home') {
        iconName = focused
        ? Platform.OS === 'android'?'md-home':'ios-home'
        : Platform.OS === 'android'?'md-home':'ios-home';
      } else if (screenRoute.route.name === 'History') {
        iconName = focused 
        ? Platform.OS === 'android'?'md-stats-chart':'ios-stats-chart' 
        : Platform.OS === 'android'?'md-stats-chart':'ios-stats-chart';
      }
        else if (screenRoute.route.name === 'Events') {
        iconName = focused 
        ? Platform.OS === 'android'?'md-trophy':'ios-trophy' 
        : Platform.OS === 'android'?'md-trophy':'ios-trophy';
      }
      return <Ionicons name={iconName} size={verticalScale(21)} color={color} />;
    },
  })}

   tabBarOptions={{
    activeTintColor: 'royalblue',
    inactiveTintColor: 'grey',
    labelStyle: {
     //fontFamily: 'open-sans'
    },
    tabStyle: {
    },
    style: {
      backgroundColor: 'white',
      opacity: 1
    }
  }}
  >
  <tabNavigator.Screen name="Home" component={RunTrackerHomeScreen} 
  listeners={{
    tabPress: e=>{
    }
  }}/>
  <tabNavigator.Screen name="Events" component={EventsStackNavigator} />
  <tabNavigator.Screen name="History" component={RunTrackerHistoryStackNavigator} />
  </tabNavigator.Navigator>
  );
};

//Main Stack Navigator
const RunTrackerStackNavigator=({navigation, route})=>{
  const authDetails = useSelector(state => state.authDetails);
  const userDetails = useSelector(state => state.userDetails);
  var currentActiveScreenName=getActiveScreenName(route);

  var isToShowHeader=currentActiveScreenName==='Home';

  return (
    <stackNavigator.Navigator screenOptions={{gestureEnabled: false}}>
    {(authDetails===null)
      ||(authDetails.userId===undefined)
      ||(authDetails.userId===null) 
      ||(userDetails===null) 
      ||(userDetails.userFirstName===undefined)
      ||(userDetails.userFirstName===null) ? (
    <stackNavigator.Screen name="LoginStackNavigator" component={LoginStackNavigator}
     options={{
      headerShown: false
    }}
    /> 
    ): (
    <React.Fragment>
    <stackNavigator.Screen name="Home" component={RunTrackerTabNavigator} 
    options={{
      headerShown: isToShowHeader,
      title: currentActiveScreenName,
      headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
      headerTintColor: 'white',
      headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
      headerTitleAlign: 'center',
      headerLeft: ()=>{
        return (
          currentActiveScreenName==='Home'?
          (<View styles={styles.person}>
          <TouchableOpacity onPress={()=>navigation.toggleDrawer()}>
          <Ionicons name={Platform.OS === 'android'?'md-person':'ios-person'} size={verticalScale(25)} color='white'/>
          </TouchableOpacity>
          </View>):(
          currentActiveScreenName==='Run Details'?(
          <HeaderBackButton tintColor='white' onPress={()=>{navigation.navigate('Runs History')}}>
          </HeaderBackButton>):(null)
          )
          );
    }}}/>
    <stackNavigator.Screen name="LiveRunTracker" component={LiveRunTracker} 
    options={{
      headerShown: false
    }}/>

    <stackNavigator.Screen name="Run Details" component={RunDetailsScreen}
        options={{
        title: 'Run Details',
        headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
        headerTintColor: 'white',
        headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
        headerTitleAlign: 'center',
        headerLeft: null
    }}/>

    </React.Fragment>
     )}
    </stackNavigator.Navigator>
    );
  };

  //Run History Stack Navigator
  const RunTrackerHistoryStackNavigator=({navigation, route})=>{
    return (
      <stackNavigator.Navigator screenOptions={{gestureEnabled: false}}>
       <stackNavigator.Screen name="Runs History" component={RunHistoryScreen}
        options={{
        title: 'Runs History',
        headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
        headerTintColor: 'white',
        headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
        headerTitleAlign: 'center'
      }}/>
       <stackNavigator.Screen name="Run Details" component={RunDetailsScreen}
        options={{
        title: 'Run Details',
        headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
        headerTintColor: 'white',
        headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
        headerTitleAlign: 'center'
    }}/>
      </stackNavigator.Navigator>
      );
    };

   const styles = StyleSheet.create({
     person: {
       left: 10
     }
   });

  //Login Stack Navigator
  const LoginStackNavigator=({navigation, route})=>{
    return (
      <stackNavigator.Navigator 
      screenOptions={
        {gestureEnabled: false}
       }>
      <stackNavigator.Screen name="SplashScreen" component={SplashScreen} 
      options={{
        headerShown: false
      }}/>
      <stackNavigator.Screen name="LogInScreen" component={LogInScreen} 
      options={{
        headerShown: false
      }}/>
      <stackNavigator.Screen name="UserDetailsScreen" component={UserDetailsScreen} 
      options={{
        headerShown: false
      }}/>
      </stackNavigator.Navigator>
      );
    };

 //Events Stack Navigator
  const EventsStackNavigator=({navigation, route})=>{
    return (
      <stackNavigator.Navigator 
      screenOptions={
        {gestureEnabled: false}
       }>
      <stackNavigator.Screen name="Events" component={EventsListSummaryScreen}
       options={{
       title: 'Events',
       headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
       headerTintColor: 'white',
       headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
       headerTitleAlign: 'center'
      }}/>
      <stackNavigator.Screen name="Run Details" component={RunDetailsScreen}
      options={{
      title: 'Run Details',
      headerStyle: {
            backgroundColor: 'royalblue',
            opacity: 1,
            height: verticalScale(60)
          },
      headerTintColor: 'white',
      headerTitleStyle: {
            fontSize: moderateScale(13, 0.5),
            fontFamily: 'open-sans-bold'
          },
      headerTitleAlign: 'center'
    }}/>
      </stackNavigator.Navigator>
      );
    };

//Private Utility Method to Get Active Screen Name Recursively    
const getActiveScreenName = (route) => {
  if (route && route.state) {
    if (route.state.index >= 0 && route.state.routes) {
      return getActiveScreenName(route.state.routes[route.state.index]);
    }
  } else {
    return route.name;
  }
};
 
export default RunTrackerNavigator;

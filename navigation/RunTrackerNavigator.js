import React from 'react';
import {Ionicons} from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import RunTrackerHomeScreen from '../screens/RunTrackerHomeScreen';
import LiveRunTracker from '../screens/LiveRunTracker';
import RunDetailsScreen from '../screens/RunDetailsScreen';
import RunHistoryScreen from '../screens/RunHistoryScreen';
import TestScreen from '../screens/TestScreen';


const drawerNavigator = createDrawerNavigator();
const stackNavigator=createStackNavigator();
const tabNavigator=createBottomTabNavigator();

const RunTrackerNavigator=()=>{
return (
  <NavigationContainer>
    <drawerNavigator.Navigator screenOptions={{
      swipeEnabled: false
    }}>
     <drawerNavigator.Screen name="Home" component={RunTrackerTabNavigator}/>
    </drawerNavigator.Navigator>
  </NavigationContainer>
  );
};

const RunTrackerStackNavigator=({navigation, route})=>{
return (
  <stackNavigator.Navigator screenOptions={{gestureEnabled: false}}>
     <stackNavigator.Screen name="Home" component={RunTrackerHomeScreen} 
    options={{
      tabBarVisible: false,
      title: 'Runner Home',
      headerLeft: ()=>{
        return (
          <View styles={styles.person}>
           <TouchableOpacity onPress={()=>navigation.toggleDrawer()}>
            <Ionicons name="ios-person" size={40} color='grey'/>
           </TouchableOpacity>
          </View>
        );
     } 
    }}/>
     <stackNavigator.Screen name="History" component={RunHistoryScreen} 
    options={{
      title: 'Wall of Fame'
    }}/>
    <stackNavigator.Screen name="LiveRunTracker" component={LiveRunTracker} 
    options={{
    headerShown: false
    }}/>
    <stackNavigator.Screen name="RunDetailsScreen" component={RunDetailsScreen}
    options={{
    title: 'Run Details',
    headerLeft: null
  }}/>
  </stackNavigator.Navigator>
  );
};

const RunTrackerHistoryStackNavigator=({navigation, route})=>{
return (
  <stackNavigator.Navigator screenOptions={{gestureEnabled: false}}>
     <stackNavigator.Screen name="History" component={RunHistoryScreen} 
    options={{
      title: 'Wall of Fame'
    }}/>
  </stackNavigator.Navigator>
  );
};

const RunTrackerTabNavigator=({navigation, route})=>{
return (
   <tabNavigator.Navigator 
    screenOptions={(screenRoute) => ({
          tabBarVisible: route.state&&screenRoute.name==='Home'&&
          route.state.routes[route.state.index].state
          &&route.state.routes[route.state.index].state.index===1?false:true,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (screenRoute.route.name === 'Home') {
              iconName = focused
                ? Platform.OS === 'android'?'md-home':'ios-home'
                : Platform.OS === 'android'?'md-home':'ios-home';
            } else if (screenRoute.route.name === 'History') {
              iconName = focused 
                         ? Platform.OS === 'android'?'md-stats':'ios-stats' 
                         : Platform.OS === 'android'?'md-stats':'ios-stats';
            }
            return <Ionicons name={iconName} size={25} color={color} />;
          },
        })}

        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray'
        }}
    >
      <tabNavigator.Screen name="Home" component={RunTrackerStackNavigator} />
      <tabNavigator.Screen name="History" component={RunTrackerHistoryStackNavigator} />
    </tabNavigator.Navigator>
 );
};


const drawerView=({navigation})=>{
 return (
     <View styles={styles.person}>
      <TouchableOpacity onPress={()=>navigation.toggleDrawer()}>
       <Ionicons name="ios-person" size={40} color='grey'/>
      </TouchableOpacity>
     </View>
 );
};

const styles = StyleSheet.create({
 person: {
   left: 10
 }
});

export default RunTrackerNavigator;

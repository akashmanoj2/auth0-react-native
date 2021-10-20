/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WebLogin from './screens/WebLogin';
import MobileLogin from './screens/MobileLogin';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'SMS') {
              iconName = 'sms';
            } else if (route.name === 'Web') {
              iconName = 'open-in-browser';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
        initialRouteName="Web">
        <Tab.Screen name="Web" component={WebLogin} />
        <Tab.Screen name="SMS" component={MobileLogin} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

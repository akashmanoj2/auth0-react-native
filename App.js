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
import FirebaseLogin from './screens/FirebaseLogin';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'Autho0 SMS') {
              iconName = 'sms';
            } else if (route.name === 'Auth0 Web') {
              iconName = 'open-in-browser';
            } else if (route.name === 'Firebase') {
              iconName = 'local-fire-department';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
        initialRouteName="Auth0 Web">
        <Tab.Screen name="Auth0 Web" component={WebLogin} />
        <Tab.Screen name="Autho0 SMS" component={MobileLogin} />
        <Tab.Screen name="Firebase" component={FirebaseLogin} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

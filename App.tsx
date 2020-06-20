import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import { NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import { StyleSheet, View, Image} from 'react-native';
import { Text, Button } from 'react-native-elements';
import Main from './src/screens/Main'
import Generator from './src/screens/Generator'
import Leaderboard from './src/screens/Leaderboard';
//import { AppLoading } from 'expo';
//import Modal from 'react-native-modal'

export type RootStackParamList = {
  Generator: {};
  Leaderboard: {};
  Main: {};
};

export const navigationRef = React.createRef<NavigationContainerRef>();

const Stack = createStackNavigator<RootStackParamList>();

interface State {
}

interface Props {

}

export default class App extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
        showAbout: false
      }
  }

  public render() {
    return  (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Main" component={Main} options={{headerTitle: () => 
              <Text style= {styles.headerTextStyles}>LOAF</Text>}}  />
            <Stack.Screen name="Generator" component={Generator} options={{headerTitle: () => 
              <Text style= {styles.headerTextStyles}>Generator</Text>}}  />
          <Stack.Screen name="Leaderboard" component={Leaderboard} options={{headerTitle: () => 
              <Text style= {styles.headerTextStyles}>Leaderboard</Text>}}  />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
  },
  headerTextStyles: {
    fontFamily:'Nathaniel19-Regular', 
    color: 'black',
    fontWeight: '800',
    fontSize: 20
  }
});

import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Button } from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

//interface Props extends NavigationInjectedProps {}

type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

type Props = {
    route: MainScreenRouteProp;
    navigation: MainScreenNavigationProp;
  };

interface State {
}

class Main extends React.Component<Props, State> { 
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
      }
  }

    public render() {
        return (
          <View style={styles.parentContainer}>
              <Button
                titleStyle= {styles.buttonTitleStyle}
                buttonStyle= {styles.img}
                title={'Generator'}
                onPress={() => this.props.navigation.navigate('Generator')}>
              </Button>
              <Button
                titleStyle= {styles.buttonTitleStyle}
                buttonStyle= {styles.img}
                title={'Leaderboard'}
                onPress={() => this.props.navigation.navigate('Leaderboard')}>
              </Button>
            </View>
        )
    }    
}

export default Main;

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  img: {
    alignSelf:'center', 
    marginVertical:12, 
    width:200,
    //flex:1,
  },
  buttonTitleStyle: {
    fontFamily:'aAlloyInk', 
  }
});